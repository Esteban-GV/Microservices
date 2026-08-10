const AUTH_URL = 'http://localhost:8080/auth/login'; // Cambia el puerto/ruta según tu auth-service

// Si ya existe un token guardado en el navegador, redirigir directamente al TODOs
if (localStorage.getItem('jwt_token')) {
    window.location.href = 'todos.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Credenciales inválidas');

        const data = await response.json();
        // Asumiendo que el auth-service retorna un JSON con el token, ej: { token: "eyJhbG..." }
        const token = data.token || data.accessToken; 

        if (token) {
            localStorage.setItem('jwt_token', token);
            window.location.href = 'todos.html'; // Redirección al sistema de tareas
        } else {
            throw new Error('No se recibió el token');
        }
    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.classList.remove('hidden');
    }
});