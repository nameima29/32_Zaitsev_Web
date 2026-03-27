let currentApi = 'cat';

let catFactsList = [];

let jsonPosts = [];

const appContainer = document.getElementById('app');


function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.remove();
    }, 2200);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}


async function loadCatFacts() {
    const container = document.getElementById('catFactsContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading-shimmer"> ЗАГРУЗКА КОШАЧЬИХ ФАКТОВ...</div>';
    try {
        const res = await fetch('https://catfact.ninja/facts?limit=6');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        catFactsList = data.data;
        renderCatFactsUI();
        showNotification(' Cat Facts загружены (GET)', 'success');
    } catch (err) {
        container.innerHTML = `<div class="placeholder-message"> Ошибка: ${err.message}</div>`;
        showNotification(`Ошибка Cat Facts: ${err.message}`, 'error');
    }
}

function renderCatFactsUI() {
    const container = document.getElementById('catFactsContainer');
    if (!container) return;
    
    if (!catFactsList.length) {
        container.innerHTML = '<div class="placeholder-message"> Нет фактов. Обновите список</div>';
        return;
    }
    
    const factsHtml = catFactsList.map((factObj, idx) => `
        <div class="fact-item">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;"> ${escapeHtml(factObj.fact)}</div>
                <button class="delete-btn" data-index="${idx}" style="margin-left: 15px;">Удалить</button>
            </div>
            <div style="font-size: 0.7rem; color: #6b8c6b; margin-top: 8px;"> длина: ${factObj.length} симв.</div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="facts-list">${factsHtml}</div>
        <div class="action-group">
            <button id="refreshCatBtn" class="secondary-btn"> GET (обновить факты)</button>
            <button id="clearLastCatBtn" class="danger-btn"> Удалить последний факт</button>
        </div>
        <div class="response-area">
             GET https://catfact.ninja/facts | Получено фактов: ${catFactsList.length}<br>
             DELETE реализован локально (удаление из интерфейса)
        </div>
    `;
    
    document.getElementById('refreshCatBtn')?.addEventListener('click', loadCatFacts);
    document.getElementById('clearLastCatBtn')?.addEventListener('click', () => {
        if (catFactsList.length === 0) {
            showNotification('Нет фактов для удаления', 'error');
            return;
        }
        const removed = catFactsList.pop();
        renderCatFactsUI();
        showNotification(` Удалён факт: "${removed.fact.substring(0, 50)}..."`, 'success');
    });
    
    document.querySelectorAll('.delete-btn[data-index]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            if (!isNaN(idx) && idx >= 0 && idx < catFactsList.length) {
                const deletedFact = catFactsList.splice(idx, 1)[0];
                renderCatFactsUI();
                showNotification(` Удалён: ${deletedFact.fact.substring(0, 45)}`, 'success');
            }
        });
    });
}


function renderNationalizeUI() {
    const container = document.getElementById('nationalizeContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="action-group">
            <input type="text" id="nationName" class="api-input" placeholder="Введите имя (например: john, elena, michael)" autocomplete="off">
            <button id="predictNationBtn" class="save-btn"> GET / предсказать</button>
        </div>
        <div id="nationResultArea" class="placeholder-message"> Введите имя и нажмите "Предсказать"</div>
    `;
    
    document.getElementById('predictNationBtn')?.addEventListener('click', async () => {
        const nameInput = document.getElementById('nationName');
        const name = nameInput?.value.trim();
        if (!name) {
            showNotification('Введите имя!', 'error');
            return;
        }
        const resultDiv = document.getElementById('nationResultArea');
        resultDiv.innerHTML = '<div class="loading-shimmer"> Анализируем национальность...</div>';
        try {
            const res = await fetch(`https://api.nationalize.io/?name=${encodeURIComponent(name)}`);
            if (!res.ok) throw new Error('Ошибка API');
            const data = await res.json();
            renderNationalizeResult(data, name);
            showNotification(` Предсказание для "${name}" выполнено`, 'success');
        } catch (err) {
            resultDiv.innerHTML = `<div class="placeholder-message"> Ошибка: ${err.message}</div>`;
            showNotification(err.message, 'error');
        }
    });
}

