document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

    const urlParams = new URLSearchParams(window.location.search);
    const holidayId = urlParams.get('id');
    if (!holidayId) {
        document.getElementById('holiday-content').innerHTML = '<p>Праздник не указан</p>';
        return;
    }

    const holiday = holidays.find(h => h.id == holidayId);
    if (!holiday) {
        document.getElementById('holiday-content').innerHTML = '<p>Праздник не найден</p>';
        return;
    }

    document.getElementById('holiday-title').textContent = holiday.title;
    document.getElementById('holiday-description').textContent = holiday.description;
    if (holiday.image_url) {
        document.getElementById('holiday-image').src = holiday.image_url;
    }

    const holidayRecipes = getRecipesForHoliday(holidayId);
    const recipesGrid = document.getElementById('recipes-grid');
    if (holidayRecipes.length) {
        recipesGrid.innerHTML = holidayRecipes.map(r => `
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
        recipesGrid.innerHTML = '<p>Для этого праздника пока нет рецептов</p>';
    }
});