document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password // In production, hash this!
        })
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('userEmail', email);
        window.location.href = 'todo.html';
    } else if (response.status === 409) {
        alert(result.error);
        window.location.href = 'login.html';
    } else {
        alert(result.error);
    }
});