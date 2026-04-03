
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

function getFlag(countryCode) {
    const flagMap = {
        RU: '🇷🇺', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
        IT: '🇮🇹', ES: '🇪🇸', UA: '🇺🇦', PL: '🇵🇱', CN: '🇨🇳',
        JP: '🇯🇵', BR: '🇧🇷', CA: '🇨🇦', AU: '🇦🇺'
    };
    return flagMap[countryCode] || '🏳️';
}


document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        routes: [
            { id: 'cat', name: '🐱 Факты о котах' },
            { id: 'nationalize', name: '🌍 Национальность по имени' },
            { id: 'jsonplaceholder', name: '📝 Посты' }
        ],
        currentRoute: 'cat',
        
        navigate(route) {
            this.currentRoute = route;
        },
        
        init() {
            const saved = localStorage.getItem('lastRoute');
            if (saved && this.routes.some(r => r.id === saved)) {
                this.currentRoute = saved;
            }
        }
    }));
    

    Alpine.data('catFactsComponent', () => ({
        facts: [],
        loading: false,
        
        async loadFacts() {
            this.loading = true;
            try {
                const res = await fetch('https://catfact.ninja/facts?limit=6');
                
                if (!res.ok) {
                    showNotification(`HTTP ошибка: ${res.status} ${res.statusText}`, 'error');
                    this.loading = false;
                    return;
                }
                
                const data = await res.json();
                this.facts = data.data;
                showNotification('✅ Cat Facts загружены (GET)', 'success');
            } catch (err) {
                showNotification(`Ошибка сети: ${err.message}`, 'error');
            } finally {
                this.loading = false;
            }
        },
        
        deleteFact(idx) {
            const deleted = this.facts.splice(idx, 1)[0];
            showNotification(`🗑️ Удалён: ${deleted.fact.substring(0, 45)}`, 'success');
        },
        
        deleteLastFact() {
            if (this.facts.length === 0) {
                showNotification('Нет фактов для удаления', 'error');
                return;
            }
            const removed = this.facts.pop();
            showNotification(`🗑️ Удалён факт: "${removed.fact.substring(0, 50)}..."`, 'success');
        },
        
        escapeHtml(str) {
            return escapeHtml(str);
        }
    }));
    

    Alpine.data('nationalizeComponent', () => ({
        name: '',
        result: null,
        loading: false,
        error: null,
        
        async predict() {
            if (!this.name.trim()) {
                showNotification('Введите имя!', 'error');
                return;
            }
            
            this.loading = true;
            this.error = null;
            this.result = null;
            
            try {
                const res = await fetch(`https://api.nationalize.io/?name=${encodeURIComponent(this.name)}`);
                
                if (!res.ok) {
                    this.error = `HTTP ${res.status}: ${res.statusText}`;
                    showNotification(this.error, 'error');
                    this.loading = false;
                    return;
                }
                
                const data = await res.json();
                this.result = data;
                showNotification(`✅ Предсказание для "${this.name}" выполнено`, 'success');
            } catch (err) {
                this.error = err.message;
                showNotification(`Ошибка сети: ${err.message}`, 'error');
            } finally {
                this.loading = false;
            }
        },
        
        escapeHtml(str) {
            return escapeHtml(str);
        },
        
        getFlag(code) {
            return getFlag(code);
        }
    }));
    

    Alpine.data('jsonplaceholderComponent', () => ({
        posts: [],
        loading: false,
        newPost: {
            title: '',
            body: ''
        },
        putData: {
            id: '',
            title: '',
            body: ''
        },
        
        async loadPosts() {
            this.loading = true;
            try {
                const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=8');
                
                if (!res.ok) {
                    showNotification(`HTTP ошибка: ${res.status} ${res.statusText}`, 'error');
                    this.loading = false;
                    return;
                }
                
                this.posts = await res.json();
                showNotification('✅ GET /posts — список загружен', 'success');
            } catch (err) {
                showNotification(`Ошибка сети: ${err.message}`, 'error');
            } finally {
                this.loading = false;
            }
        },
        
        async createPost() {
            if (!this.newPost.title || !this.newPost.body) {
                showNotification('Заголовок и текст обязательны', 'error');
                return;
            }
            
            try {
                const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        title: this.newPost.title, 
                        body: this.newPost.body, 
                        userId: 1 
                    })
                });
                
                if (!res.ok) {
                    showNotification(`POST ошибка: HTTP ${res.status}`, 'error');
                    return;
                }
                
                const created = await res.json();
                this.posts.unshift(created);
                this.newPost.title = '';
                this.newPost.body = '';
                showNotification(`✅ POST: пост "${created.title.substring(0, 40)}" создан`, 'success');
            } catch (err) {
                showNotification(`Ошибка сети: ${err.message}`, 'error');
            }
        },
        
        async updatePost() {
            if (!this.putData.id) {
                showNotification('Выберите ID поста', 'error');
                return;
            }
            if (!this.putData.title || !this.putData.body) {
                showNotification('Заполните заголовок и текст для PUT', 'error');
                return;
            }
            
            try {
                const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${this.putData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id: this.putData.id, 
                        title: this.putData.title, 
                        body: this.putData.body, 
                        userId: 1 
                    })
                });
                
                if (!res.ok) {
                    showNotification(`PUT ошибка: HTTP ${res.status}`, 'error');
                    return;
                }
                
                const updated = await res.json();
                const index = this.posts.findIndex(p => p.id == this.putData.id);
                if (index !== -1) {
                    this.posts[index] = { ...this.posts[index], title: updated.title, body: updated.body };
                }
                this.putData.id = '';
                this.putData.title = '';
                this.putData.body = '';
                showNotification(`✅ PUT /posts/${updated.id} обновлён`, 'success');
            } catch (err) {
                showNotification(`Ошибка сети: ${err.message}`, 'error');
            }
        },
        
        async deletePost(id) {
            try {
                const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, { method: 'DELETE' });
                

                if (!res.ok && res.status !== 204) {
                    showNotification(`DELETE ошибка: HTTP ${res.status}`, 'error');
                    return;
                }
                
                this.posts = this.posts.filter(p => p.id != id);
                showNotification(`🗑️ DELETE /posts/${id} — пост удалён`, 'success');
            } catch (err) {
                showNotification(`Ошибка сети: ${err.message}`, 'error');
            }
        },
        
        fillPutForm(post) {
            this.putData.id = post.id;
            this.putData.title = post.title;
            this.putData.body = post.body;
        },
        
        escapeHtml(str) {
            return escapeHtml(str);
        }
    }));
});