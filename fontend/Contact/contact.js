function handleSubmit(event) {
    event.preventDefault();
    
    // Get form data
	const formData = new FormData(event.target);
	const name = formData.get('name') || '';
	const email = formData.get('email') || '';
	const message = formData.get('message') || '';
	
	const API_BASE = (typeof window.API_BASE !== 'undefined' && window.API_BASE) ? window.API_BASE : 'http://localhost:3000';
	
	fetch(`${API_BASE}/contact`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, message })
	})
	.then(async (res) => {
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data.message || 'Failed to submit contact form');
		return data;
	})
	.then(() => {
		alert('Thank you for contacting us! We will get back to you soon.');
		event.target.reset();
	})
	.catch((err) => {
		alert(err.message || 'There was an error submitting the form.');
	});
}

function goBack() {
    window.history.back();
}

// Smooth scroll for navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close mobile menu when clicking a link
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            bootstrap.Collapse.getInstance(navbarCollapse).hide();
        }
    });
});

// Add smooth transitions to form inputs
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});