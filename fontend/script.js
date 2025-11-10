function scrollToSearch() {
    document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

// Backend API base URL
const API_BASE = 'http://localhost:3000';

function getCurrentUser() {
	try {
		const raw = localStorage.getItem('currentUser');
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function searchRecipes(event) {
    event.preventDefault();
    const ingredients = document.getElementById('ingredients').value;
    const diet = document.getElementById('diet').value;
    
	// Call backend to generate recipes via OpenAI
	fetch(`${API_BASE}/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ingredients, diet })
	})
	.then(async (res) => {
		const data = await res.json().catch(() => []);
		if (!res.ok) throw new Error(data.message || 'Failed to generate recipes');
		return data;
	})
	.then((recipes) => {
		try {
			localStorage.setItem('lastResults', JSON.stringify(recipes));
			localStorage.setItem('lastQuery', JSON.stringify({ ingredients, diet }));
		} catch {}
		window.location.href = './Search_Results/search_results.html';
	})
	.catch((err) => {
		alert(err.message || 'Something went wrong generating recipes.');
	});
    
}