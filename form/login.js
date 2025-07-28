document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElem = document.getElementById('login-error');
    errorElem.textContent = '';
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('userEmail', email);
        window.location.href = 'todo.html';
    } else {
        errorElem.textContent = result.error || 'Login failed.';
    }
}); 