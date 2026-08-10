const TODOS_API_URL = 'http://localhost:8081/todos'; // Puerto de tu todos-service

const token = localStorage.getItem('jwt_token');

// Si no hay token, blindar la vista y regresar al login
if (!token) {
    window.location.href = 'index.html';
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function fetchTodos() {
    try {
        const response = await fetch(TODOS_API_URL, { headers: getHeaders() });
        
        if (response.status === 401 || response.status === 403) {
            // Token expirado o inválido
            localStorage.removeItem('jwt_token');
            window.location.href = 'index.html';
            return;
        }

        const todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        console.error("Error al conectar con el microservicio de TODOs (Quizás el servicio de login cayó, pero el de TODOs sigue operando):", error);
    }
}

function renderTodos(todos) {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-3 bg-gray-50 border rounded-md shadow-sm";
        li.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id}, ${!todo.completed})" class="w-4 h-4 text-blue-600 rounded">
                <span class="${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}">${todo.title}</span>
            </div>
            <button onclick="deleteTodo(${todo.id})" class="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
        `;
        todoList.appendChild(li);
    });
}

document.getElementById('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value;

    try {
        const response = await fetch(TODOS_API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title, description: "" })
        });

        if (response.ok) {
            document.getElementById('todoTitle').value = '';
            fetchTodos();
        }
    } catch (error) {
        console.error("Error creando tarea", error);
    }
});

async function deleteTodo(id) {
    try {
        const response = await fetch(`${TODOS_API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (response.ok) fetchTodos();
    } catch (error) {
        console.error("Error eliminando tarea", error);
    }
}

async function toggleTodo(id, completed) {
    try {
        await fetch(`${TODOS_API_URL}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ completed })
        });
        fetchTodos();
    } catch (error) {
        console.error("Error actualizando tarea", error);
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('jwt_token');
    window.location.href = 'index.html';
});

// Inicializar carga de tareas
fetchTodos();