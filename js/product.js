document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) {
        document.getElementById('product-content').innerHTML = '<p>Продукт не указан</p>';
        return;
    }

    const product = products.find(p => p.id == productId);
    if (!product) {
        document.getElementById('product-content').innerHTML = '<p>Продукт не найден</p>';
        return;
    }

    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-description').textContent = product.description;
    if (product.image_url) {
        document.getElementById('product-image').src = product.image_url;
    }

    // Индикатор сезонности
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentMonth = new Date().getMonth() + 1;
    const { start, end } = product.season;
    let seasonHtml = '<div class="season-bars">';
    for (let i = 1; i <= 12; i++) {
        const inSeason = (start <= end) ? (i >= start && i <= end) : (i >= start || i <= end);
        const activeClass = inSeason ? 'active' : '';
        const isCurrent = (i === currentMonth) ? ' (сейчас)' : '';
        seasonHtml += `<div class="season-bar ${activeClass}" title="${months[i-1]}${isCurrent}">${months[i-1]}</div>`;
    }
    seasonHtml += '</div>';
    document.getElementById('product-season').innerHTML = seasonHtml;

    // Рецепты с этим продуктом
    const productRecipes = getRecipesForProduct(productId);
    const recipesGrid = document.getElementById('recipes-grid');
    if (productRecipes.length) {
        recipesGrid.innerHTML = productRecipes.map(r => `
            <div class="card">
                <img src="${r.image_url || 'https://via.placeholder.com/300x200?text=' + r.title}" alt="${r.title}">
                <div class="card-content">
                    <h3>${r.title}</h3>
                    <p>${r.ingredients ? r.ingredients.substring(0, 80) + '…' : ''}</p>
                    <a href="recipes.html?recipe=${r.id}" class="btn" style="padding: 0.5rem 1rem;">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        recipesGrid.innerHTML = '<p>Для этого продукта пока нет рецептов</p>';
    }
});