function viewRecipe(id) {
    alert('Viewing recipe #' + id);
    // Navigate to recipe detail page
}

// Backend API base URL and helpers
const API_BASE = 'http://localhost:3000';
function getCurrentUser() {
	try {
		const raw = localStorage.getItem('currentUser');
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

// Render dynamic results from last search
(function renderDynamicResults() {
	try {
		const container = document.querySelector('.results-section .row.g-4');
		const raw = localStorage.getItem('lastResults');
		if (!container || !raw) return;
		const items = JSON.parse(raw);
		if (!Array.isArray(items) || items.length === 0) {
			const qRaw = localStorage.getItem('lastQuery');
			let subtitle = '';
			try {
				const q = qRaw ? JSON.parse(qRaw) : null;
				if (q && (q.ingredients || q.diet)) {
					subtitle = `<p class="text-secondary">Search: ${q.ingredients || ''} · ${q.diet || ''}</p>`;
				}
			} catch {}
			container.innerHTML = `
				<div class="col-12">
					<div class="alert alert-light border text-center" role="status">
						No results yet. Please go back and try a different search.
					</div>
					<div class="text-center mt-2">${subtitle}</div>
				</div>
			`;
			return;
		}
		container.innerHTML = '';
		for (const r of items) {
			const title = r.recipe_title || 'Recipe';
			const desc = r.recipe_text || '';
			const time = r.time ? `${r.time} mins` : '';
			const servings = r.servings ? `${r.servings} servings` : '';
			const tags = Array.isArray(r.tags) ? r.tags : [];
			const card = document.createElement('div');
			card.className = 'col-lg-4 col-md-6';
			card.innerHTML = `
				<div class="recipe-card">
					<div class="recipe-image">
						<span>Image cap</span>
						<div class="bookmark-icon"><i class="far fa-bookmark"></i></div>
					</div>
					<div class="recipe-content">
						<h3 class="recipe-title">${title}</h3>
						<p class="recipe-description">${desc}</p>
						<div class="recipe-meta">
							<div class="meta-item">
								<i class="far fa-clock"></i>
								<span>${time}</span>
							</div>
							<div class="meta-item">
								<i class="fas fa-user"></i>
								<span>${servings}</span>
							</div>
						</div>
						<div class="recipe-tags">
							${tags.map(t => `<span class="recipe-tag">${t}</span>`).join('')}
						</div>
						<button class="btn-view-recipe">View Full Recipe</button>
					</div>
				</div>
			`;
			// Wire view button
			card.querySelector('.btn-view-recipe').addEventListener('click', () => {
				try { localStorage.setItem('currentRecipe', JSON.stringify(r)); } catch {}
				window.location.href = '../Recipe_Page/recipe_page.html';
			});
			// Wire bookmark
			const iconWrap = card.querySelector('.bookmark-icon');
			iconWrap.addEventListener('click', function() {
				const bookmark = this.querySelector('i');
				const user = getCurrentUser();
				if (!(user && user.id)) {
					alert('Please log in to save recipes.');
					window.location.href = '../Login/login.html';
					return;
				}
				bookmark.classList.remove('far');
				bookmark.classList.add('fas');
				fetch(`${API_BASE}/favourites`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: user.id,
						recipe_title: title,
						recipe_text: desc
					})
				}).catch(() => {});
			});
			container.appendChild(card);
		}
	} catch {}
})();

function changePage(pageNum) {
    // Update active state
    document.querySelectorAll('.pagination button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    alert('Loading page ' + pageNum);
}

function goBack() {
    window.history.back();
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

// Bookmark functionality + backend sync
document.querySelectorAll('.bookmark-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const bookmark = this.querySelector('i');
		const wasSaved = bookmark.classList.contains('fas');
		if (wasSaved) {
            bookmark.classList.remove('fas');
            bookmark.classList.add('far');
        } else {
            bookmark.classList.remove('far');
            bookmark.classList.add('fas');
			
			// On save, try syncing to backend favourites if user is logged in
			try {
				const user = getCurrentUser();
				if (user && user.id) {
					// Find nearby title/description to send
					const card = this.closest('.recipe-card');
					const title = card?.querySelector('.recipe-title')?.textContent?.trim() || 'Recipe';
					const desc = card?.querySelector('.recipe-description')?.textContent?.trim() || '';
					fetch(`${API_BASE}/favourites`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							user_id: user.id,
							recipe_title: title,
							recipe_text: desc
						})
					}).catch(() => {});
				}
			} catch {}
        }
    });
});