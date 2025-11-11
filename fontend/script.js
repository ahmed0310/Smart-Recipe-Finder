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

	// Call backend to generate recipes via Gemini
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
		// On API failure, show fallback recipes
		const fallbackRecipes = [
			{
				recipe_title: "Classic Spaghetti Carbonara",
				recipe_text: "Cook spaghetti. Fry pancetta. Mix eggs and cheese. Combine with pasta. Serve hot.",
				time: 20,
				servings: 4,
				tags: ["Italian", "Pasta", "Quick"]
			},
			{
				recipe_title: "Chicken Caesar Salad",
				recipe_text: "Grill chicken. Toss romaine lettuce with dressing, croutons, and parmesan. Top with chicken.",
				time: 15,
				servings: 2,
				tags: ["Salad", "Healthy", "Protein"]
			},
			{
				recipe_title: "Vegetable Stir Fry",
				recipe_text: "Chop vegetables. Heat oil in wok. Stir fry veggies with soy sauce and garlic. Serve over rice.",
				time: 25,
				servings: 3,
				tags: ["Vegetarian", "Asian", "Quick"]
			},
			{
				recipe_title: "Chocolate Chip Cookies",
				recipe_text: "Cream butter and sugar. Add eggs and vanilla. Mix in flour and chocolate chips. Bake at 350°F for 10-12 minutes.",
				time: 30,
				servings: 24,
				tags: ["Dessert", "Baking", "Sweet"]
			}
		];
		try {
			localStorage.setItem('lastResults', JSON.stringify(fallbackRecipes));
			localStorage.setItem('lastQuery', JSON.stringify({ ingredients, diet }));
			localStorage.setItem('apiFailed', 'true');
		} catch {}
		window.location.href = './Search_Results/search_results.html';
	});

}
