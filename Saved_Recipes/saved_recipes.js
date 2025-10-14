 // Data set (sample)
 const RECIPES = [
    { id: 1,  title: "Classic Spaghetti Carbonara", desc: "Creamy Italian pasta dish with eggs, cheese, pancetta and black pepper.", time: 25, servings: 4, tags: ["Italian","Pasta"] },
    { id: 2,  title: "Chicken Tikka Masala", desc: "Tender chicken in a creamy tomato-based sauce with aromatic spices.", time: 40, servings: 6, tags: ["Indian","Chicken"] },
    { id: 3,  title: "Avocado Toast with Poached Eggs", desc: "Healthy breakfast option with creamy avocado and perfectly poached eggs.", time: 15, servings: 2, tags: ["Healthy","Breakfast"] },
    { id: 4,  title: "Chocolate Chip Cookies", desc: "Classic homemade cookies with buttery texture and melty chocolate chips.", time: 30, servings: 24, tags: ["Dessert","Baking"] },
    { id: 5,  title: "Caesar Salad", desc: "Fresh romaine lettuce with homemade croutons and creamy Caesar dressing.", time: 15, servings: 4, tags: ["Salad","Vegetarian"] },
    { id: 6,  title: "Beef Tacos", desc: "Authentic Mexican tacos with seasoned ground beef and fresh toppings.", time: 20, servings: 6, tags: ["Mexican","Beef"] },
    { id: 7,  title: "Vegetable Stir Fry", desc: "Quick and healthy vegetable stir fry with tofu and soy sauce.", time: 15, servings: 2, tags: ["Asian","Vegetarian"] },
    { id: 8,  title: "Berry Smoothie Bowl", desc: "Refreshing smoothie bowl topped with fresh fruits and granola.", time: 10, servings: 1, tags: ["Breakfast","Healthy"] },
    { id: 9,  title: "Shrimp Fried Rice", desc: "Savory rice stir-fried with shrimp, eggs, peas and carrots.", time: 20, servings: 4, tags: ["Asian","Seafood"] },
    { id:10,  title: "Greek Salad", desc: "Crisp vegetables, feta cheese, olives and simple vinaigrette.", time: 12, servings: 4, tags: ["Salad","Mediterranean"] },
    { id:11,  title: "Veggie Omelette", desc: "Fluffy omelette packed with seasonal vegetables.", time: 10, servings: 1, tags: ["Breakfast","Vegetarian"] },
    { id:12,  title: "Lemon Garlic Salmon", desc: "Baked salmon with lemon, garlic and herbs.", time: 18, servings: 2, tags: ["Seafood","Healthy"] }
  ];

  // Pagination / state
  const PAGE_SIZE = 8;
  let currentPage = 1;
  let currentQuery = "";

  // Bookmarks (persisted)
  const BOOKMARK_KEY = "savedBookmarks";
  function loadBookmarks() {
    try {
      return new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"));
    } catch { return new Set(); }
  }
  function saveBookmarks(set) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...set]));
  }
  const bookmarks = loadBookmarks();

  // Elements
  const gridEl = document.getElementById("recipesGrid");
  const paginationEl = document.getElementById("pagination");
  const searchInput = document.getElementById("searchInput");

  function filterData(query) {
    if (!query) return RECIPES;
    const q = query.toLowerCase().trim();
    return RECIPES.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  function formatMinutes(mins) {
    return `${mins} mins`;
  }

  function tagBadge(tag) {
    // Keep colors within palette: green (default), gray, yellow accent
    const lower = tag.toLowerCase();
    const base = 'badge badge-soft me-1 mb-1';
    if (["dessert","baking","beef","seafood"].includes(lower)) return `<span class="${base} gray">${tag}</span>`;
    if (["breakfast","pasta","mexican"].includes(lower)) return `<span class="${base} yellow">${tag}</span>`;
    return `<span class="${base}">${tag}</span>`;
  }

  function renderCards(data, page) {
    gridEl.innerHTML = "";
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = data.slice(start, start + PAGE_SIZE);

    if (pageItems.length === 0) {
      gridEl.innerHTML = `
        <div class="col-12">
          <div class="alert alert-light border text-center" role="status">
            No recipes found. Try a different search.
          </div>
        </div>`;
      return;
    }

    for (const r of pageItems) {
      const isBookmarked = bookmarks.has(r.id);
      const card = document.createElement("div");
      card.className = "col-12 col-sm-6 col-lg-4 col-xl-3";
      card.innerHTML = `
        <article class="recipe-card h-100 position-relative">
          <button class="bookmark-btn ${isBookmarked ? "active":""}" aria-label="${isBookmarked ? "Remove bookmark":"Save bookmark"}" data-id="${r.id}">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"></path>
            </svg>
          </button>
          <div class="ratio ratio-16x9 placeholder-media" role="img" aria-label="Recipe image placeholder"></div>
          <div class="p-3">
            <h2 class="h6 mb-1">${r.title}</h2>
            <p class="text-secondary small mb-2">${r.desc}</p>
            <div class="meta mb-2">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22A10 10 0 1 1 12 2a10 10 0 0 1 0 20m1-10.59V7h-2v6h6v-2z"/></svg>
                ${formatMinutes(r.time)}
              </span>
              <span class="dot"></span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5 14.57 12 16.5 12m-9 0C9.43 12 11 10.43 11 8.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12m0 2C4.92 14 0 15.29 0 17.86V20h15v-2.14c0-2.57-4.92-3.86-7.5-3.86m9 0c-.29 0-.62.02-.97.06 1.16.84 1.97 1.93 1.97 3.94V20H24v-2.14c0-2.57-4.92-3.86-7.5-3.86z"/></svg>
                ${r.servings} ${r.servings === 1 ? "serving" : "servings"}
              </span>
            </div>
            <div class="d-flex flex-wrap">
              ${r.tags.map(tagBadge).join("")}
            </div>
          </div>
        </article>
      `;
      gridEl.appendChild(card);
    }

    // Wire bookmark buttons
    gridEl.querySelectorAll(".bookmark-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        if (bookmarks.has(id)) bookmarks.delete(id); else bookmarks.add(id);
        saveBookmarks(bookmarks);
        btn.classList.toggle("active");
        btn.setAttribute("aria-label", bookmarks.has(id) ? "Remove bookmark" : "Save bookmark");
      });
    });
  }

  function renderPagination(total, page) {
    paginationEl.innerHTML = "";
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return;

    const createItem = (label, goTo, disabled=false, active=false, aria) => {
      const li = document.createElement("li");
      li.className = `page-item ${disabled ? "disabled":""} ${active ? "active":""}`;
      const a = document.createElement("button");
      a.className = "page-link";
      a.type = "button";
      a.textContent = label;
      if (aria) a.setAttribute("aria-label", aria);
      if (!disabled) a.addEventListener("click", () => update(goTo));
      li.appendChild(a);
      return li;
    };

    paginationEl.appendChild(createItem("«", page-1, page===1, false, "Previous page"));

    for (let p=1; p<=pages; p++) {
      paginationEl.appendChild(createItem(String(p), p, false, p===page, `Page ${p}`));
    }

    paginationEl.appendChild(createItem("»", page+1, page===pages, false, "Next page"));
  }

  function update(nextPage = currentPage, query = currentQuery) {
    currentPage = nextPage;
    currentQuery = query;
    const filtered = filterData(currentQuery);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    // keep page in bounds
    if (currentPage > pages) currentPage = pages;
    renderCards(filtered, currentPage);
    renderPagination(total, currentPage);
  }

  // Search interactions
  searchInput.addEventListener("input", (e) => {
    update(1, e.target.value);
  });

  // Initial render
  update(1, "");

  // Keyboard accessibility for search: Enter focuses grid
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const firstCard = document.querySelector("#recipesGrid article");
      if (firstCard) firstCard.focus?.();
    }
  });