/**
 * Скрипт виджета "Ai Сканер"
 * Версия 2.1 - Адаптивная
 * Этот скрипт создает и управляет виджетом для динамической генерации чек-листов.
 */
(function() {
    // Убедимся, что скрипт не запускается дважды
    if (window.aiLandScannerWidgetLoaded) return;
    window.aiLandScannerWidgetLoaded = true;

    // --- 1. СТИЛИ И СТРУКТУРА ---
    const widgetCSS = `
        .ai-scanner-widget-body {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        #widget-prompt-bar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9998;
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #fff;
            padding: 8px;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            transform: translateY(0);
            opacity: 1;
        }
        #widget-prompt-bar.hidden {
            transform: translateY(20px);
            opacity: 0;
            visibility: hidden;
        }
        #widget-prompt-input {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            width: 250px;
            outline: none;
            transition: border-color 0.2s, width 0.3s ease;
        }
        #widget-prompt-input:focus {
            border-color: #4f46e5;
        }
        #widget-prompt-button {
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            flex-shrink: 0; /* Чтобы кнопка не сжималась */
        }
        #widget-prompt-button:hover {
            transform: scale(1.05);
        }
        #widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 90vw;
            max-width: 480px;
            height: 80vh;
            max-height: 650px;
            background-color: #f8fafc;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #widget-container.active {
            transform: translateY(0) scale(1);
            opacity: 1;
            visibility: visible;
        }
        #widget-close-button {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            background-color: #e2e8f0;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        #widget-close-button:hover {
            background-color: #cbd5e1;
        }
        #widget-content {
            overflow-y: auto;
            flex-grow: 1;
            padding: 1.5rem;
        }
        .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            color: #475569;
        }
        .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4f46e5;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Стили для динамического контента */
        .gradient-text { background: linear-gradient(45deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-fill-color: transparent; }
        .custom-checkbox input:checked ~ .checkmark { background-color: #4f46e5; border-color: #4f46e5; }
        .custom-checkbox input:checked ~ .checkmark svg { transform: scale(1); }
        .custom-checkbox .checkmark svg { transform: scale(0); transition: transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .risk-explanation { transition: all 0.3s ease-in-out; max-height: 0; overflow: hidden; opacity: 0; }
        .risk-explanation.visible { max-height: 200px; opacity: 1; margin-top: 0.5rem; padding-top: 0.75rem; }

        /* --- МОБИЛЬНАЯ АДАПТАЦИЯ --- */
        @media (max-width: 640px) {
            #widget-prompt-bar {
                left: 10px;
                right: 10px;
                bottom: 10px;
            }
            #widget-prompt-input {
                width: 100%; /* Растягиваем поле ввода */
            }
            #widget-container {
                left: 0;
                right: 0;
                bottom: 0;
                width: 100vw;
                max-width: 100%;
                height: 90vh; /* Увеличиваем высоту на мобильных */
                max-height: 90vh;
                border-radius: 1.5rem 1.5rem 0 0; /* Скругляем только верхние углы */
            }
        }
    `;

    const widgetHTML = `
        <div id="widget-prompt-bar">
            <input type="text" id="widget-prompt-input" placeholder="Задайте вопрос...">
            <button id="widget-prompt-button" aria-label="Отправить">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
            </button>
        </div>
        <div id="widget-container" class="ai-scanner-widget-body">
            <button id="widget-close-button" aria-label="Закрыть">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div id="widget-content">
                <!-- Контент будет генерироваться здесь -->
            </div>
        </div>
    `;

    // --- 2. ИНИЦИАЛИЗАЦИЯ ---
    function initializeWidget() {
        // Динамическая загрузка Tailwind CSS, если его нет на странице
        if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
            const tailwindScript = document.createElement('script');
            tailwindScript.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(tailwindScript);
        }
        
        // Вставка CSS виджета
        const styleTag = document.createElement('style');
        styleTag.textContent = widgetCSS;
        document.head.appendChild(styleTag);
        
        // Динамическая загрузка шрифта Inter, если его нет
        if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
            const fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }

        // Вставка HTML виджета на страницу
        const widgetWrapper = document.createElement('div');
        widgetWrapper.id = 'ai-scanner-widget-root';
        widgetWrapper.innerHTML = widgetHTML;
        document.body.appendChild(widgetWrapper);

        // Назначение обработчиков событий
        addEventListeners();
    }
    
    // --- 3. ЛОГИКА ---
    function addEventListeners() {
        const promptInput = document.getElementById('widget-prompt-input');
        const promptButton = document.getElementById('widget-prompt-button');
        const closeButton = document.getElementById('widget-close-button');

        promptButton.addEventListener('click', handlePromptSubmit);
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handlePromptSubmit();
        });
        closeButton.addEventListener('click', closeWidget);
    }

    function handlePromptSubmit() {
        const promptInput = document.getElementById('widget-prompt-input');
        const userQuestion = promptInput.value.trim();
        if (!userQuestion) return;
        
        openWidget();
        generateTest(userQuestion);
    }

    function openWidget() {
        document.getElementById('widget-prompt-bar').classList.add('hidden');
        document.getElementById('widget-container').classList.add('active');
    }

    function closeWidget() {
        document.getElementById('widget-container').classList.remove('active');
        document.getElementById('widget-prompt-bar').classList.remove('hidden');
        document.getElementById('widget-prompt-input').value = '';
    }

    async function generateTest(userQuestion) {
        const widgetContent = document.getElementById('widget-content');
        widgetContent.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p>Изучаю ваш вопрос и создаю<br>персональный чек-лист...</p>
            </div>`;

        const prompt = `На основе вопроса пользователя: "${userQuestion}", создай чек-лист для проверки юридических и практических рисков. Верни результат в формате JSON. JSON должен содержать один ключ "groups", значение которого - массив. Каждый элемент массива должен быть объектом с двумя ключами: "title" (название группы рисков, например, "Проверка документов") и "items" (массив вопросов). Каждый элемент в "items" должен быть объектом с ключами "text" (сам вопрос чек-листа) и "risk" (подробное объяснение риска, связанного с этим вопросом). Создай 2-3 группы, в каждой по 3-5 вопросов. Ответ должен быть только в формате JSON.`;

        const schema = {
            type: "OBJECT",
            properties: {
                "groups": {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "title": { "type": "STRING" },
                            "items": {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        "text": { "type": "STRING" },
                                        "risk": { "type": "STRING" }
                                    },
                                    required: ["text", "risk"]
                                }
                            }
                        },
                        required: ["title", "items"]
                    }
                }
            },
            required: ["groups"]
        };

        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            };
            const apiKey = ""; // API ключ не требуется для этой модели
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const result = await response.json();
            const jsonText = result.candidates[0].content.parts[0].text;
            const data = JSON.parse(jsonText);
            
            renderTest(data, userQuestion);

        } catch (error) {
            console.error("Ошибка генерации теста:", error);
            widgetContent.innerHTML = `<div class="p-4 text-center text-red-600">Не удалось создать тест. Пожалуйста, попробуйте переформулировать ваш вопрос.</div>`;
        }
    }

    function renderTest(data, userQuestion) {
        const widgetContent = document.getElementById('widget-content');
        let html = `
            <header class="text-center mb-6">
                <h1 class="text-2xl font-extrabold tracking-tight text-slate-800">Чек-лист по вопросу:</h1>
                <p class="gradient-text mt-1 text-lg font-semibold">${userQuestion}</p>
            </header>
            <div class="space-y-3 max-w-full mx-auto">
        `;

        data.groups.forEach((group, index) => {
            html += `
                <div class="bg-white rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden">
                    <h3 class="text-md font-bold text-slate-800 bg-slate-100 px-4 py-3 border-b border-slate-200">${group.title}</h3>
                    <ul id="checklist-group-${index}" class="divide-y divide-slate-200">`;
            
            group.items.forEach(item => {
                html += `
                    <li class="p-3 sm:p-4">
                        <label class="custom-checkbox flex items-start cursor-pointer">
                            <input type="checkbox" class="hidden checklist-item">
                            <div class="checkmark flex-shrink-0 w-5 h-5 rounded-md border-2 border-slate-300 bg-slate-100 mr-3 mt-1 flex items-center justify-center transition-all duration-300">
                                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="checklist-text text-sm text-slate-700">${item.text}</span>
                        </label>
                        <div class="risk-explanation ml-8 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                            <strong>🚩 Риск:</strong> ${item.risk}
                        </div>
                    </li>
                `;
            });

            html += `</ul></div>`;
        });

        html += `</div>
            <div class="text-center mt-8 mb-4">
                <button id="checkDynamicButton" class="bg-indigo-600 text-white font-bold text-md px-8 py-3 rounded-xl shadow-lg">Показать результат</button>
                <div id="dynamicResultMessage" class="hidden mt-6 p-4 rounded-xl text-md font-medium"></div>
            </div>
        `;
        widgetContent.innerHTML = html;
        
        // Добавляем обработчики для нового контента
        document.querySelectorAll('.checklist-item').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const li = e.target.closest('li');
                const riskDiv = li.querySelector('.risk-explanation');
                if (e.target.checked) {
                    li.classList.add('bg-indigo-50');
                    if (riskDiv) riskDiv.classList.add('visible');
                } else {
                    li.classList.remove('bg-indigo-50');
                    if (riskDiv) riskDiv.classList.remove('visible');
                }
            });
        });

        document.getElementById('checkDynamicButton').addEventListener('click', () => {
            const checkedCount = document.querySelectorAll('.checklist-item:checked').length;
            const resultDiv = document.getElementById('dynamicResultMessage');
            let message = '';
            if (checkedCount > 0) {
                message = `<strong>Внимание!</strong> Вы отметили <strong>${checkedCount}</strong> пункта(ов) риска. Рекомендуем проконсультироваться со специалистом.`;
                resultDiv.className = 'mt-6 p-4 rounded-xl text-md font-medium text-center bg-amber-100 border-2 border-amber-200 text-amber-900';
            } else {
                message = `Отличный результат! Ни одного пункта риска не отмечено.`;
                resultDiv.className = 'mt-6 p-4 rounded-xl text-md font-medium text-center bg-green-100 border-2 border-green-200 text-green-900';
            }
            resultDiv.innerHTML = message;
            resultDiv.classList.remove('hidden');
        });
    }

    // --- 4. ЗАПУСК ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }
})();
