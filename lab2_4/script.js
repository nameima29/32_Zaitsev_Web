(function() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    const savedTheme = getCookie('siteTheme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            setCookie('siteTheme', 'dark', 365);
        } else {
            setCookie('siteTheme', 'light', 365);
        }
    });

    const REVIEWS_COOKIE_KEY = 'siteReviews';
    
    const defaultReviews = [
        { 
            id: '1', 
            name: '@masshjkaa', 
            text: 'Хочу поблагодарить Даниила за помощь в подготовке к зачету. Материал объясняет очень четко и понятным языком, что особенно важно, когда время ограничено. Рекомендую.', 
            image: 'https://i.pravatar.cc/150?img=1'
        },
        { 
            id: '2', 
            name: '@skolbkogramm', 
            text: 'Мне очень понравились занятия по подготовке к зачету по вышмату. До этих занятий я совсем не понимала теорию, не могла "зацепиться" даже за базовые формулировки. Даниил в очень комфортной обстановке понятно и грамотно объяснил материал, всегда отвечал на вопросы и поддерживал. Всем советую!', 
            image: 'https://i.pravatar.cc/150?img=2'
        },
        { 
            id: '3', 
            name: '@cybermadnesss', 
            text: 'Отличные занятия, проходили очень комфортно и разбирались именно те моменты, в которых нуждалась. Все успешно написала, спасибо за помощь!', 
            image: 'https://i.pravatar.cc/150?img=3'
        },
        { 
            id: '4', 
            name: '@sasha24xd', 
            text: 'Спасибо большое за помощь с высшей математикой! Благодаря терпению и умению объяснять сложные вещи простым языком, я наконец-то разобралась в материале и успешно сдала зачет', 
            image: 'https://i.pravatar.cc/150?img=4'
        }
    ];

    function loadReviewsFromCookie() {
        const reviewsCookie = getCookie(REVIEWS_COOKIE_KEY);
        if (reviewsCookie) {
            try {
                return JSON.parse(reviewsCookie);
            } catch (e) {
                console.error('Ошибка парсинга отзывов из cookie', e);
                return [...defaultReviews];
            }
        }
        saveReviewsToCookie(defaultReviews);
        return [...defaultReviews];
    }

    function saveReviewsToCookie(reviews) {
        setCookie(REVIEWS_COOKIE_KEY, JSON.stringify(reviews), 365);
    }

    function renderReviews() {
        const container = document.getElementById('reviewsContainer');
        const reviews = loadReviewsFromCookie();
        
        if (reviews.length === 0) {
            container.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
            return;
        }

        reviews.sort((a, b) => (b.id > a.id ? 1 : -1));

        let html = '';
        reviews.forEach(review => {
            html += `
                <div class="review-item">
                    <div class="review-author">
                        ${review.image ? `<img src="${review.image}" alt="аватар ${review.name}">` : ''}
                        ${review.name}
                    </div>
                    <div class="review-text">${review.text}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    const reviewForm = document.getElementById('reviewForm');
    const nameInput = document.getElementById('name');
    const textInput = document.getElementById('reviewText');
    const imageInput = document.getElementById('reviewImage');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
                imagePreview.src = '#';
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const text = textInput.value.trim();

            document.querySelectorAll('.error-message').forEach(el => el.remove());

            let hasError = false;

            if (!name) {
                showError(nameInput, 'Имя обязательно');
                hasError = true;
            }

            if (!text) {
                showError(textInput, 'Текст отзыва обязателен');
                hasError = true;
            }

            if (hasError) return;

            const reviews = loadReviewsFromCookie();

            const newReview = {
                id: Date.now().toString(),
                name: name,
                text: text,
                image: imagePreview.src && imagePreview.src !== '#' ? imagePreview.src : null
            };

            reviews.unshift(newReview);

            saveReviewsToCookie(reviews);

            nameInput.value = '';
            textInput.value = '';
            imageInput.value = '';
            imagePreview.style.display = 'none';
            imagePreview.src = '#';

            renderReviews();
        });
    }

    function showError(inputElement, message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        inputElement.parentNode.appendChild(error);
    }

    renderReviews();
})();