function renderNationalizeResult(data, searchedName) {
    const container = document.getElementById('nationResultArea');
    if (!data.country || data.country.length === 0) {
        container.innerHTML = `<div class="placeholder-message"> Для "${escapeHtml(searchedName)}" нет данных о стране.</div>`;
        return;
    }
    
    const topList = data.country.slice(0, 4).map(c => {
        const flagMap = { 
            RU: '🇷🇺', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', 
            IT: '🇮🇹', ES: '🇪🇸', UA: '🇺🇦', PL: '🇵🇱', CN: '🇨🇳', 
            JP: '🇯🇵', BR: '🇧🇷', CA: '🇨🇦', AU: '🇦🇺' 
        };
        const flag = flagMap[c.country_id] || '🏳️';
        return `
            <div class="country-item">
                <span>${flag} <strong>${c.country_id}</strong></span>
                <span>вероятность: ${(c.probability * 100).toFixed(1)}%</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="nation-result">
            <div style="margin-bottom: 12px; font-weight: bold;"> Имя: <span style="color: #4caf50">${escapeHtml(searchedName)}</span></div>
            ${topList}
        </div>
        <div class="response-area" style="margin-top: 14px;"> GET nationalize.io завершён (метод GET)</div>
    `;
}


async function loadJsonPosts() {
    const container = document.getElementById('jsonPostsContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading-shimmer"> Загрузка постов из JSONPlaceholder...</div>';
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=8');
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        jsonPosts = await res.json();
        renderJsonPostsUI();
        showNotification(' GET /posts — список загружен', 'success');
    } catch (err) {
        container.innerHTML = `<div class="placeholder-message"> Ошибка JSONPlaceholder: ${err.message}</div>`;
        showNotification(err.message, 'error');
    }
}

async function createJsonPost(title, body) {
    if (!title || !body) throw new Error('Заголовок и текст обязательны');
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, userId: 1 })
    });
    if (!res.ok) throw new Error('POST ошибка');
    const created = await res.json();
    jsonPosts.unshift(created);
    renderJsonPostsUI();
    return created;
}

async function updateJsonPost(id, title, body) {
    if (!title || !body) throw new Error('Заполните заголовок и текст');
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, body, userId: 1 })
    });
    if (!res.ok) throw new Error('PUT ошибка');
    const updated = await res.json();
    const index = jsonPosts.findIndex(p => p.id == id);
    if (index !== -1) {
        jsonPosts[index] = { ...jsonPosts[index], title: updated.title, body: updated.body };
    }
    renderJsonPostsUI();
    return updated;
}

async function deleteJsonPost(id) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 200) throw new Error('DELETE ошибка');
    jsonPosts = jsonPosts.filter(p => p.id != id);
    renderJsonPostsUI();
    return true;
}

