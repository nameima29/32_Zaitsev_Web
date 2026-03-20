class Card {
    constructor(suit, title, description, craftCost) {
        this.suit = suit;
        this.title = title;
        this.description = description;
        this.craftCost = craftCost; // [fox, rabbit, mouse, bird]
    }
    
    getHTML() {
        const suitNames = {
            'fox': 'Лис',
            'rabbit': 'Заяц',
            'mouse': 'Мышь',
            'bird': 'Птица (Джокер)'
        };
        
        return `
            <div class="card ${this.suit}">
                <div class="card-header">
                    <div class="card-title">${this.title}</div>
                    <div class="suit">${suitNames[this.suit]}</div>
                </div>
                <div class="card-description">${this.description}</div>
                <div class="craft-cost">
                    <div>🦊 ${this.craftCost[0]}</div>
                    <div>🐰 ${this.craftCost[1]}</div>
                    <div>🐭 ${this.craftCost[2]}</div>
                    <div>🐦 ${this.craftCost[3]}</div>
                </div>
            </div>
        `;
    }
    
    getEditHTML(index) {
        const suitNames = ['fox', 'rabbit', 'mouse', 'bird'];
        const suitLabels = ['Лис', 'Заяц', 'Мышь', 'Птица (Джокер)'];
        
        return `
            <div class="card ${this.suit}">
                <div class="card-header">
                    <input type="text" class="title-input" data-index="${index}" value="${this.title}" placeholder="Название карты" required>
                    <select class="suit-select" data-index="${index}">
                        ${suitNames.map((s, i) => `
                            <option value="${s}" ${this.suit === s ? 'selected' : ''}>
                                ${suitLabels[i]}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <textarea class="description-input" data-index="${index}" rows="3" placeholder="Описание эффекта" required>${this.description}</textarea>
                <div class="craft-cost-inputs">
                    <input type="number" class="craft-cost-input" data-index="${index}" data-cost="0" value="${this.craftCost[0]}" min="0" max="4" placeholder="🦊" required>
                    <input type="number" class="craft-cost-input" data-index="${index}" data-cost="1" value="${this.craftCost[1]}" min="0" max="4" placeholder="🐰" required>
                    <input type="number" class="craft-cost-input" data-index="${index}" data-cost="2" value="${this.craftCost[2]}" min="0" max="4" placeholder="🐭" required>
                    <input type="number" class="craft-cost-input" data-index="${index}" data-cost="3" value="${this.craftCost[3]}" min="0" max="4" placeholder="🐦" required>
                </div>
                <div class="card-actions">
                    <button class="save-btn" data-index="${index}">Сохранить</button>
                    <button class="delete-btn" data-index="${index}">Удалить</button>
                </div>
            </div>
        `;
    }
    
    isValid() {
        return this.title && this.title.trim() !== '' &&
               this.description && this.description.trim() !== '' &&
               this.craftCost && this.craftCost.length === 4 &&
               this.craftCost.every(cost => !isNaN(cost) && cost >= 0 && cost <= 4);
    }
}

class FoxCard extends Card {
    constructor(title, description, craftCost) {
        super('fox', title, description, craftCost);
    }
}

class RabbitCard extends Card {
    constructor(title, description, craftCost) {
        super('rabbit', title, description, craftCost);
    }
}

class MouseCard extends Card {
    constructor(title, description, craftCost) {
        super('mouse', title, description, craftCost);
    }
}

class BirdCard extends Card {
    constructor(title, description, craftCost) {
        super('bird', title, description, craftCost);
    }
}

const defaultCards = [
    new BirdCard('Саботажники', 'В начале фазы утра можете сбросить эту карту и смастеренную врагом.', [0, 0, 0, 1]),
    new BirdCard('Полевая кухня', 'Ваши жетоны теперь учитываются при определении правителя поляны и считаются дважды.', [1, 1, 1, 0]),
    new BirdCard('Строители лодок', 'Вы можете перемещаться по участкам реки как по тропам', [0, 0, 0, 2]),
    new BirdCard('Вороньи планы', 'Вы игнорируете правило правления при перемещении', [0, 0, 0, 2]),
    new BirdCard('Крылатые революционеры', 'В конце Утра переместитесь и начните сражение на той поляне, куда вы пришли. Если оба действия выполнить не удалось, сбросьте эту карту.', [2, 0, 0, 0]),

    new FoxCard('Лисы-партизаны', 'Сражаясь на лисьей поляне, вы можете нанести 1 дополнительный урон, сбросив все карты, кроме лисьих.', [1, 0, 0, 0]),
    new FoxCard('Отдел пропаганды', 'Один раз в фазу Дня можете сбросить карту, чтобы на поляне той же масти заменить воина противника на своего.', [0, 0, 0, 3]),
    new FoxCard('Ложные приказы', 'Утром можете сбросить эту карту и переместить большую воинов противника, округляя вверх и игнорируя правление полян.', [1, 0, 0, 0]),
    new FoxCard('Информаторы', 'Вечером, если вам нужно брать карты, можете вместо этого забрать одну карту засады из стопки сброса.', [2, 0, 0, 0]),
    
    new RabbitCard('Туннели', 'Все поляны с вашими компонентами для ремесла для вас являются соседними.', [0, 1, 0, 0]),
    new RabbitCard('Зайцы-партизаны', 'Сражаясь на заячьей поляне, вы можете нанести 1 дополнительный урон, сбросив все карты, кроме заячьих.', [0, 1, 0, 0]),
    new RabbitCard('Очарование', 'В начале фазы Вечера вы можете взять карту и выбрать другого игрока, который получит 1 ПО.', [0, 1, 0, 0]),
    new RabbitCard('Блошиный рынок', 'Один раз за Утро можете взять случайную карту у другого игрока, дав ему взамен любую свою карту.', [0, 1, 0, 0]),
    new RabbitCard('Гробовщики', 'Кладите на эту карту воинов, которые должны вернуться в запас. В начале Утра получите 1 ПО за каждые 5 воинов, затем верните их владельцам.', [0, 2, 0, 0]),
    
    new MouseCard('Лига отважных мышей', 'Один раз за День можете перевернуть смастерённый предмет чтобы переместиться или начать сражение.', [0, 0, 1, 0]),
    new MouseCard('Мастера-гравёры', 'Каждый раз, когда вы мастерите предмет, получайте дополнительное ПО.', [0, 0, 2, 0]),
    new MouseCard('Мыши-партизаны', 'Сражаясь на мышиной поляне, вы можете нанести 1 дополнительный урон, сбросив все карты, кроме мышиных.', [0, 0, 1, 0]),
    new MouseCard('Мышь-брокер', 'Каждый раз, когда другой игрок мастерит предмет, получайте карту из колоды.', [0, 0, 2, 0]),

    // Предметы
    new FoxCard('Аккуратно ношеная котомка', 'Мешок +1 ПО', [0, 0, 1, 0]),
    new RabbitCard('Тропа контрабандистов', 'Мешок +1 ПО', [0, 0, 1, 0]),
    new MouseCard('Мышь в мешке', 'Мешок +1 ПО', [0, 0, 1, 0]),
    new BirdCard('Птичий узелок', 'Мешок +1 ПО', [0, 0, 1, 0]),

    new FoxCard('Походное снаряжение', 'Сапог +1 ПО', [0, 1, 0, 0]),
    new RabbitCard('Дружеский визит', 'Сапог +1 ПО', [0, 1, 0, 0]),
    new MouseCard('Походное снаряжение', 'Сапог +1 ПО', [0, 1, 0, 0]),
    new BirdCard('Лесная контрабанда', 'Сапог +1 ПО', [0, 1, 0, 0]),

    new MouseCard('Арбалет', 'Арбалет +1 ПО', [1, 0, 0, 0]),
    new BirdCard('Арбалет', 'Арбалет +1 ПО', [1, 0, 0, 0]),

    new FoxCard('Наковальня', 'Молоток +2 ПО', [1, 0, 0, 0]),

    new FoxCard('Лисья сталь', 'Меч +2 ПО', [2, 0, 0, 0]),
    new RabbitCard('Торговец оружием', 'Меч +2 ПО', [2, 0, 0, 0]),
    new MouseCard('Меч', 'Меч +2 ПО', [2, 0, 0, 0]),

    new FoxCard('Чай из кореньев', 'Чайник +2 ПО', [0, 0, 1, 0]),
    new RabbitCard('Чай из кореньев', 'Чайник +2 ПО', [0, 0, 1, 0]),
    new MouseCard('Чай из кореньев', 'Чайник +2 ПО', [0, 0, 1, 0]),

    new FoxCard('Вымогательство', 'Монеты +3 ПО', [0, 2, 0, 0]),
    new RabbitCard('Распродажа выпечки', 'Монеты +3 ПО', [0, 2, 0, 0]),
    new MouseCard('Инвестиции', 'Монеты +3 ПО', [0, 2, 0, 0]),

    new FoxCard('Засада!', 'В сражении, перед броском кубиков защищающийся может разыграть карту засады, соответствующую по масти поляне сражения, чтобы нанести противнику 2 урона. Нападающий может отменить эффект, разыграв свою карту засады масти той же поляны.', [0, 0, 0, 0]),
    new RabbitCard('Засада!', 'В сражении, перед броском кубиков защищающийся может разыграть карту засады, соответствующую по масти поляне сражения, чтобы нанести противнику 2 урона. Нападающий может отменить эффект, разыграв свою карту засады масти той же поляны.', [0, 0, 0, 0]),
    new MouseCard('Засада!', 'В сражении, перед броском кубиков защищающийся может разыграть карту засады, соответствующую по масти поляне сражения, чтобы нанести противнику 2 урона. Нападающий может отменить эффект, разыграв свою карту засады масти той же поляны.', [0, 0, 0, 0]),
    new BirdCard('Засада!', 'В сражении, перед броском кубиков защищающийся может разыграть карту засады, соответствующую по масти поляне сражения, чтобы нанести противнику 2 урона. Нападающий может отменить эффект, разыграв свою карту засады масти той же поляны.', [0, 0, 0, 0]),
];

let cards = [];
let isEditMode = false;

function loadCards() {
    const saved = localStorage.getItem('rootCards');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            cards = parsed.map(cardData => {
                switch(cardData.suit) {
                    case 'fox': return new FoxCard(cardData.title, cardData.description, cardData.craftCost);
                    case 'rabbit': return new RabbitCard(cardData.title, cardData.description, cardData.craftCost);
                    case 'mouse': return new MouseCard(cardData.title, cardData.description, cardData.craftCost);
                    case 'bird': return new BirdCard(cardData.title, cardData.description, cardData.craftCost);
                    default: return new Card(cardData.suit, cardData.title, cardData.description, cardData.craftCost);
                }
            });
        } catch(e) {
            cards = [...defaultCards];
        }
    } else {
        cards = [...defaultCards];
    }
}

function saveCards() {
    const cardsData = cards.map(card => ({
        suit: card.suit,
        title: card.title,
        description: card.description,
        craftCost: card.craftCost
    }));
    localStorage.setItem('rootCards', JSON.stringify(cardsData));
}

function showNotification(message, isError = true) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function validateCard(card, index) {
    if (!card.title || card.title.trim() === '') {
        showNotification(`Ошибка: у карты #${index + 1} отсутствует название`);
        return false;
    }
    if (!card.description || card.description.trim() === '') {
        showNotification(`Ошибка: у карты "${card.title}" отсутствует описание`);
        return false;
    }
    if (!card.craftCost || card.craftCost.length !== 4) {
        showNotification(`Ошибка: у карты "${card.title}" некорректная стоимость крафта`);
        return false;
    }
    for (let i = 0; i < card.craftCost.length; i++) {
        if (isNaN(card.craftCost[i]) || card.craftCost[i] < 0 || card.craftCost[i] > 4) {
            const costNames = ['лисьи', 'заячьи', 'мышиные', 'птичьи'];
            showNotification(`Ошибка: у карты "${card.title}" значение ${costNames[i]} стоимости крафта должно быть от 0 до 4`);
            return false;
        }
    }
    return true;
}

