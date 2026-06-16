// login.js - Admin Login Logic

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = sessionStorage.getItem('admin_token');
    if (token) {
        window.location.href = 'admin.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');
    const submitBtn = loginForm.querySelector('button');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const originalBtnText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        submitBtn.disabled = true;
        errorMsg.style.display = 'none';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameInput,
                    password: passwordInput
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Save token and redirect
                sessionStorage.setItem('admin_token', data.token);
                window.location.href = 'admin.html';
            } else {
                // Show error
                errorMsg.textContent = data.message || 'Invalid username or password.';
                errorMsg.style.display = 'block';
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMsg.textContent = 'Server error. Please make sure the backend is running.';
            errorMsg.style.display = 'block';
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
