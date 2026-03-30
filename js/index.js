function renderCalendar(year, month) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Пн = 0, Вс = 6

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

    // Пустые ячейки до первого дня
    for (let i = 0; i < startingWeekday; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Ячейки дней месяца
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

    html += '</div>';

    // Легенда
    html += `
        <div class="calendar-legend">
            <div class="legend-item">
                <div class="legend-color today"></div>
                <span>Сегодня</span>
            </div>
            <div class="legend-item">
                <div class="legend-color holiday"></div>
                <span>Праздник</span>
            </div>
        </div>
    `;

    calendarEl.innerHTML = html;

    // Обработчики для переключения месяцев
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

// Вызов после загрузки данных
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();

    // Определяем и применяем сезон для body
    const seasons = ['winter', 'spring', 'summer', 'autumn'];
    // Удаляем все возможные сезонные классы, чтобы не наслаивались
    document.body.classList.remove(...seasons);
    const currentSeason = getCurrentSeason();
    document.body.classList.add(currentSeason);

   
    const heroSection = document.getElementById('current-holiday');
    const titleElem = document.getElementById('holiday-title');
    const descElem = document.getElementById('holiday-description');
    const linkElem = document.getElementById('holiday-link');

    const currentHoliday = getCurrentHoliday();
if (currentHoliday) {
    titleElem.textContent = currentHoliday.title;
    descElem.textContent = currentHoliday.short_desc;
    linkElem.href = `holiday.html?id=${currentHoliday.id}`;
    linkElem.textContent = 'Праздничные рецепты →';
} else {
    titleElem.textContent = 'Праздничные рецепты';
    descElem.textContent = 'Вдохновляйтесь рецептами к разным праздникам круглый год';
    linkElem.href = 'holidays.html';
    linkElem.textContent = 'Все праздники →';
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
                    <a href="recipe.html?id=${r.id}" class="btn" style="padding: 0.5rem 1rem;">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        recipesGrid.innerHTML = '<p>Нет рецептов для отображения</p>';
    }

    // Текущая дата для календаря
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

   // Сезонные продукты (показываем не более 4)
const seasonalProducts = getSeasonalProducts().slice(0, 4);
const productsGrid = document.getElementById('products-grid');

if (seasonalProducts.length) {
    productsGrid.innerHTML = seasonalProducts.map(product => `
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

    // 2. Случайные рецепты (4 штуки)
    const randomRecipes = getRandomRecipes(4);
    const recipesGrid = document.getElementById('recipes-grid');
    if (randomRecipes.length) {
        recipesGrid.innerHTML = randomRecipes.map(r => `
            <div class="card">
                <img src="${r.image_url || 'https://via.placeholder.com/300x200?text=' + r.title}" alt="${r.title}">
                <div class="card-content">
                    <h3>${r.title}</h3>
                    <p>${r.ingredients ? r.ingredients.substring(0, 60) + '…' : ''}</p>
                    <div class="meta">
                        </span>
                    </div>
                    <a href="recipe.html?id=${r.id}" class="btn">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        recipesGrid.innerHTML = '<p>Нет рецептов для отображения</p>';
    }
});