document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

    const recipesContainer = document.getElementById('recipes-grid');
    const holidayFilter = document.getElementById('filter-holiday');
    const productFilter = document.getElementById('filter-product');
    const budgetFilter = document.getElementById('filter-budget');
    const applyFiltersBtn = document.getElementById('apply-filters');

    // Заполнение фильтров
    function populateFilters() {
        if (holidayFilter) {
            holidayFilter.innerHTML = '<option value="">Все праздники</option>' +
                holidays.map(h => `<option value="${h.id}">${h.title}</option>`).join('');
        }
        if (productFilter) {
            productFilter.innerHTML = '<option value="">Все продукты</option>' +
                products.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
        }
    }

    function filterRecipes() {
        let filtered = [...recipes];
        if (holidayFilter && holidayFilter.value) {
            filtered = filtered.filter(r => r.holiday_id == holidayFilter.value);
        }
        if (productFilter && productFilter.value) {
            filtered = filtered.filter(r => r.product_id == productFilter.value);
        }
        return filtered;
    }

    function renderRecipes(recipesArray) {
        if (recipesArray.length) {
            recipesContainer.innerHTML = recipesArray.map(r => `
                <div class="card">
                    <img src="${r.image_url || 'https://via.placeholder.com/300x200?text=' + r.title}" alt="${r.title}">
                    <div class="card-content">
                        <h3>${r.title}</h3>
                        <p>${r.ingredients ? r.ingredients.substring(0, 80) + '…' : ''}</p>
                        <a href="recipe.html?id=${r.id}" class="btn" style="padding: 0.5rem 1rem;">Подробнее</a>
                    </div>
                </div>
            `).join('');
        } else {
            recipesContainer.innerHTML = '<p>Рецепты не найдены</p>';
        }
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            renderRecipes(filterRecipes());
        });
    }

    populateFilters();
    renderRecipes(recipes); // изначально все рецепты

    // Если есть параметр recipe в URL — показать детали (можно сделать модальное окно или отдельную страницу)
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipe');
    if (recipeId) {
        alert('Детали рецепта с ID ' + recipeId + ' будут доступны в следующей версии');
    }
});