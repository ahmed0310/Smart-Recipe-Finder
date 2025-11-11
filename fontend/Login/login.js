        // Toggle password visibility
        function togglePasswordVisibility() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('togglePassword');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }

        // Email validation
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('emailError');

        emailInput.addEventListener('blur', function() {
            const email = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email) && email !== '') {
                emailError.textContent = 'Please enter a valid email address';
                emailError.classList.add('show');
                this.style.borderColor = '#dc3545';
            } else {
                emailError.classList.remove('show');
                this.style.borderColor = '#ddd';
            }
        });

        // Form submission
        function handleLogin(event) {
            event.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordError = document.getElementById('passwordError');
            
            // Basic validation
            if (!email || !password) {
                const loginContainer = document.querySelector('.login-container');
                loginContainer.classList.add('shake');
                setTimeout(() => loginContainer.classList.remove('shake'), 500);
                return;
            }
            
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Signing In...';
            
            const API_BASE = (typeof window.API_BASE !== 'undefined' && window.API_BASE) ? window.API_BASE : 'http://localhost:3000';
            
            fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.message || 'Login failed');
                return data;
            })
            .then((data) => {
                try {
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                } catch {}
                alert('Login successful! Welcome back.');
                // Check for redirect after login
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = '../index.html';
                }
            })
            .catch((err) => {
                passwordError.textContent = err.message || 'Login error';
                passwordError.classList.add('show');
            })
            .finally(() => {
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Sign In';
            });
        }

        // Close mobile menu when clicking a link
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    bootstrap.Collapse.getInstance(navbarCollapse).hide();
                }
            });
        });

        // Input focus animations
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.01)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Enter key support
        document.getElementById('password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        });