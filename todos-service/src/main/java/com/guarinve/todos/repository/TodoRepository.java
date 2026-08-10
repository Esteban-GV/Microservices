package com.guarinve.todos.repository;

import com.guarinve.todos.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUsernameOrderByCreatedAtDesc(String username);
    Optional<Todo> findByIdAndUsername(Long id, String username);
}
