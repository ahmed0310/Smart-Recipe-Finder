function viewRecipe(id) {
    alert('Viewing recipe #' + id);
    // Navigate to recipe detail page
}

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

// Bookmark functionality
document.querySelectorAll('.bookmark-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const bookmark = this.querySelector('i');
        if (bookmark.classList.contains('fas')) {
            bookmark.classList.remove('fas');
            bookmark.classList.add('far');
        } else {
            bookmark.classList.remove('far');
            bookmark.classList.add('fas');
        }
    });
});