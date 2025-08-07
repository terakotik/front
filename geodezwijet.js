/**
 * WhatsApp Chat Widget - Universal & Tech Edition
 * @author 1target.ru
 * @version 3.0.0
 */
(function() {
    // --- НАСТРОЙКИ ВИДЖЕТА (меняйте значения здесь) ---
    const config = {
        // Номер WhatsApp для отправки
        whatsappPhoneNumber: '79108247848',

        // Текст в свернутом виде
        placeholderText: 'Здравствуйте, напишите нам',
        
        // Кнопки с быстрыми вопросами
        quickReplies: [
            'Здравствуйте, сколько стоит?',
            'Здравствуйте, вы делаете...?',
            'Здравствуйте, какие сроки?'
        ],

        // Цвета градиента для кнопки отправки
        buttonGradientStart: '#6366f1',
        buttonGradientEnd: '#818cf8',

        // Ссылка на разработчика
        developerLink: 'https://1target.ru',
        developerText: 'Разработка 1target.ru'
    };
    // ----------------------------------------------------

    /**
     * Инициализация виджета после полной загрузки страницы
     */
    function initWidget() {
        loadExternalResources();
        injectStyles();
        injectHTML();
        attachEventListeners();
    }

    /**
     * Загружает Font Awesome и Google Fonts
     */
    function loadExternalResources() {
        const resources = [
            { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }
        ];
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = resource.rel;
            link.href = resource.href;
            document.head.appendChild(link);
        });
    }

    /**
     * Создает <style> тег и добавляет все CSS правила
     */
    function injectStyles() {
        const styles = `
            :root {
                --wa-brand-start: ${config.buttonGradientStart};
                --wa-brand-end: ${config.buttonGradientEnd};
                --wa-bg-light: #ffffff;
                --wa-bg-dark: #111827;
                --wa-bg-dark-hover: #1f2937;
                --wa-text-light: #f9fafb;
                --wa-text-dark: #374151;
                --wa-border-color: #374151;
            }
            .wa-widget-container, .wa-widget-container * {
                box-sizing: border-box !important;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            .wa-widget-container {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 2147483647 !important; /* Max z-index */
                font-family: 'Inter', sans-serif !important;
                width: calc(100vw - 40px) !important;
                max-width: 320px !important;
            }
            .wa-widget-wrapper {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-end !important;
                transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
                width: 100% !important;
            }
            .wa-expanded-view {
                background-color: var(--wa-bg-dark) !important;
                border: 1px solid var(--wa-border-color) !important;
                border-radius: 1rem !important;
                padding: 1rem !important;
                margin-bottom: 12px !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
                width: 100% !important;
                transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out, transform 0.4s ease-in-out !important;
                max-height: 0 !important;
                opacity: 0 !important;
                overflow: hidden !important;
                transform: translateY(15px) !important;
            }
            .wa-widget-wrapper.expanded .wa-expanded-view {
                max-height: 300px !important;
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            .wa-quick-reply-btn {
                width: 100% !important;
                padding: 12px !important;
                margin-bottom: 8px !important;
                border: 1px solid var(--wa-border-color) !important;
                border-radius: 0.75rem !important;
                background-color: var(--wa-bg-dark-hover) !important;
                text-align: left !important;
                font-size: 0.875rem !important;
                font-weight: 500 !important;
                color: var(--wa-text-light) !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            .wa-quick-reply-btn:hover {
                background-color: var(--wa-border-color) !important;
                transform: translateY(-2px) !important;
            }
            .wa-quick-reply-btn:last-child {
                margin-bottom: 0 !important;
            }
            .wa-widget-form {
                width: 100% !important;
                background-color: var(--wa-bg-light) !important;
                border-radius: 1rem !important;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15) !important;
                display: flex !important;
                align-items: center !important;
                padding: 8px !important;
                animation: wa-widget-slideInFromRight 0.7s ease-out forwards !important;
            }
            .wa-widget-input {
                color: var(--wa-text-dark) !important;
                padding-left: 12px !important;
                padding-right: 8px !important;
                flex-grow: 1 !important;
                background-color: transparent !important;
                border: none !important;
                font-size: 0.875rem !important;
                font-weight: 500 !important;
                min-width: 0 !important;
            }
            .wa-widget-input::placeholder { color: #6b7280 !important; }
            .wa-widget-input:focus { outline: none !important; }
            .wa-widget-button {
                background: linear-gradient(45deg, var(--wa-brand-start), var(--wa-brand-end)) !important;
                color: white !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
                border: none !important;
                cursor: pointer !important;
                transition: transform 0.2s ease !important;
                animation: wa-widget-shake 10s cubic-bezier(.36,.07,.19,.97) both infinite !important;
            }
            .wa-widget-button:hover { transform: scale(1.1) !important; }
            .wa-online-indicator {
                width: 10px !important;
                height: 10px !important;
                background-color: #22c55e !important;
                border-radius: 50% !important;
                margin-left: 1rem !important;
                flex-shrink: 0 !important;
                animation: wa-widget-pulse 2s infinite !important;
            }
            .wa-dev-link {
                display: block !important;
                width: 100% !important;
                text-align: right !important;
                font-size: 10px !important;
                color: #9ca3af !important;
                text-decoration: none !important;
                margin-top: 6px !important;
                transition: color 0.2s !important;
            }
            .wa-dev-link:hover { color: #4b5563 !important; }
            @keyframes wa-widget-slideInFromRight { 0% { transform: translateX(110%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
            @keyframes wa-widget-pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
            @keyframes wa-widget-shake { 1%, 9% { transform: translate3d(-1px, 0, 0) rotate(-3deg); } 2%, 8% { transform: translate3d(2px, 0, 0) rotate(3deg); } 3%, 5%, 7% { transform: translate3d(-3px, 0, 0) rotate(-3deg); } 4%, 6% { transform: translate3d(3px, 0, 0) rotate(3deg); } 10%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Создает HTML-структуру виджета и добавляет ее на страницу
     */
    function injectHTML() {
        const quickRepliesHTML = config.quickReplies.map(text => 
            `<button type="button" class="wa-quick-reply-btn">${text}</button>`
        ).join('');

        const widgetHTML = `
            <div class="wa-widget-container">
                <div class="wa-widget-wrapper">
                    <div class="wa-expanded-view">${quickRepliesHTML}</div>
                    <form class="wa-widget-form">
                        <div class="wa-online-indicator"></div>
                        <input type="text" class="wa-widget-input" placeholder="${config.placeholderText}">
                        <button type="submit" class="wa-widget-button" aria-label="Отправить в WhatsApp">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
                <a href="${config.developerLink}" target="_blank" rel="noopener noreferrer" class="wa-dev-link">
                    ${config.developerText}
                </a>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    /**
     * Назначает все необходимые обработчики событий
     */
    function attachEventListeners() {
        const wrapper = document.querySelector('.wa-widget-wrapper');
        const input = document.querySelector('.wa-widget-input');
        
        const openWhatsApp = (message) => {
            if (!message || message.trim() === '') return;
            const encodedMessage = encodeURIComponent(message.trim());
            const whatsappUrl = `https://wa.me/${config.whatsappPhoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        };

        input.addEventListener('focus', () => wrapper.classList.add('expanded'));

        document.addEventListener('click', (event) => {
            const container = document.querySelector('.wa-widget-container');
            if (container && !container.contains(event.target)) {
                wrapper.classList.remove('expanded');
            }
        });

        const form = document.querySelector('.wa-widget-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            openWhatsApp(input.value);
            input.value = '';
        });

        document.querySelectorAll('.wa-quick-reply-btn').forEach(button => {
            button.addEventListener('click', () => {
                openWhatsApp(button.innerText);
            });
        });
    }

    // Запускаем инициализацию виджета
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

})();
