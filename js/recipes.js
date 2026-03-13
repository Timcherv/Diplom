document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    document.body.classList.add(getCurrentSeason());

    const recipesContainer = document.getElementById('recipes-grid');
    const holidayFilter = document.getElementById('filter-holiday');
    const productFilter = document.getElementById('filter-product');
    const applyFiltersBtn = document.getElementById('apply-filters');

    // --- Модальное окно для рецепта ---
    // Создание разметки модального окна (один раз)
    let recipeModal = document.getElementById("recipe-modal");
    if (!recipeModal) {
        recipeModal = document.createElement('div');
        recipeModal.id = "recipe-modal";
        recipeModal.style.cssText = `
            display: none; 
            position: fixed; 
            top: 0; left: 0; 
            width: 100vw; height: 100vh; 
            background: rgba(0,0,0,0.4);
            justify-content: center; align-items: center; 
            z-index: 9999;
        `;
        recipeModal.innerHTML = `
            <div id="recipe-modal-content" style="
                background: #fff; 
                max-width: 500px; 
                width: 95%;
                border-radius: 14px; 
                padding: 2rem 1.5rem; 
                position: relative; 
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);">
                <button id="close-recipe-modal" style="
                    position:absolute;top:12px;right:18px;font-size:1.7rem;
                    background:none;border:none;cursor:pointer;color:#555;">×</button>
                <div id="recipe-modal-body"></div>
            </div>
        `;
        document.body.appendChild(recipeModal);

        // Закрытие по кнопке
        recipeModal.querySelector('#close-recipe-modal').addEventListener('click', () => {
            recipeModal.style.display = 'none';
            document.body.style.overflow = "";
        });

        // Закрытие по клику снаружи окна
        recipeModal.addEventListener('click', (e) => {
            if (e.target.id === "recipe-modal") {
                recipeModal.style.display = 'none';
                document.body.style.overflow = "";
            }
        });
    }

    // Заполнение селектов фильтра
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
                    <img src="${r.image_url || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(r.title)}" alt="${r.title}">
                    <div class="card-content">
                        <h3>${r.title}</h3>
                        <p>${r.ingredients ? (r.ingredients.length > 80 ? r.ingredients.substring(0, 80) + '…' : r.ingredients) : ''}</p>
                        <button 
                            class="btn view-recipe-details" 
                            data-recipe-id="${r.id}" 
                            style="padding: 0.5rem 1rem;">Подробнее</button>
                    </div>
                </div>
            `).join('');
        } else {
            recipesContainer.innerHTML = '<p>Рецепты не найдены</p>';
        }
    }

    // Показать детали рецепта в модальном окне
    function showRecipeDetails(recipeId) {
        const recipe = recipes.find(r => r.id == recipeId);
        if (!recipe) return;

        let product = products.find(p => p.id == recipe.product_id);
        let holiday = holidays.find(h => h.id == recipe.holiday_id);

        const modalBody = document.getElementById('recipe-modal-body');
        modalBody.innerHTML = `
            <h2 style="margin-top:0">${recipe.title}</h2>
            ${recipe.image_url ? `<img src="${recipe.image_url}" alt="" style="max-width:100%;border-radius:10px;margin-bottom:1rem;">` : ""}
            ${recipe.subtitle ? `<div class="modal-subtitle" style="margin-bottom:10px;color:#888">${recipe.subtitle}</div>` : ""}
            ${product ? `<div style="margin-bottom:8px;"><strong>Продукт:</strong> ${product.title}</div>` : ""}
            ${holiday ? `<div style="margin-bottom:8px;"><strong>Праздник:</strong> ${holiday.title}</div>` : ""}
            <div style="margin-bottom:7px;"><strong>Ингредиенты:</strong></div>
            <div style="margin-bottom:15px;font-size:1.08em;">${recipe.ingredients ? recipe.ingredients.replace(/\n/g, "<br>") : "Нет информации"}</div>
            <div style="margin-bottom:7px;"><strong>Инструкция приготовления:</strong></div>
            <div style="font-size:1.11em;">${recipe.instruction ? recipe.instruction.replace(/\n/g, "<br>") : "Нет инструкции"}</div>
        `;
        recipeModal.style.display = 'flex';
        document.body.style.overflow = "hidden";
    }

    // Слушатель для кнопок "Подробнее" — теперь не <a>, а <button> с data- атрибутом
    recipesContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-recipe-details')) {
            const recipeId = e.target.getAttribute('data-recipe-id');
            showRecipeDetails(recipeId);
        }
    });

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            renderRecipes(filterRecipes());
        });
    }

    populateFilters();
    renderRecipes(recipes);

    // Если есть параметр recipe в URL — открыть модальное окно сразу
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipe');
    if (recipeId) {
        showRecipeDetails(recipeId);
    }
});