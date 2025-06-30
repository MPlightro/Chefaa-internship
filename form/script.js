document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        // Remove 'required' attributes and 'type=email' to disable browser validation
        document.getElementById('full-name').removeAttribute('required');
        const emailInput = document.getElementById('email');
        emailInput.removeAttribute('required');
        emailInput.setAttribute('type', 'text'); // Prevent browser email validation
        document.getElementById('password').removeAttribute('required');
        document.getElementById('confirm-password').removeAttribute('required');

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            // Check if all fields are filled
            const fullName = document.getElementById('full-name').value.trim();
            const email = emailInput.value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            // Remove any previous messages with delay before showing new one
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

            // Passwords match validation (higher priority than password requirements)
            if (password !== confirmPassword) {
                showMessage('error', 'Passwords do not match.');
                return;
            }

            // Password requirements
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordPattern.test(password)) {
                showMessage('error', 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
                return;
            }
            if (!passwordPattern.test(confirmPassword)) {
                showMessage('error', 'Confirm Password must meet the same requirements as Password.');
                return;
            }

            showMessage('success', 'Sign up successful!');

            // Send data to API
            fetch('https://16cbc52b-caad-4257-82ab-b39d5fc7dde2-00-1uero7o2me3fk.worf.replit.dev:5000/api/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        fullName,
                        email,
                        password
                    }
                })
            });
            console.log({ fullName, email, password });  // Check these values
        });
    }
});