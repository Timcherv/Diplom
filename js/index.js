function renderCalendar(year, month) {
    const container = document.getElementById('calendar');
    if (!container) return;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    let html = `<div class="calendar-header"><button id="prevMonth">&lt;</button><span>${monthNames[month]} ${year}</span><button id="nextMonth">&gt;</button></div>
                <div class="calendar-weekdays"><div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div></div>
                <div class="calendar-days">`;
    for (let i = 0; i < startWeekday; i++) html += '<div class="calendar-day empty"></div>';
    const today = new Date();
    const isCurMonth = today.getFullYear() === year && today.getMonth() === month;
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        let cls = 'calendar-day';
        if (isCurMonth && d === today.getDate()) cls += ' today';
        if (getHolidayForDate(date)) cls += ' holiday';
        html += `<div class="${cls}">${d}</div>`;
    }
    html += '</div><div class="calendar-legend"><div class="legend-item"><div class="legend-color today"></div><span>Сегодня</span></div><div class="legend-item"><div class="legend-color holiday"></div><span>Праздник</span></div></div>';
    container.innerHTML = html;
    document.getElementById('prevMonth')?.addEventListener('click', () => renderCalendar(year, month-1 < 0 ? year-1 : year, month-1 < 0 ? 11 : month-1));
    document.getElementById('nextMonth')?.addEventListener('click', () => renderCalendar(year, month+1 > 11 ? year+1 : year, month+1 > 11 ? 0 : month+1));
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
        hDesc.textContent = 'Вдохновляйтесь рецептами к разным праздникам круглый год';
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
                    <div class="meta">
                        <span>⏱ ${r.cooking_time || '?'} мин</span>
                        <span class="badge ${r.budget_level === 'бюджетный' ? 'budget' : (r.budget_level === 'средний' ? 'medium' : 'expensive')}">${r.budget_level || 'средний'}</span>
                    </div>
                    <a href="recipe.html?id=${r.id}" class="btn">Подробнее</a>
                </div>
            </div>
        `).join('');
    } else {
        recGrid.innerHTML = '<p>Нет рецептов для отображения</p>';
    }
});