package com.guarinve.todos.service;

import com.guarinve.todos.dto.TodoRequest;
import com.guarinve.todos.dto.TodoResponse;
import com.guarinve.todos.exception.TodoNotFoundException;
import com.guarinve.todos.model.Todo;
import com.guarinve.todos.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    // El username autenticado lo puso el JwtAuthenticationFilter en el SecurityContext,
    // extraído directamente del token, sin tocar ninguna base de datos de usuarios.
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public List<TodoResponse> getTodos() {
        return todoRepository.findByUsernameOrderByCreatedAtDesc(getCurrentUsername())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = Todo.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .username(getCurrentUsername())
                .build();

        return toResponse(todoRepository.save(todo));
    }

    public void deleteTodo(Long id) {
        Todo todo = todoRepository.findByIdAndUsername(id, getCurrentUsername())
                .orElseThrow(() -> new TodoNotFoundException("Todo no encontrado o no pertenece al usuario"));
        todoRepository.delete(todo);
    }

    public TodoResponse toggleComplete(Long id) {
        Todo todo = todoRepository.findByIdAndUsername(id, getCurrentUsername())
                .orElseThrow(() -> new TodoNotFoundException("Todo no encontrado o no pertenece al usuario"));
        todo.setCompleted(!todo.isCompleted());
        return toResponse(todoRepository.save(todo));
    }

    private TodoResponse toResponse(Todo todo) {
        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .description(todo.getDescription())
                .completed(todo.isCompleted())
                .createdAt(todo.getCreatedAt())
                .build();
    }
}