function renderJsonPostsUI() {
    const container = document.getElementById('jsonPostsContainer');
    if (!container) return;
    
    const postsHtml = jsonPosts.map(post => `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-title"> ${escapeHtml(post.title)}</div>
            <div class="post-body">${escapeHtml(post.body)}</div>
            <div class="post-actions">
                <button class="edit-btn" data-id="${post.id}" data-title="${escapeHtml(post.title).replace(/"/g, '&quot;')}" data-body="${escapeHtml(post.body).replace(/"/g, '&quot;')}"> PUT</button>
                <button class="delete-btn" data-id="${post.id}"> DELETE</button>
            </div>
        </div>
    `).join('');
    
    const formHtml = `
        <div class="action-group">
            <input type="text" id="newPostTitle" class="api-input" placeholder="Заголовок нового поста">
            <input type="text" id="newPostBody" class="api-input" placeholder="Текст поста">
            <button id="createPostBtn" class="success-btn"> POST (создать)</button>
        </div>
        
        <div class="put-section">
            <div style="margin-bottom: 10px; color: #8bc34a;"> PUT — обновление поста</div>
            <div class="action-group">
                <select id="putPostSelect" class="api-input">
                    <option value="">-- Выберите ID для PUT --</option>
                    ${jsonPosts.map(p => `<option value="${p.id}">ID ${p.id}: ${escapeHtml(p.title).substring(0, 40)}</option>`).join('')}
                </select>
                <input type="text" id="putTitle" class="api-input" placeholder="Новый заголовок">
                <input type="text" id="putBody" class="api-input" placeholder="Новый текст">
                <button id="applyPutBtn" class="edit-btn"> PUT /posts/{id}</button>
            </div>
        </div>
        
        <div class="scrollable-list">
            ${postsHtml || '<div class="placeholder-message">Нет постов, создайте первый через POST</div>'}
        </div>
        
        <div class="response-area">
             GET /posts • POST /posts • PUT /posts/:id • DELETE /posts/:id<br>
             JSONPlaceholder API — полноценный CRUD с реальными методами
        </div>
    `;
    
    container.innerHTML = formHtml;
    
    // Создание поста
    document.getElementById('createPostBtn')?.addEventListener('click', async () => {
        const title = document.getElementById('newPostTitle').value;
        const body = document.getElementById('newPostBody').value;
        try {
            await createJsonPost(title, body);
            showNotification(` POST: пост "${title.substring(0, 40)}" создан`, 'success');
            document.getElementById('newPostTitle').value = '';
            document.getElementById('newPostBody').value = '';
        } catch (err) {
            showNotification(`POST ошибка: ${err.message}`, 'error');
        }
    });
    
    // PUT обновление
    document.getElementById('applyPutBtn')?.addEventListener('click', async () => {
        const select = document.getElementById('putPostSelect');
        const id = select.value;
        const newTitle = document.getElementById('putTitle').value;
        const newBody = document.getElementById('putBody').value;
        if (!id) {
            showNotification('Выберите ID поста', 'error');
            return;
        }
        if (!newTitle || !newBody) {
            showNotification('Заполните заголовок и текст для PUT', 'error');
            return;
        }
        try {
            await updateJsonPost(parseInt(id), newTitle, newBody);
            showNotification(` PUT /posts/${id} обновлён`, 'success');
            document.getElementById('putTitle').value = '';
            document.getElementById('putBody').value = '';
            select.value = '';
        } catch (err) {
            showNotification(`PUT ошибка: ${err.message}`, 'error');
        }
    });
    
    // Кнопки редактирования (заполнение формы PUT)
    document.querySelectorAll('.edit-btn[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const oldTitle = btn.dataset.title;
            const oldBody = btn.dataset.body;
            const selectEl = document.getElementById('putPostSelect');
            if (selectEl) selectEl.value = id;
            const titleInput = document.getElementById('putTitle');
            const bodyInput = document.getElementById('putBody');
            if (titleInput) titleInput.value = oldTitle;
            if (bodyInput) bodyInput.value = oldBody;
        });
    });
    
    // DELETE кнопки
    document.querySelectorAll('.delete-btn[data-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            try {
                await deleteJsonPost(id);
                showNotification(`🗑️ DELETE /posts/${id} — пост удалён`, 'success');
            } catch (err) {
                showNotification(`DELETE ошибка: ${err.message}`, 'error');
            }
        });
    });
}


function renderActiveApi() {
    if (currentApi === 'cat') {
        appContainer.innerHTML = `
            <div class="api-section">
                <div class="section-header">
                    <h2> CAT FACTS API</h2>
                    <span class="badge">GET + локальный DELETE</span>
                </div>
                <div id="catFactsContainer"></div>
            </div>
        `;
        loadCatFacts();
    } else if (currentApi === 'nationalize') {
        appContainer.innerHTML = `
            <div class="api-section">
                <div class="section-header">
                    <h2> NATIONALIZE.IO API</h2>
                    <span class="badge">GET (предсказание национальности)</span>
                </div>
                <div id="nationalizeContainer"></div>
            </div>
        `;
        renderNationalizeUI();
    } else if (currentApi === 'jsonplaceholder') {
        appContainer.innerHTML = `
            <div class="api-section">
                <div class="section-header">
                    <h2> JSONPLACEHOLDER API</h2>
                    <span class="badge">GET | POST | PUT | DELETE</span>
                </div>
                <div id="jsonPostsContainer"></div>
            </div>
        `;
        loadJsonPosts();
    }
}


function initNavigation() {
    const navBtns = document.querySelectorAll('.api-nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const apiType = btn.getAttribute('data-api');
            if (apiType === 'cat') currentApi = 'cat';
            else if (apiType === 'nationalize') currentApi = 'nationalize';
            else if (apiType === 'jsonplaceholder') currentApi = 'jsonplaceholder';
            renderActiveApi();
        });
    });
}

// Запуск
initNavigation();
renderActiveApi();