function renderCalendar(year, month) {
    const container = document.getElementById('calendar');
    if (!container) return;
    
    // Корректно вычисляем месяц: month может быть <0 или >11 (навигация)
    let fixedYear = year;
    let fixedMonth = month;
    if (fixedMonth < 0) {
        fixedMonth = 11;
        fixedYear -= 1;
    } else if (fixedMonth > 11) {
        fixedMonth = 0;
        fixedYear += 1;
    }

    const firstDay = new Date(fixedYear, fixedMonth, 1);
    const lastDay = new Date(fixedYear, fixedMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Для России неделя начинается с ПН, getDay: 0 - ВСК, 1 - ПН ...
    // startWeekday: 0 (ПН), 6 (ВС)
    let startWeekday = firstDay.getDay();
    if (startWeekday === 0) startWeekday = 6;
    else startWeekday = startWeekday - 1;

    const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    let html = `
        <div class="calendar-header">
            <button id="prevMonth">&lt;</button>
            <span>${monthNames[fixedMonth]} ${fixedYear}</span>
            <button id="nextMonth">&gt;</button>
        </div>
        <div class="calendar-weekdays">
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="calendar-days">
    `;

    // Добавляем пустые ячейки в начале, чтобы месяц начинался с нужного дня недели
    for (let i = 0; i < startWeekday; i++) html += '<div class="calendar-day empty"></div>';

    const today = new Date();
    const isCurMonth = today.getFullYear() === fixedYear && today.getMonth() === fixedMonth;

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(fixedYear, fixedMonth, d);
        let cls = 'calendar-day';
        if (isCurMonth && d === today.getDate()) cls += ' today';
        if (typeof getHolidayForDate === 'function' && getHolidayForDate(date)) cls += ' holiday';
        html += `<div class="${cls}">${d}</div>`;
    }
    html += `</div>
        <div class="calendar-legend">
            <div class="legend-item"><div class="legend-color today"></div><span>Сегодня</span></div>
            <div class="legend-item"><div class="legend-color holiday"></div><span>Праздник</span></div>
        </div>
    `;

    container.innerHTML = html;

    document.getElementById('prevMonth')?.addEventListener('click', () =>
        renderCalendar(
            fixedMonth-1 < 0 ? fixedYear-1 : fixedYear,
            fixedMonth-1 < 0 ? 11 : fixedMonth-1
        )
    );
    document.getElementById('nextMonth')?.addEventListener('click', () =>
        renderCalendar(
            fixedMonth+1 > 11 ? fixedYear+1 : fixedYear,
            fixedMonth+1 > 11 ? 0 : fixedMonth+1
        )
    );
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());

    // Текущий праздник / ссылка
    const curHol = getCurrentHoliday();
    const hero = document.getElementById('current-holiday');
    const hTitle = document.getElementById('holiday-title');
    const hDesc = document.getElementById('holiday-description');
    const hLink = document.getElementById('holiday-link');
    if (curHol) {
        hTitle.textContent = curHol.title;
        hDesc.textContent = curHol.short_desc || (curHol.description?.substring(0,100) || '');
        hLink.href = `holiday.html?id=${curHol.id}`;
        hLink.textContent = 'Праздничные рецепты →';
    } else {
        hTitle.textContent = 'Праздничные рецепты';
        hDesc.textContent = 'Похоже, сегодня нет праздника, но вы можете посмотреть когда будет следующий.';
        hLink.href = 'holidays.html';
        hLink.textContent = 'Все праздники →';
    }

    // Сезонные продукты
    const seasonal = getSeasonalProducts();
    const prodGrid = document.getElementById('products-grid');
    if (seasonal.length) {
        prodGrid.innerHTML = seasonal.slice(0,4).map(p => `
            <div class="card">
                <img src="${p.image_url || 'https://via.placeholder.com/300x200?text='+encodeURIComponent(p.title)}" alt="${p.title}">
                <div class="card-content">
                    <h3>${p.title}</h3>
                    <p>${p.description?.substring(0,80) || ''}</p>
                    <a href="product.html?id=${p.id}" class="btn">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        prodGrid.innerHTML = '<p>В этом сезоне нет продуктов. Загляните позже!</p>';
    }

    // Случайные рецепты
    const randRec = getRandomRecipes(4);
    const recGrid = document.getElementById('recipes-grid');
    if (randRec.length) {
        recGrid.innerHTML = randRec.map(r => `
            <div class="card">
                <img src="${r.image_url || 'https://via.placeholder.com/300x200?text='+encodeURIComponent(r.title)}" alt="${r.title}">
                <div class="card-content">
                    <h3>${r.title}</h3>
                    <p>${r.ingredients?.substring(0,60) || ''}</p>
                    <a href="recipe.html?id=${r.id}" class="btn">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        recGrid.innerHTML = '<p>Нет рецептов для отображения</p>';
    }
});