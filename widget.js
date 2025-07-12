/**
 * Скрипт виджета "Ai Сканер"
 * Версия 1.1
 * Этот скрипт создает и управляет виджетом для проверки рисков с земельным участком.
 */
(function() {
    // Убедимся, что скрипт не запускается дважды
    if (window.aiLandScannerWidgetLoaded) {
        return;
    }
    window.aiLandScannerWidgetLoaded = true;

    // 1. ОПРЕДЕЛЕНИЕ СТИЛЕЙ И HTML-СТРУКТУРЫ ВИДЖЕТА

    const widgetCSS = `
        /* Общие стили */
        .ai-scanner-widget-body {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Стили для виджета */
        #widget-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 90vw;
            max-width: 480px;
            height: 70vh;
            max-height: 600px;
            background-color: #f8fafc; /* bg-slate-50 */
            border-radius: 1.5rem; /* rounded-3xl */
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

        #widget-content {
            overflow-y: auto;
            flex-grow: 1;
            padding: 1rem 1.5rem;
        }
        
        /* Стили для кнопки-переключателя */
        #widget-toggle-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 72px;
            height: 72px;
            background: linear-gradient(45deg, #4f46e5, #7c3aed);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2);
            z-index: 10000;
            transition: all 0.3s ease;
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            line-height: 1.2;
        }

        #widget-toggle-button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4), 0 10px 10px -5px rgba(79, 70, 229, 0.2);
        }

        /* Стили для иконки и текста */
        .widget-icon {
            transition: transform 0.3s ease, opacity 0.3s ease;
            position: absolute;
        }
        #button-text {
            transform: scale(1);
            opacity: 1;
        }
        #close-icon {
            transform: scale(0);
            opacity: 0;
        }
        #widget-toggle-button.active #button-text {
            transform: scale(0);
            opacity: 0;
        }
        #widget-toggle-button.active #close-icon {
            transform: scale(1);
            opacity: 1;
        }

        /* Кастомные стили */
        .gradient-text {
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; text-fill-color: transparent;
        }
        .custom-checkbox input:checked ~ .checkmark {
            background-color: #4f46e5; border-color: #4f46e5; transform: scale(1.05);
        }
        .custom-checkbox input:checked ~ .checkmark svg { transform: scale(1); }
        .custom-checkbox input:checked ~ .checklist-text { color: #475569; }
        .custom-checkbox .checkmark svg {
            transform: scale(0);
            transition: transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .loader {
            border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5;
            border-radius: 50%; width: 40px; height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }
        }
        .risk-explanation {
            transition: all 0.3s ease-in-out; max-height: 0;
            overflow: hidden; opacity: 0; padding-top: 0;
            padding-bottom: 0; margin-top: 0;
        }
        .risk-explanation.visible {
            max-height: 200px; opacity: 1; padding-top: 0.75rem;
            padding-bottom: 0.75rem; margin-top: 0.5rem;
        }
    `;

    const widgetHTML = `
        <!-- Кнопка для открытия/закрытия виджета -->
        <div id="widget-toggle-button">
            <span id="button-text" class="widget-icon">Ai<br>Сканер</span>
            <!-- Иконка крестика -->
            <svg id="close-icon" class="widget-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <!-- Контейнер виджета -->
        <div id="widget-container" class="ai-scanner-widget-body">
            <div id="widget-content" class="text-slate-700">
                <header class="text-center mb-6">
                    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                        <span class="block">Могут ли у вас отнять</span>
                        <span class="block gradient-text mt-1">ваш земельный участок?</span>
                    </h1>
                    <p class="mt-2 text-sm text-slate-600">Пройдите тест, чтобы узнать, стоит ли вам принять меры для защиты вашего участка.</p>
                </header>
                <div class="bg-white/60 backdrop-blur-sm border border-indigo-200 rounded-xl p-4 text-center mb-6 max-w-full mx-auto shadow-sm">
                    <h2 class="text-md font-bold text-indigo-700">Оцените свои риски!</h2>
                    <p class="mt-1 text-sm text-slate-600">
                        Отметьте <strong>2 и более пункта</strong>, и это серьезный повод для беспокойства.
                    </p>
                </div>
                <div class="space-y-3 max-w-full mx-auto">
                    <div class="bg-white rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden">
                        <h3 class="text-md font-bold text-slate-800 bg-slate-100 px-4 py-3 border-b border-slate-200">Документы и право</h3>
                        <ul id="checklist-group-1" class="divide-y divide-slate-200"></ul>
                    </div>
                    <div class="bg-white rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden">
                        <h3 class="text-md font-bold text-slate-800 bg-slate-100 px-4 py-3 border-b border-slate-200">Управление и финансы</h3>
                        <ul id="checklist-group-2" class="divide-y divide-slate-200"></ul>
                    </div>
                    <div class="bg-white rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden">
                        <h3 class="text-md font-bold text-slate-800 bg-slate-100 px-4 py-3 border-b border-slate-200">Судебные риски</h3>
                        <ul id="checklist-group-3" class="divide-y divide-slate-200"></ul>
                    </div>
                </div>
                <div class="text-center mt-8">
                    <button id="checkButton" class="bg-indigo-600 text-white font-bold text-md px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:-translate-y-1">
                        Получить результат
                    </button>
                    <div id="resultMessage" class="hidden mt-6 max-w-full mx-auto p-4 rounded-xl text-md font-medium"></div>
                    <div id="aiDoctorContainer" class="hidden mt-6 max-w-full mx-auto text-left">
                        <h3 class="text-xl font-bold text-slate-800 text-center mb-3">Рекомендация эксперта</h3>
                        <div class="p-4 bg-white rounded-xl shadow-lg shadow-slate-200/50">
                            <div id="geminiLoader" class="flex justify-center items-center p-8">
                                <div class="loader"></div>
                            </div>
                            <div id="geminiAdvice" class="hidden space-y-3 text-slate-700 text-sm"></div>
                            <div id="aiDoctorActions" class="hidden mt-4 flex flex-col sm:flex-row gap-3">
                                <a href="https://t.me/Danayn11" target="_blank" class="w-full text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-all text-sm">
                                    На консультацию
                                </a>
                                <a href="https://t.me/zemla_yslygi" target="_blank" class="w-full text-center bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-300 transition-all text-sm">
                                    Задать вопрос
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 2. ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ВИДЖЕТА
    function initializeWidget() {
        // Вставка CSS
        const styleTag = document.createElement('style');
        styleTag.textContent = widgetCSS;
        document.head.appendChild(styleTag);
        
        // Вставка шрифтов
        const fontLink1 = document.createElement('link');
        fontLink1.rel = 'preconnect';
        fontLink1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(fontLink1);

        const fontLink2 = document.createElement('link');
        fontLink2.rel = 'preconnect';
        fontLink2.href = 'https://fonts.gstatic.com';
        fontLink2.crossOrigin = true;
        document.head.appendChild(fontLink2);
        
        const fontLink3 = document.createElement('link');
        fontLink3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
        fontLink3.rel = 'stylesheet';
        document.head.appendChild(fontLink3);


        // Вставка HTML
        const widgetWrapper = document.createElement('div');
        widgetWrapper.id = 'ai-scanner-widget-root';
        widgetWrapper.innerHTML = widgetHTML;
        document.body.appendChild(widgetWrapper);

        // --- ЛОГИКА ВИДЖЕТА ---
        const widgetContainer = document.getElementById('widget-container');
        const toggleButton = document.getElementById('widget-toggle-button');

        toggleButton.addEventListener('click', () => {
            widgetContainer.classList.toggle('active');
            toggleButton.classList.toggle('active');
        });

        // --- ОСНОВНОЙ СКРИПТ ТЕСТА ---
        const checklistData = {
            "checklist-group-1": [
                { text: "<strong>Отсутствие оформления прав:</strong> Участок не зарегистрирован в собственность или аренду.", risk: "<strong>🚩 Неоформленные права:</strong> Без записи в ЕГРН участок могут забрать через суд или продать за долги прежнего владельца." },
                { text: "<strong>Неоформленное наследство:</strong> При жизни владельца наследство еще не оформлено.", risk: "<strong>🚩 Риск утраты:</strong> Без оформления наследства вы не являетесь законным собственником и не можете распоряжаться участком, а другие наследники могут заявить свои права." },
                { text: "<strong>Переход прав по дарственной:</strong> Участок переходил по договору дарения.", risk: "<strong>🚩 Риск оспаривания:</strong> Договор дарения может быть оспорен в суде другими родственниками дарителя или кредиторами, что ставит под угрозу ваше право собственности." },
                { text: "<strong>Споры о границах:</strong> Имеются претензии по границам участка.", risk: "<strong>🚩 Риск потери части участка:</strong> Соседские споры о границах часто приводят к судебным разбирательствам и дорогостоящим экспертизам, в результате которых вы можете лишиться части своей земли." }
            ],
            "checklist-group-2": [
                { text: "<strong>Просроченная задолженность:</strong> Имеется задолженность по взносам более 2 месяцев.", risk: "<strong>🚩 Риск взыскания:</strong> Правление СНТ имеет право обратиться в суд для взыскания долга, что может привести к аресту и последующей продаже вашего участка для погашения задолженности." },
                { text: "<strong>Действия без доверенности:</strong> Председатель действует без подтвержденных полномочий.", risk: "<strong>🚩 Риск нелегитимных решений:</strong> Если председатель действует без подтвержденных полномочий, все его решения, включая сделки с землей, могут быть признаны незаконными и отменены." },
                { text: "<strong>Право изъятия в уставе:</strong> Устав СНТ содержит пункты об изъятии участков.", risk: "<strong>🚩 Прямая угроза:</strong> Наличие таких пунктов в уставе дает правлению СНТ формальное основание для инициирования процедуры изъятия вашего участка при малейшем нарушении." },
                { text: "<strong>Выход из членов СНТ:</strong> Подавалось заявление о выходе из членов СНТ.", risk: "<strong>🚩 Риск потери льгот и давления:</strong> После выхода вы можете столкнуться с ограничениями в пользовании общей инфраструктурой и повышенным давлением со стороны правления." }
            ],
            "checklist-group-3": [
                { text: "<strong>Нарушение целевого использования участка:</strong> К участку применяются санкции за нецелевое использование.", risk: "<strong>🚩 Риск штрафов и изъятия:</strong> Использование земли не по назначению является серьезным нарушением, которое может повлечь крупные штрафы и даже изъятие участка по решению суда." },
                { text: "<strong>Нарушение нормативов:</strong> Участок не соответствует пожарным/санитарным нормам.", risk: "<strong>🚩 Риск предписаний и сноса:</strong> Несоблюдение норм может привести к предписаниям от надзорных органов и требованиям снести постройки, а в крайних случаях – к лишению права пользования участком." },
                { text: "<strong>Судебное решение об изъятии:</strong> Имеется вступившее в силу судебное решение.", risk: "<strong>🚩 Критическая ситуация:</strong> Вступившее в силу решение суда – это финальный этап, после которого участок будет принудительно изъят. Действовать нужно было раньше." },
                { text: "<strong>Решение собрания о перераспределении:</strong> Имеется протокол собрания о перераспределении земель.", risk: "<strong>🚩 Риск изменения границ:</strong> Такое решение, даже если оно кажется незаконным, является основанием для изменения границ или конфигурации вашего участка. Его необходимо оспаривать в суде." },
                { text: "<strong>Предложение о выкупе:</strong> Поступали официальные предложения о выкупе участка.", risk: "<strong>🚩 Скрытая угроза:</strong> Часто предложения о выкупе поступают от лиц, знающих о юридических проблемах с участком или планирующих его захват. Это может быть первым шагом к рейдерству." }
            ]
        };

        // Заполнение чек-листов
        for (const groupId in checklistData) {
            const groupUl = document.getElementById(groupId);
            if (groupUl) {
                checklistData[groupId].forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'p-3 sm:p-4';
                    const label = document.createElement('label');
                    label.className = 'custom-checkbox flex items-start cursor-pointer';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'hidden checklist-item';
                    const checkmark = document.createElement('div');
                    checkmark.className = 'checkmark flex-shrink-0 w-5 h-5 rounded-md border-2 border-slate-300 bg-slate-100 mr-3 mt-1 flex items-center justify-center transition-all duration-300';
                    checkmark.innerHTML = `<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
                    const textSpan = document.createElement('span');
                    textSpan.className = 'checklist-text text-sm text-slate-700';
                    textSpan.innerHTML = item.text;
                    label.appendChild(checkbox);
                    label.appendChild(checkmark);
                    label.appendChild(textSpan);
                    li.appendChild(label);
                    if (item.risk) {
                        const riskDiv = document.createElement('div');
                        riskDiv.className = 'risk-explanation ml-8 p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs';
                        riskDiv.innerHTML = item.risk;
                        li.appendChild(riskDiv);
                    }
                    groupUl.appendChild(li);
                });
            }
        }

        const checkButton = document.getElementById('checkButton');
        const checkboxes = document.querySelectorAll('.checklist-item');
        const resultMessageDiv = document.getElementById('resultMessage');
        const aiDoctorContainer = document.getElementById('aiDoctorContainer');
        const geminiLoader = document.getElementById('geminiLoader');
        const geminiAdviceDiv = document.getElementById('geminiAdvice');
        const aiDoctorActions = document.getElementById('aiDoctorActions');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const li = event.target.closest('li');
                const riskDiv = li.querySelector('.risk-explanation');
                if (event.target.checked) {
                    li.classList.add('bg-indigo-50');
                    if (riskDiv) riskDiv.classList.add('visible');
                } else {
                    li.classList.remove('bg-indigo-50');
                    if (riskDiv) riskDiv.classList.remove('visible');
                }
            });
        });

        async function getGeminiAdvice(checkedItems, resultType) {
            aiDoctorContainer.classList.remove('hidden');
            aiDoctorContainer.classList.add('fade-in');
            geminiLoader.style.display = 'flex';
            geminiAdviceDiv.classList.add('hidden');
            aiDoctorActions.classList.add('hidden');
            let prompt;
            if (resultType === 'warning') {
                prompt = `Выступи в роли опытного кадастрового инженера. Пользователь обеспокоен, так как тест выявил следующие риски: ${checkedItems.join(', ')}. Очень коротко (до 500 символов) и без звездочек успокой его. Скажи, что ситуация требует внимания, но большинство вопросов решаемы. Напиши, что для точного анализа ситуации, проверки границ и документов необходима консультация специалиста, а общие вопросы можно задать в нашей группе. Твоя цель — снизить тревожность и направить на профессиональную консультацию.`;
            } else {
                prompt = `Выступи в роли опытного кадастрового инженера. У пользователя хорошие результаты теста, но он отметил: ${checkedItems.join(', ')}. Очень коротко (до 500 символов) и без звездочек похвали его за ответственный подход. Напиши, что для поддержания порядка и получения ответов на будущие вопросы по межеванию или кадастровым работам он может обратиться за консультацией или присоединиться к нашей группе. Твоя цель — поддержать и направить.`;
            }
            try {
                let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = ""; // API-ключ не требуется для gemini-2.0-flash
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    throw new Error(`Ошибка API: ${response.statusText}`);
                }
                const result = await response.json();
                let text = "Не удалось получить совет. Попробуйте еще раз.";
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    text = result.candidates[0].content.parts[0].text;
                }
                geminiAdviceDiv.innerHTML = text.replace(/\*/g, '').replace(/\n/g, '<br><br>');
            } catch (error) {
                console.error("Ошибка при вызове Gemini API:", error);
                geminiAdviceDiv.innerText = "К сожалению, произошла ошибка при генерации совета. Пожалуйста, проверьте консоль для получения дополнительной информации.";
            } finally {
                geminiLoader.style.display = 'none';
                geminiAdviceDiv.classList.remove('hidden');
                aiDoctorActions.classList.remove('hidden');
                aiDoctorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        function checkResults() {
            const checkedCheckboxes = document.querySelectorAll('.checklist-item:checked');
            const checkedCount = checkedCheckboxes.length;
            const checkedItems = Array.from(checkedCheckboxes).map(cb => {
                return cb.closest('label').querySelector('.checklist-text').innerText;
            });
            resultMessageDiv.className = 'hidden mt-6 max-w-full mx-auto p-4 rounded-xl text-md font-medium text-center';
            const giftIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block -mt-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2zM2 16a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" /></svg>`;
            const ctaButton = `<a href="https://t.me/zemla_yslygi" target="_blank" class="mt-3 inline-block bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-50 transition-all duration-300 text-sm"> ${giftIcon} <span class="ml-1">Получить гайд</span></a>`;
            let message = '';
            let resultType = '';
            if (checkedCount >= 2) {
                resultType = 'warning';
                message = `<strong>Внимание, высокий риск!</strong> Вы отметили <strong>${checkedCount}</strong> пункта(ов).<br>Не откладывайте решение этого вопроса. <br>${ctaButton}`;
                resultMessageDiv.classList.add('bg-amber-100', 'border-2', 'border-amber-200', 'text-amber-900');
            } else {
                resultType = 'success';
                message = `Вы отметили <strong>${checkedCount}</strong> пункта(ов). Хороший результат! <br>Присоединяйтесь к нашей группе, чтобы быть в курсе. <br>${ctaButton}`;
                resultMessageDiv.classList.add('bg-green-100', 'border-2', 'border-green-200', 'text-green-900');
            }
            resultMessageDiv.innerHTML = message;
            resultMessageDiv.classList.remove('hidden');
            resultMessageDiv.classList.add('fade-in');
            resultMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            getGeminiAdvice(checkedItems, resultType);
        }

        checkButton.addEventListener('click', checkResults);
    }

    // 3. ЗАПУСК ИНИЦИАЛИЗАЦИИ
    // Ждем, пока DOM будет готов, чтобы вставить виджет
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }

})();
