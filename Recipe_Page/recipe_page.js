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