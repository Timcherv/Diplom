// Функция отрисовки календаря
function renderCalendar(year, month) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    let html = `
        <div class="calendar-header">
            <button id="prevMonth">&lt;</button>
            <span>${monthNames[month]} ${year}</span>
            <button id="nextMonth">&gt;</button>
        </div>
        <div class="calendar-weekdays">
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="calendar-days">
    `;

    for (let i = 0; i < startingWeekday; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        let classes = 'calendar-day';
        if (isCurrentMonth && d === today.getDate()) {
            classes += ' today';
        }
        if (getHolidayForDate(date)) {
            classes += ' holiday';
        }
        html += `<div class="${classes}">${d}</div>`;
    }

    html += '</div><div class="calendar-legend">';
    html += '<div class="legend-item"><div class="legend-color today"></div><span>Сегодня</span></div>';
    html += '<div class="legend-item"><div class="legend-color holiday"></div><span>Праздник</span></div>';
    html += '</div>';

    calendarEl.innerHTML = html;

    document.getElementById('prevMonth')?.addEventListener('click', () => {
        let newYear = year;
        let newMonth = month - 1;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        renderCalendar(newYear, newMonth);
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
        let newYear = year;
        let newMonth = month + 1;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        renderCalendar(newYear, newMonth);
    });
}

// Основная логика после загрузки страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

    // --- Календарь ---
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());

    // --- Блок "Сейчас в сезоне" ---
    const seasonalProducts = getSeasonalProducts();
    const productsGrid = document.getElementById('products-grid');
    if (seasonalProducts.length) {
        productsGrid.innerHTML = seasonalProducts.slice(0, 4).map(product => `
            <div class="card">
                <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.title)}" alt="${product.title}">
                <div class="card-content">
                    <h3>${product.title}</h3>
                    <p>${product.description ? product.description.substring(0, 80) + '…' : ''}</p>
                    <a href="product.html?id=${product.id}" class="btn">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        productsGrid.innerHTML = '<p>В этом сезоне нет продуктов. Загляните позже!</p>';
    }

    // --- Блок "Случайные рецепты" ---
    const randomRecipes = getRandomRecipes(4);
    const recipesGrid = document.getElementById('recipes-grid');
    if (randomRecipes.length) {
        recipesGrid.innerHTML = randomRecipes.map(recipe => `
            <div class="card">
                <img src="${recipe.image_url || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(recipe.title)}" alt="${recipe.title}">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.ingredients ? recipe.ingredients.substring(0, 60) + '…' : ''}</p>
                    <div class="meta">
                        <span>⏱ ${recipe.cooking_time || '?'} мин</span>
                        <span class="badge ${recipe.budget_level === 'бюджетный' ? 'budget' : (recipe.budget_level === 'средний' ? 'medium' : 'expensive')}">
                            ${recipe.budget_level || 'средний'}
                        </span>
                    </div>
                    <a href="recipe.html?id=${recipe.id}" class="btn">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        recipesGrid.innerHTML = '<p>Нет рецептов для отображения</p>';
    }
});