    <!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Виджет WhatsApp</title>
    <!-- Подключаем Font Awesome для иконок -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <!-- Подключаем Google Fonts -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
    <style>
        /* Стили виджета */
        .wa-widget-container, .wa-widget-container * {
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .wa-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2147483647;
            font-family: 'Inter', sans-serif;
            width: calc(100vw - 40px);
            max-width: 320px;
        }
        .wa-widget-wrapper {
            position: relative; /* НУЖНО ДЛЯ ПОЗИЦИОНИРОВАНИЯ ПРИВЕТСТВИЯ */
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            width: 100%;
        }
        .wa-expanded-view {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            padding: 1rem;
            margin-bottom: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out, transform 0.4s ease-in-out;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transform: translateY(15px);
        }
        .wa-widget-wrapper.expanded .wa-expanded-view {
            max-height: 300px;
            opacity: 1;
            transform: translateY(0);
        }
        .wa-floating-bubble {
            position: absolute;
            bottom: 100%;
            right: 0;
            background-color: #ffffff;
            color: #1f2937;
            padding: 10px 15px;
            border-radius: 1rem;
            margin-bottom: 10px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            white-space: nowrap;
            font-size: 0.875rem;
            font-weight: 500;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.5s ease, transform 0.5s ease;
            pointer-events: none;
        }
        .wa-floating-bubble.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .wa-quick-reply-btn {
            width: 100%;
            padding: 12px;
            margin-bottom: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            background-color: #ffffff;
            text-align: left;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .wa-quick-reply-btn:hover {
            background-color: #f3f4f6;
            border-color: #d1d5db;
            transform: translateY(-2px);
        }
        .wa-quick-reply-btn:last-child {
            margin-bottom: 0;
        }
        .wa-widget-form {
            width: 100%;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            padding: 8px;
            animation: wa-widget-slideInFromRight 0.7s ease-out forwards;
        }
        .wa-widget-input {
            color: #374151;
            padding-left: 12px;
            padding-right: 8px;
            flex-grow: 1;
            background-color: transparent;
            border: none;
            font-size: 0.875rem;
            font-weight: 500;
            min-width: 0;
        }
        .wa-widget-input::placeholder { color: #6b7280; }
        .wa-widget-input:focus { outline: none; }
        .wa-widget-button {
            background: linear-gradient(45deg, #6366f1, #818cf8);
            color: white;
            /* ИСПРАВЛЕНО: Гарантирует, что кнопка всегда будет круглой */
            width: 40px;
            min-width: 40px; 
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: none;
            cursor: pointer;
            transition: transform 0.2s ease;
            animation: wa-widget-shake 10s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
        .wa-widget-button:hover { transform: scale(1.1); }
        .wa-online-indicator {
            width: 10px;
            height: 10px;
            background-color: #22c55e;
            border-radius: 50%;
            margin-left: 1rem;
            flex-shrink: 0;
            animation: wa-widget-pulse 2s infinite;
        }
        .wa-dev-link {
            display: block;
            width: 100%;
            text-align: left;
            font-size: 10px;
            color: #9ca3af;
            text-decoration: none;
            margin-top: 6px;
            transition: color 0.2s;
        }
        .wa-dev-link:hover { color: #4b5563; }
        @keyframes wa-widget-slideInFromRight { 0% { transform: translateX(110%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes wa-widget-pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        @keyframes wa-widget-shake { 1%, 9% { transform: translate3d(-1px, 0, 0) rotate(-3deg); } 2%, 8% { transform: translate3d(2px, 0, 0) rotate(3deg); } 3%, 5%, 7% { transform: translate3d(-3px, 0, 0) rotate(-3deg); } 4%, 6% { transform: translate3d(3px, 0, 0) rotate(3deg); } 10%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); } }
    </style>
</head>
<body>

    <!-- НАЧАЛО: Код виджета WhatsApp -->
    <div class="wa-widget-container" id="wa-widget-container">
        <!-- HTML виджета будет вставлен здесь с помощью JS -->
    </div>

    <script>
        (function() {
            // --- НАСТРОЙКИ ВИДЖЕТА (меняйте значения здесь) ---
            const config = {
                whatsappPhoneNumber: '79108247848',
                placeholderText: 'Напишите нам, мы онлайн',
                quickReplies: [
                    'Здравствуйте, сколько стоит?',
                    'Здравствуйте, вы делаете...?',
                    'Здравствуйте, какие сроки?'
                ],
                proactiveGreeting: {
                    enabled: true,
                    // ИЗМЕНЕНО: Задержка установлена на 7 секунд
                    delay: 7000, 
                    message: 'Здравствуйте! Могу я чем-то помочь?'
                },
                developerLink: 'https://1target.ru',
                developerText: 'Установить на свой сайт'
            };
            // ----------------------------------------------------

            function injectHTML() {
                const quickRepliesHTML = config.quickReplies.map(text => 
                    `<button type="button" class="wa-quick-reply-btn">${text}</button>`
                ).join('');

                const widgetHTML = `
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
                `;
                document.getElementById('wa-widget-container').innerHTML = widgetHTML;
            }

            function attachEventListeners() {
                const wrapper = document.querySelector('.wa-widget-wrapper');
                const input = document.querySelector('.wa-widget-input');
                
                const openWhatsApp = (message) => {
                    if (!message || message.trim() === '') return;
                    const encodedMessage = encodeURIComponent(message.trim());
                    const whatsappUrl = `https://wa.me/${config.whatsappPhoneNumber}?text=${encodedMessage}`;
                    window.open(whatsappUrl, '_blank');
                };

                const expandWidget = () => {
                    if (!wrapper.classList.contains('expanded')) {
                        wrapper.classList.add('expanded');
                    }
                };

                input.addEventListener('focus', expandWidget);

                document.addEventListener('click', (event) => {
                    const container = document.getElementById('wa-widget-container');
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

                // Логика проактивного приветствия
                if (config.proactiveGreeting.enabled) {
                    let proactiveTriggered = false;
                    setTimeout(() => {
                        // Показываем приветствие только если виджет не открыт вручную
                        if (!wrapper.classList.contains('expanded') && !proactiveTriggered) {
                            proactiveTriggered = true;
                            
                            // Создаем "пузырь"
                            const bubble = document.createElement('div');
                            bubble.className = 'wa-floating-bubble';
                            bubble.textContent = config.proactiveGreeting.message;
                            
                            // Добавляем его в DOM
                            wrapper.appendChild(bubble);

                            // Запускаем анимацию появления
                            setTimeout(() => {
                                bubble.classList.add('visible');
                            }, 100);

                            // Запускаем таймер на удаление
                            setTimeout(() => {
                                bubble.classList.remove('visible');
                                // Удаляем элемент из DOM после завершения анимации
                                setTimeout(() => {
                                    bubble.remove();
                                }, 500); // 500ms - длительность transition
                            }, 5000); // 5 секунд показа
                        }
                    }, config.proactiveGreeting.delay);
                }
            }

            // Запускаем инициализацию виджета
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    injectHTML();
                    attachEventListeners();
                });
            } else {
                injectHTML();
                attachEventListeners();
            }
        })();
    </script>
    <!-- КОНЕЦ: Код виджета WhatsApp -->

</body>
</html>
