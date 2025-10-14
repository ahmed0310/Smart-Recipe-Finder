function scrollToSearch() {
    document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

function searchRecipes(event) {
    event.preventDefault();
    const ingredients = document.getElementById('ingredients').value;
    const diet = document.getElementById('diet').value;
    
    alert(`Searching for recipes with:\nIngredients: ${ingredients}\nDiet: ${diet}`);
    // Here you would typically make an API call to fetch recipes based on the criteria
    window.location.href = './Search_Results/search_results.html'; // Navigate to search results page
    
}