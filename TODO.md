# TODO: Implement Bookmark Toggle for Saving/Unsaving Recipes

## Tasks
- [x] Add DELETE route in backend/server.js for /favourites/:favourite_id to unsave recipes
- [x] Modify fontend/Search_Results/search_results.js to toggle bookmark icon, handle save (POST) and unsave (DELETE), display success/error messages, store favourite_id on save
- [x] Fix bookmark state persistence: Fetch user's favourites on page load to correctly show saved/unsaved state
- [x] Test the bookmark functionality: Run server, bookmark a recipe, check if saved in DB and shown in saved recipes, unbookmark and verify removal
- [x] Fix saved recipes page to only show recipes from database, not static fallback
- [x] Add authentication check to saved recipes page: redirect to login if not logged in, redirect back after login

## Notes
- Backend already has POST /favourites and GET /favourites/:user_id
- Saved recipes page loads from backend automatically
- Use alert or better UI for messages (e.g., toast notifications if available)
- DELETE route was returning 404 due to route order; swapped DELETE before GET to prioritize it
- Added fetching favourites on page load to set bookmark states correctly
- Removed static recipes fallback in filterData to ensure only database recipes are displayed
- Added checkAuth function to redirect unauthenticated users to login page with redirect back
