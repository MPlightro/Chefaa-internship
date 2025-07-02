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

        form.addEventListener('submit', async function(event) {
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

            // Show loading spinner/message
            function showLoading() {
                let loading = document.getElementById('loading-message');
                if (!loading) {
                    loading = document.createElement('div');
                    loading.id = 'loading-message';
                    loading.style.color = '#007bff';
                    loading.style.marginTop = '1em';
                    loading.style.textAlign = 'center';
                    loading.innerHTML = `<span style="display:inline-block;width:1.2em;height:1.2em;border:2px solid #007bff;border-radius:50%;border-top:2px solid transparent;animation:spin 1s linear infinite;vertical-align:middle;margin-right:8px;"></span>Signing up...`;
                    form.appendChild(loading);
                    // Add spinner animation
                    const style = document.createElement('style');
                    style.innerHTML = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
                    loading.appendChild(style);
                }
            }
            function hideLoading() {
                let loading = document.getElementById('loading-message');
                if (loading) loading.remove();
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

            // Initialize Firebase if not already initialized
            if (!window.firebaseAppInitialized) {
                // TODO: Replace with your Firebase config
                const firebaseConfig = {
                    apiKey: "AIzaSyD4ELmhDrKxLsIPG6adpHjrtFu5Mv9x0as",
                    authDomain: "onthegoheal.firebaseapp.com",
                    databaseURL: "https://onthegoheal-default-rtdb.firebaseio.com",
                    projectId: "onthegoheal",
                    storageBucket: "onthegoheal.firebasestorage.app",
                    messagingSenderId: "510301999577",
                    appId: "1:510301999577:web:8ab36bfc9c7b0ea6bd49c8",
                    measurementId: "G-3CNCE4EEN6"
                };
                firebase.initializeApp(firebaseConfig);
                window.firebaseAppInitialized = true;
            }

            // Generate custom ID: base64("example@example.com#00001")
            function formatEmailForId(email) {
                // Split by '.', capitalize first letter after each '.', then join without '.'
                return email
                    .split('.')
                    .map((part, idx) => {
                        if (idx === 0) return part.toLowerCase();
                        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                    })
                    .join('');
            }

            const usersRef = firebase.database().ref('formApp/users');
            let userCountSnapshot = await usersRef.once('value');
            let userCount = userCountSnapshot.numChildren() + 1;
            let paddedNumber = String(userCount).padStart(5, '0');
            let originalId = `${email}#${paddedNumber}`;
            let base64Id = btoa(originalId);

            // Encrypt function using CryptoJS AES
            function encryptField(value, key) {
                return CryptoJS.AES.encrypt(value, key).toString();
            }

            // Encrypt user info fields using base64Id as key
            const encryptedData = {
                id: originalId, // store the original (unencrypted) ID as a field
                fullName: encryptField(fullName, base64Id),
                email: encryptField(email, base64Id),
                password: encryptField(password, base64Id),
                createdAt: encryptField(new Date().toISOString(), base64Id)
            };

            // Show loading before async operation
            showLoading();

            // Push encrypted user info to Realtime Database with base64 ID as key
            usersRef.child(base64Id).set(encryptedData)
            .then(() => {
                hideLoading();
                showMessage('success', 'Sign up successful!');
            })
            .catch((error) => {
                hideLoading();
                let msg = error.message || 'Sign up failed.';
                showMessage('error', msg);
            });

            console.log({ fullName, email, password, originalId, base64Id, encryptedData });  // Check these values
        });
    }
});