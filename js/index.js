document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

    // Текущий праздник
    const currentHoliday = getCurrentHoliday();
    if (currentHoliday) {
        document.getElementById('holiday-title').textContent = currentHoliday.title;
        document.getElementById('holiday-description').textContent = 
            currentHoliday.short_desc || currentHoliday.description.substring(0, 100) + '…';
        document.getElementById('holiday-link').href = `holiday.html?id=${currentHoliday.id}`;
    } else {
        document.getElementById('current-holiday').style.display = 'none';
    }

    // Сезонные продукты (первые 4)
    const seasonalProducts = getSeasonalProducts().slice(0, 4);
    const productsGrid = document.getElementById('products-grid');
    if (seasonalProducts.length) {
        productsGrid.innerHTML = seasonalProducts.map(p => `
            <div class="card">
                <img src="${p.image_url || 'https://via.placeholder.com/300x200?text=' + p.title}" alt="${p.title}">
                <div class="card-content">
                    <h3>${p.title}</h3>
                    <p>${p.description ? p.description.substring(0, 60) + '…' : ''}</p>
                    <a href="product.html?id=${p.id}" class="btn" style="padding: 0.5rem 1rem;">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        productsGrid.innerHTML = '<p>Нет данных о сезонных продуктах</p>';
    }

    // Рецепты для вдохновения
    const randomRecipes = getRandomRecipes(4);
    const recipesGrid = document.getElementById('recipes-grid');
    if (randomRecipes.length) {
        recipesGrid.innerHTML = randomRecipes.map(r => `
            <div class="card">
                <img src="${r.image_url || 'https://via.placeholder.com/300x200?text=' + r.title}" alt="${r.title}">
                <div class="card-content">
                    <h3>${r.title}</h3>
                    <p>${r.ingredients ? r.ingredients.substring(0, 60) + '…' : ''}</p>
                    <a href="recipes.html?recipe=${r.id}" class="btn" style="padding: 0.5rem 1rem;">Смотреть</a>
                </div>
            </div>
        `).join('');
    } else {
        recipesGrid.innerHTML = '<p>Нет рецептов для отображения</p>';
    }
});