function toggleIngredient(checkbox) {
    if (checkbox.style.opacity === '0.5') {
        checkbox.style.opacity = '1';
        checkbox.nextElementSibling.style.textDecoration = 'none';
        checkbox.nextElementSibling.style.opacity = '1';
    } else {
        checkbox.style.opacity = '0.5';
        checkbox.nextElementSibling.style.textDecoration = 'line-through';
        checkbox.nextElementSibling.style.opacity = '0.6';
    }
}

// Populate page from selected recipe (if any)
(function populateRecipe() {
	try {
		const raw = localStorage.getItem('currentRecipe');
		if (!raw) return;
		const r = JSON.parse(raw);
		const title = r.recipe_title || r.title || 'Recipe';
		const desc = r.recipe_text || r.desc || '';
		const servings = r.servings ? `${r.servings} servings` : '';
		const total = r.time ? `${r.time} min` : '';
		document.title = `${title} - Recipe`;
		document.querySelector('.recipe-info h1').textContent = title;
		document.querySelector('.recipe-description').textContent = desc;
		// Update meta placeholders where present
		const metas = document.querySelectorAll('.recipe-meta .meta-item span');
		metas?.[1] && (metas[1].textContent = `Total: ${total || '—'}`);
		metas?.[2] && (metas[2].textContent = servings || '—');

		// Derive steps from recipe_text (split into sentences)
		const stepsWrap = document.querySelector('.method-steps');
		if (stepsWrap && desc) {
			stepsWrap.innerHTML = '';
			const sentences = desc.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 12);
			sentences.forEach((s, idx) => {
				const step = document.createElement('div');
				step.className = 'method-step';
				step.innerHTML = `
					<div class="step-number">${idx + 1}</div>
					<div class="step-content">
						<div class="step-title">Step ${idx + 1}</div>
						<div class="step-description">${s}</div>
					</div>
				`;
				stepsWrap.appendChild(step);
				if (idx < sentences.length - 1) {
					const line = document.createElement('div');
					line.className = 'step-line';
					stepsWrap.appendChild(line);
				}
			});
		}
	} catch {}
})();