function buildSite() {
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <h1>LAB5. Колода карт ROOT "изгнанники и партизаны" (без копий)</h1>
        <button class="mode-switch" id="modeSwitch">${isEditMode ? 'Режим просмотра' : 'Режим редактирования'}</button>
    `;
    
    const container = document.createElement('div');
    container.id = 'cardsContainer';
    container.className = `cards-container ${isEditMode ? 'edit-mode' : ''}`;
    
    if (isEditMode) {
        container.innerHTML = cards.map((card, index) => card.getEditHTML(index)).join('');
        
        container.innerHTML += `
            <div class="add-card" id="addCardBtn">
                <span>+ Добавить карту</span>
            </div>
        `;
    } else {
        container.innerHTML = cards.map(card => card.getHTML()).join('');
    }
    
    document.body.innerHTML = '';
    document.body.appendChild(header);
    document.body.appendChild(container);
    
    if (isEditMode) {
        document.querySelectorAll('.title-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = e.target.dataset.index;
                cards[index].title = e.target.value;
                e.target.classList.remove('error');
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value.trim()) {
                    e.target.classList.add('error');
                } else {
                    e.target.classList.remove('error');
                }
            });
        });
        
        document.querySelectorAll('.suit-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                cards[index].suit = e.target.value;
            });
        });
        
        document.querySelectorAll('.description-input').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const index = e.target.dataset.index;
                cards[index].description = e.target.value;
                e.target.classList.remove('error');
            });
            
            textarea.addEventListener('blur', (e) => {
                if (!e.target.value.trim()) {
                    e.target.classList.add('error');
                } else {
                    e.target.classList.remove('error');
                }
            });
        });
        
        document.querySelectorAll('.craft-cost-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = e.target.dataset.index;
                const costIndex = e.target.dataset.cost;
                let value = parseInt(e.target.value) || 0;
                value = Math.min(4, Math.max(0, value));
                cards[index].craftCost[costIndex] = value;
                e.target.value = value;
                e.target.classList.remove('error');
            });
            
            input.addEventListener('blur', (e) => {
                const value = parseInt(e.target.value) || 0;
                if (value < 0 || value > 4) {
                    e.target.classList.add('error');
                } else {
                    e.target.classList.remove('error');
                }
            });
        });
        
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                
                if (validateCard(cards[index], index)) {
                    saveCards();
                    showNotification('Карта сохранена!', false);
                    buildSite();
                }
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const cardTitle = cards[index].title || 'Новая карта';
                if (confirm(`Удалить карту "${cardTitle}"?`)) {
                    cards.splice(index, 1);
                    saveCards();
                    showNotification(`Карта "${cardTitle}" удалена`, false);
                    buildSite();
                }
            });
        });
        
        const addBtn = document.getElementById('addCardBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                cards.push(new Card('fox', '', '', [0, 0, 0, 0]));
                saveCards();
                buildSite();
            });
        }
    }
    
    const modeSwitch = document.getElementById('modeSwitch');
    if (modeSwitch) {
        modeSwitch.addEventListener('click', () => {
            if (isEditMode) {
                let allValid = true;
                for (let i = 0; i < cards.length; i++) {
                    if (!validateCard(cards[i], i)) {
                        allValid = false;
                        break;
                    }
                }
                if (!allValid) {
                    showNotification('Невозможно выйти из режима редактирования: исправьте ошибки в картах');
                    return;
                }
            }
            isEditMode = !isEditMode;
            buildSite();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadCards();
    buildSite();
});

//localStorage.removeItem('rootCards');