document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    function showMessage(type, text) {
        let msg = document.getElementById('success-message');
        let err = document.getElementById('error-message');
        if (msg) msg.remove();
        if (err) err.remove();
        setTimeout(() => {
            let div = document.createElement('div');
            div.id = type === 'success' ? 'success-message' : 'error-message';
            div.style.color = type === 'success' ? 'green' : 'red';
            div.style.marginTop = '1em';
            div.style.textAlign = 'center';
            div.textContent = text;
            form.appendChild(div);
        }, 500);
    }
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            // Check if all fields are filled
            const fullName = document.getElementById('full-name').value.trim();
            const email = emailInput.value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            // Custom validation
            if (!fullName || !email || !password || !confirmPassword) {
                showMessage('error', 'Please fill in all fields.');
                return;
            }

            // Email format validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showMessage('error', 'Please enter a valid email address.');
                return;
            }
            // Password requirements
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordPattern.test(password)) {
                showMessage('error', 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
                return;
            }
            if (password !== confirmPassword) {
                showMessage('error', 'Passwords do not match.');
                return;
            }
            if (!passwordPattern.test(confirmPassword)) {
                showMessage('error', 'Confirm Password must meet the same requirements as Password.');
                return;
            }

            showMessage('success', 'Sign up successful!');
            console.log({ fullName, email, password });  // Check these values
        });
    }
});