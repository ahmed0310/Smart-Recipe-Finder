// auth.js — toggle navbar based on login status and handle logout
(function () {
	try {
		const raw = localStorage.getItem('currentUser');
		const user = raw ? JSON.parse(raw) : null;
		const nav = document.querySelector('.navbar .navbar-nav, header nav ul');
		if (!nav) return;
		// Find login/signup links
		nav.querySelectorAll('a').forEach(a => {
			const href = a.getAttribute('href') || '';
			if (user && user.id && (href.includes('Login/login.html') || href.includes('Sign_Up/sign_up.html'))) {
				// hide login/signup when logged in
				a.closest('li')?.classList?.add('d-none');
			}
		});
		// Add logout when logged in
		if (user && user.id && !nav.querySelector('[data-action="logout"]')) {
			const li = document.createElement('li');
			li.className = 'nav-item';
			const btn = document.createElement('a');
			btn.className = 'nav-link';
			btn.href = '#';
			btn.textContent = 'Logout';
			btn.setAttribute('data-action', 'logout');
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				try {
					localStorage.removeItem('currentUser');
				} catch {}
				window.location.href = './index.html'.includes('..') ? '../index.html' : './index.html';
			});
			li.appendChild(btn);
			nav.appendChild(li);
		}
	} catch {}
})();

