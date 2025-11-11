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
		const apiFailed = localStorage.getItem('apiFailed') === 'true';
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

		// If API failed, show the message first
		if (apiFailed) {
			const alertDiv = document.createElement('div');
			alertDiv.className = 'col-12 mb-4';
			alertDiv.innerHTML = `
				<div class="alert alert-warning text-center" role="alert">
					<h5>Sorry, API is not available right now.</h5>
					<p>Here are some famous recipes you might enjoy:</p>
				</div>
			`;
			container.appendChild(alertDiv);
		}

		const user = getCurrentUser();
		let favourites = [];
		if (user && user.id) {
			// Fetch user's favourites to set bookmark states
			fetch(`${API_BASE}/favourites/${user.id}`)
				.then(res => res.json())
				.then(data => {
					favourites = data;
					renderCards();
				})
				.catch(() => renderCards()); // Proceed without favourites if fetch fails
		} else {
			renderCards();
		}

		function renderCards() {
			container.innerHTML = '';
			for (const r of items) {
				const title = r.recipe_title || 'Recipe';
				const desc = r.recipe_text || '';
				const time = r.time ? `${r.time} mins` : '';
				const servings = r.servings ? `${r.servings} servings` : '';
				const tags = Array.isArray(r.tags) ? r.tags : [];
				// Check if this recipe is favourited
				const fav = favourites.find(f => f.recipe_title === title && f.recipe_text === desc);
				const isSaved = !!fav;
				const favouriteId = fav ? fav.id : null;
				const card = document.createElement('div');
				card.className = 'col-lg-4 col-md-6';
				card.innerHTML = `
					<div class="recipe-card">
						<div class="recipe-image">
							<span>Image cap</span>
							<div class="bookmark-icon" ${favouriteId ? `data-favourite-id="${favouriteId}"` : ''}><i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i></div>
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
						localStorage.setItem('redirectAfterLogin', window.location.href);
						window.location.href = '../Login/login.html';
						return;
					}
					const isSaved = bookmark.classList.contains('fas');
					if (isSaved) {
						// Unsave
						const favouriteId = this.getAttribute('data-favourite-id');
						console.log('Unsave: favouriteId =', favouriteId);
						if (favouriteId) {
							fetch(`${API_BASE}/favourites/${favouriteId}`, {
								method: 'DELETE'
							}).then(res => {
								console.log('DELETE response status:', res.status);
								if (res.ok) {
									bookmark.classList.remove('fas');
									bookmark.classList.add('far');
									this.removeAttribute('data-favourite-id');
									alert('Recipe unsaved successfully!');
								} else {
									alert('Failed to unsave recipe.');
								}
							}).catch(err => {
								console.error('Error unsaving recipe:', err);
								alert('Error unsaving recipe.');
							});
						}
					} else {
						// Save
						fetch(`${API_BASE}/favourites`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								user_id: user.id,
								recipe_title: title,
								recipe_text: desc
							})
						}).then(async res => {
							if (res.ok) {
								const data = await res.json();
								bookmark.classList.remove('far');
								bookmark.classList.add('fas');
								this.setAttribute('data-favourite-id', data.favourite_id);
								alert('Recipe saved successfully!');
							} else {
								alert('Failed to save recipe.');
							}
						}).catch(() => alert('Error saving recipe.'));
					}
				});
				container.appendChild(card);
			}
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


