console.log('script.js loaded');
// 1. Глобальные переменные и константы
// ...
// 2. Утилиты
// Функции для отображения/скрытия загрузчика
function showLoader() {
    const button = document.querySelector('button[type="submit"]');
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загрузка...';
    button.disabled = true;
}

function hideLoader() {
    const button = document.querySelector('button[type="submit"]');
    button.innerHTML = 'Запустить';
    button.disabled = false;
}

// Функция для отображения уведомлений
function showNotification(message, type = 'success') {
    const toast = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div class="toast align-items-center text-white bg-${type}" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toast);
    const toastElement = document.querySelector('.toast');
    const bsToast = new bootstrap.Toast(toastElement);
    bsToast.show();
}

// Обработчик формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('settingsForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showLoader();

            // Собираем данные формы
            const formData = {
                port: document.getElementById('port').value,
                frequency: document.getElementById('frequency').value,
                timer: {
                    enabled: document.getElementById('timerEnabled').checked,
                    value: document.getElementById('timerValue').value
                }
            };

            // Отправляем данные на сервер
            fetch('/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                hideLoader();
                showNotification('Настройки успешно применены', 'success');
            })
            .catch(error => {
                hideLoader();
                showNotification('Произошла ошибка: ' + error.message, 'danger');
            });
        });
    }
});

// 3. Графические функции
// ...
// 4. Обработчики событий
// ...
// 5. Preview и динамика
// ...
// 6. Инициализация
// ...

document.addEventListener('DOMContentLoaded', () => {
    // =====================
    // 3. Вспомогательные функции (утилиты)
    // =====================
    function handleNumericInput(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9.]/g, '');
            if (value.split('.').length > 2) value = value.replace(/\.+$/, '');
            e.target.value = value;
        });
    }
    function updateOffset2Min() {
        const pw1 = parseFloat(pulseWidth1.value);
        const off1 = parseFloat(offset1.value);
        const safePw1 = isNaN(pw1) ? 0 : pw1;
        const safeOff1 = isNaN(off1) ? 0 : off1;
        const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
        const minVal = safePw1 + safeOff1 + interlock;
        offset2.min = minVal;
        offset2.value = minVal;
        offset2.dispatchEvent(new Event('input'));
    }
    function updateOffset4Min() {
        const pw3 = parseFloat(pulseWidth3.value);
        const off3 = parseFloat(offset3.value);
        const safePw3 = isNaN(pw3) ? 0 : pw3;
        const safeOff3 = isNaN(off3) ? 0 : off3;
        const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
        const minVal = safePw3 + safeOff3 + interlock;
        offset4.min = minVal;
        offset4.value = minVal;
        offset4.dispatchEvent(new Event('input'));
    }
    // ... (другие утилиты)

    // =====================
    // 4. События и обработчики для основных блоков
    // =====================
    // --- Пинг/KeepAlive ---
    let pingTimeout;
    let failedPings = 0;
    const MAX_FAILED_PINGS = 3;
    const PING_INTERVAL = 5000; // 5 seconds

    async function doPing() {
        try {
            console.log('Sending ping...');
            const response = await fetch('/ping');
            if (response.ok) {
                console.log('Ping successful');
                failedPings = 0;
            } else {
                console.error('Ping failed with status:', response.status);
                handleFailedPing();
            }
        } catch (error) {
            console.error('Ping failed:', error);
            handleFailedPing();
        }

        // Schedule next ping regardless of success/failure
        pingTimeout = setTimeout(doPing, PING_INTERVAL);
    }

    function startPing() {
        // Clear any existing timeout
        if (pingTimeout) {
            clearTimeout(pingTimeout);
        }
        
        failedPings = 0;
        console.log('Starting ping mechanism...');
        // Start the ping cycle immediately
        doPing();
    }

    function handleFailedPing() {
        failedPings++;
        console.warn(`Failed pings: ${failedPings}/${MAX_FAILED_PINGS}`);
        
        if (failedPings >= MAX_FAILED_PINGS) {
            console.error('Connection lost. Attempting to reconnect...');
            startPing(); // Restart ping mechanism
        }
    }
    
    // Start pinging immediately when page loads
    startPing();

    // --- Перевод период/частота ---
    const periodInput = document.getElementById('period-input');
    const frequencyInput = document.getElementById('frequency-input');
  
    periodInput.addEventListener('input', () => {
        const period = parseFloat(periodInput.value);
        if (period > 0) {
            // Convert period (microseconds) to frequency (Hz)
            const frequency = (1 / period) * 1000000;
            frequencyInput.value = frequency.toFixed(2);
        } else {
            frequencyInput.value = '';
        }
        // --- ДОБАВЛЕНО: обновлять Offset 2 и 4 при изменении Period ---
        updateOffset2Min();
        updateOffset4Min();
    });

    frequencyInput.addEventListener('input', () => {
        const frequency = parseFloat(frequencyInput.value);
        if (frequency > 0) {
            // Convert frequency (Hz) to period (microseconds)
            const period = (1 / frequency) * 1000000;
            periodInput.value = period.toFixed(2);
        } else {
            periodInput.value = '';
        }
        // --- ДОБАВЛЕНО: обновлять Offset 2 и 4 при изменении Frequency ---
        updateOffset2Min();
        updateOffset4Min();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('Tab became visible, restarting ping');
            startPing();
        }
    });

    // Ensure ping continues when page is about to unload
    window.addEventListener('beforeunload', () => {
        if (pingTimeout) {
            clearTimeout(pingTimeout);
        }
        // Send one final ping synchronously
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/ping', false); // false makes it synchronous
            xhr.send();
        } catch (e) {
            console.error('Final ping failed:', e);
        }
    });

    // --- Валидация и форматирование ввода ---
    // Handle port input formatting
    const portInput = document.getElementById('port-select');
    // --- Установка значения порта по умолчанию в зависимости от платформы ---
    if (!portInput.value) {
        if (navigator.platform.startsWith('Win')) {
            portInput.value = 'COM1';
        } else {
            portInput.value = '/dev/serial0';
        }
    }
    portInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            value = Math.min(Math.max(parseInt(value), 1), 30); // Limit between 1 and 30
            e.target.value = value;
        }
    });

    portInput.addEventListener('change', (e) => {
        if (e.target.value) {
            const portNum = Math.min(Math.max(parseInt(e.target.value), 1), 30); // Ensure between 1 and 30
            e.target.value = `COM${portNum}`;
        }
    });

    portInput.addEventListener('blur', (e) => {
        if (e.target.value && !e.target.value.startsWith('COM')) {
            e.target.value = `COM${e.target.value}`;
        }
    });

    portInput.addEventListener('focus', (e) => {
        let value = e.target.value;
        if (value.startsWith('COM')) {
            e.target.value = value.substring(3);
        }
    });

    // Add numeric validation to all inputs except port and modal inputs
    document.querySelectorAll('input[type="text"]:not(#port-select):not(.modal-input)').forEach(input => {
        handleNumericInput(input);
    });

    // --- Переключатели каналов ---
    document.querySelectorAll('.channel-toggle').forEach(toggle => {
        const channelRow = toggle.closest('.channel-row');
        const channelNum = parseInt(toggle.dataset.channel);
        const slider = toggle.nextElementSibling;
        const inputs = channelRow.querySelectorAll(`input[type="text"]:not(.${channelNum === 1 ? 'main-channel-input-1' : 'main-channel-input'})`);
        const mainInput = channelRow.querySelector(channelNum === 1 ? '.main-channel-input-1' : '.main-channel-input');
        toggle.addEventListener('change', () => {
            // Затемнение слайдера
            if (!toggle.checked) {
                slider.classList.add('slider-off');
            } else {
                slider.classList.remove('slider-off');
            }
            // Затемнение всей строки
            if (toggle.checked) {
                channelRow.classList.remove('disabled');
            } else {
                channelRow.classList.add('disabled');
            }
            // Блокировка/разблокировка input-ов
            inputs.forEach(input => {
                input.disabled = !toggle.checked;
            });
            if (mainInput) {
                mainInput.disabled = !toggle.checked;
            }
            // Блокировка/разблокировка блока интерлок для 1 канала
            if (channelNum === 1) {
                // Чекбокс интерлока
                const interlockToggle = channelRow.querySelector('.interlock-toggle');
                if (interlockToggle) interlockToggle.disabled = !toggle.checked;
                // Чекбоксы в выпадающем списке
                channelRow.querySelectorAll('.channels-dropdown-item input[type="checkbox"]').forEach(cb => {
                    cb.disabled = !toggle.checked;
                });
                // Кнопки All/None
                channelRow.querySelectorAll('.channels-btn').forEach(btn => {
                    btn.disabled = !toggle.checked;
                });
                // Сам выпадающий список (чтобы нельзя было открыть)
                const dropdown = channelRow.querySelector('.channels-dropdown-selected');
                if (dropdown) {
                    if (!toggle.checked) {
                        dropdown.setAttribute('tabindex', '-1');
                        dropdown.classList.add('disabled');
                    } else {
                        dropdown.setAttribute('tabindex', '0');
                        dropdown.classList.remove('disabled');
                    }
                }
            }
            // Затемнение positive/negative
            const pos = channelRow.querySelector('.channel-positive');
            const neg = channelRow.querySelector('.channel-negative');
            if (toggle.checked) {
                if (pos) pos.classList.remove('label-dimmed');
                if (neg) neg.classList.remove('label-dimmed');
            } else {
                if (pos) pos.classList.add('label-dimmed');
                if (neg) neg.classList.add('label-dimmed');
            }
        });
        // Инициализация при загрузке
        if (!toggle.checked) {
            slider.classList.add('slider-off');
            channelRow.classList.add('disabled');
            inputs.forEach(input => input.disabled = true);
            if (mainInput) mainInput.disabled = true;
                        // Разблокировка блока интерлок при инициализации (если канал 1 включен)
                        if (channelNum === 1) {
                            const interlockToggle = channelRow.querySelector('.interlock-toggle');
                            if (interlockToggle) interlockToggle.disabled = false;
                            channelRow.querySelectorAll('.channels-dropdown-item input[type="checkbox"]').forEach(cb => {
                                cb.disabled = false;
                            });
                            channelRow.querySelectorAll('.channels-btn').forEach(btn => {
                                btn.disabled = false;
                            });
                            const dropdown = channelRow.querySelector('.channels-dropdown-selected');
                            if (dropdown) {
                                dropdown.setAttribute('tabindex', '0');
                                dropdown.classList.remove('disabled');
                            }
                        }
            
            // Затемнение positive/negative при инициализации
            const pos = channelRow.querySelector('.channel-positive');
            const neg = channelRow.querySelector('.channel-negative');
            if (pos) pos.classList.add('label-dimmed');
            if (neg) neg.classList.add('label-dimmed');
            // Блокировка блока интерлок при инициализации (если канал 1 выключен)
            if (channelNum === 1) {
                const interlockToggle = channelRow.querySelector('.interlock-toggle');
                if (interlockToggle) interlockToggle.disabled = true;
                channelRow.querySelectorAll('.channels-dropdown-item input[type="checkbox"]').forEach(cb => {
                    cb.disabled = true;
                });
                channelRow.querySelectorAll('.channels-btn').forEach(btn => {
                    btn.disabled = true;
                });
                const dropdown = channelRow.querySelector('.channels-dropdown-selected');
                if (dropdown) {
                    dropdown.setAttribute('tabindex', '-1');
                    dropdown.classList.add('disabled');
                }
            }
        } else {
            slider.classList.remove('slider-off');
            channelRow.classList.remove('disabled');
            inputs.forEach(input => { input.disabled = false; });
            if (mainInput) mainInput.disabled = false;
            // Снятие затемнения positive/negative при инициализации
            const pos = channelRow.querySelector('.channel-positive');
            const neg = channelRow.querySelector('.channel-negative');
            if (pos) pos.classList.remove('label-dimmed');
            if (neg) neg.classList.remove('label-dimmed');
        }
    });

    // --- Кнопки Start/Stop/Recipe ---
    // Modal functionality
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        
        // Focus on the first input field if it exists
        const firstInput = modal.querySelector('input[type="text"], textarea');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 100);
        }
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    function hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target.id);
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="block"]');
            openModals.forEach(modal => {
                hideModal(modal.id);
            });
        }
    });

    // Close buttons
    document.getElementById('close-save-modal').addEventListener('click', () => {
        hideModal('save-recipe-modal');
    });

    document.getElementById('close-load-modal').addEventListener('click', () => {
        hideModal('load-recipe-modal');
    });

    // Save recipe button
    document.getElementById('save-recipe').addEventListener('click', () => {
        showModal('save-recipe-modal');
    });

    // Load recipe button
    document.getElementById('load-recipe').addEventListener('click', () => {
        showModal('load-recipe-modal');
        loadServerRecipes();
    });

    // Save to server
    document.getElementById('save-to-server').addEventListener('click', async () => {
        const settings = collectCurrentSettings();
        const recipeName = document.getElementById('recipe-name').value;

        // Add metadata
        settings.metadata = {
            name: recipeName || 'Unnamed Recipe',
            description: '',
            created: new Date().toISOString(),
            version: '1.0'
        };

        try {
            const response = await fetch('/save-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`Recipe saved successfully as: ${result.filename}`);
                hideModal('save-recipe-modal');
                // Clear form
                document.getElementById('recipe-name').value = '';
            } else {
                throw new Error(result.error || 'Failed to save recipe');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Error saving recipe: ' + error.message);
        }
    });

    // Save to file (download)
    document.getElementById('save-to-file').addEventListener('click', () => {
        const settings = collectCurrentSettings();
        const recipeName = document.getElementById('recipe-name').value;
        
        // Add metadata
        settings.metadata = {
            name: recipeName || 'Unnamed Recipe',
            description: '',
            created: new Date().toISOString(),
            version: '1.0'
        };

        try {
            const filename = recipeName ? `${recipeName.replace(/[^a-zA-Z0-9]/g, '_')}.json` : 'pulse-generator-recipe.json';
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Recipe downloaded successfully!');
            hideModal('save-recipe-modal');
            // Clear form
            document.getElementById('recipe-name').value = '';
        } catch (error) {
            console.error('Error downloading recipe:', error);
            alert('Error downloading recipe: ' + error.message);
        }
    });

    // Browse file button
    document.getElementById('browse-file').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    // File input change
    document.getElementById('file-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/load-recipe', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                applyRecipeSettings(result.data);
                alert('Recipe loaded successfully!');
                hideModal('load-recipe-modal');
            } else {
                throw new Error(result.error || 'Failed to load recipe');
            }
        } catch (error) {
            console.error('Error loading recipe:', error);
            alert('Error loading recipe: ' + error.message);
        }
    });

    // Helper function to collect current settings
    function collectCurrentSettings() {
        const settings = {
            period: Number(document.getElementById('period-input').value),
            frequency: Number(document.getElementById('frequency-input').value),
            timer: {
                enabled: document.getElementById('timer-toggle').checked,
                value: Number(document.getElementById('timer-input').value)
            },
            interlock: Number(document.getElementById('interlock-input').value),
            channels: []
        };

        // Collect channel settings
        for (let channel = 1; channel <= 4; channel++) {
            const mainInputClass = channel === 1 ? 'main-channel-input-1' : 'main-channel-input';
            function safeValue(selector) {
                const el = document.querySelector(selector);
                if (!el) {
                    console.warn('Element not found for selector:', selector);
                    return 0;
                }
                return Number(el.value);
            }
            function safeChecked(selector) {
                const el = document.querySelector(selector);
                if (!el) {
                    console.warn('Element not found for selector:', selector);
                    return false;
                }
                return el.checked;
            }
            const channelData = {
                enabled: safeChecked(`.channel-toggle[data-channel="${channel}"]`),
                mainValue: safeValue(`.${mainInputClass}[data-channel="${channel}"]`),
                pulseWidth: safeValue(`.pulse-width-input[data-channel="${channel}"]`),
                offset: safeValue(`.offset-input[data-channel="${channel}"]`),
                power: safeValue(`.power-input[data-channel="${channel}"]`),
                voltage: safeValue(`.voltage-input[data-channel="${channel}"]`)
            };
            if (channel === 1) {
                channelData.interlock = safeChecked(`.interlock-toggle[data-channel="1"]`);
            }
            settings.channels.push(channelData);
        }

        return settings;
    }

    // Helper function to apply recipe settings
    function applyRecipeSettings(settings) {
        // Apply global settings
        document.getElementById('period-input').value = settings.period;
        document.getElementById('frequency-input').value = settings.frequency;
        
        // Apply timer settings
        document.getElementById('timer-toggle').checked = settings.timer.enabled;
        document.getElementById('timer-toggle').dispatchEvent(new Event('change'));
        document.getElementById('timer-input').value = settings.timer.value;

        // Apply interlock value
        if (settings.interlock !== undefined) {
            document.getElementById('interlock-input').value = settings.interlock;
            updateOffset2Min();
            updateOffset4Min();
        }

        // Apply channel settings
        settings.channels.forEach((channel, index) => {
            const channelNum = index + 1;
            const mainInputClass = channelNum === 1 ? 'main-channel-input-1' : 'main-channel-input';
            const toggle = document.querySelector(`.channel-toggle[data-channel="${channelNum}"]`);
            if (toggle) {
                toggle.checked = channel.enabled;
                // Trigger the change event to enable/disable inputs
                toggle.dispatchEvent(new Event('change'));
            }
            
            const mainInput = document.querySelector(`.${mainInputClass}[data-channel="${channelNum}"]`);
            if (mainInput) {
                if (channel.mainValue !== undefined && channel.mainValue !== null) {
                    mainInput.value = channel.mainValue;
                } else {
                    mainInput.value = 0;
                }
            }
            
            document.querySelector(`.pulse-width-input[data-channel="${channelNum}"]`).value = channel.pulseWidth;
            document.querySelector(`.offset-input[data-channel="${channelNum}"]`).value = channel.offset;
            document.querySelector(`.power-input[data-channel="${channelNum}"]`).value = channel.power;
            document.querySelector(`.voltage-input[data-channel="${channelNum}"]`).value = channel.voltage;
            
            // Set interlock state for channel 1
            if (channelNum === 1 && channel.interlock !== undefined) {
                const interlockToggle = document.querySelector(`.interlock-toggle[data-channel="1"]`);
                if (interlockToggle) {
                    interlockToggle.checked = channel.interlock;
                }
            }
        });
    }

    // Load server recipes
    async function loadServerRecipes() {
        const recipesList = document.getElementById('server-recipes-list');
        recipesList.innerHTML = '<p>Loading recipes...</p>';

        try {
            const response = await fetch('/list-recipes');
            const result = await response.json();
            
            if (response.ok) {
                if (result.recipes.length === 0) {
                    recipesList.innerHTML = '<p>No recipes found on server.</p>';
                    return;
                }

                recipesList.innerHTML = '';
                result.recipes.forEach(recipe => {
                    const recipeItem = document.createElement('div');
                    recipeItem.className = 'recipe-item';
                    
                    const modifiedDate = new Date(recipe.modified).toLocaleString();
                    const sizeKB = Math.round(recipe.size / 1024);
                    
                    recipeItem.innerHTML = `
                        <div class="recipe-info">
                            <div class="recipe-name">${recipe.filename}</div>
                            <div class="recipe-meta">Modified: ${modifiedDate} | Size: ${sizeKB} KB</div>
                        </div>
                        <div class="recipe-actions">
                            <button class="btn-small btn-load" onclick="loadServerRecipe('${recipe.filename}')">Load</button>
                            <button class="btn-small btn-delete" onclick="deleteServerRecipe('${recipe.filename}')">Delete</button>
                        </div>
                    `;
                    
                    recipesList.appendChild(recipeItem);
                });
            } else {
                throw new Error(result.error || 'Failed to load recipes');
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            recipesList.innerHTML = '<p>Error loading recipes: ' + error.message + '</p>';
        }
    }

    // Load specific server recipe
    window.loadServerRecipe = async function(filename) {
        try {
            const response = await fetch(`/load-recipe/${filename}`);
            const result = await response.json();
            
            if (response.ok) {
                applyRecipeSettings(result.data);
                alert('Recipe loaded successfully!');
                hideModal('load-recipe-modal');
            } else {
                throw new Error(result.error || 'Failed to load recipe');
            }
        } catch (error) {
            console.error('Error loading recipe:', error);
            alert('Error loading recipe: ' + error.message);
        }
    };

    // Delete server recipe
    window.deleteServerRecipe = async function(filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/delete-recipe/${filename}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Recipe deleted successfully!');
                loadServerRecipes(); // Refresh the list
            } else {
                const result = await response.json();
                throw new Error(result.error || 'Failed to delete recipe');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Error deleting recipe: ' + error.message);
        }
    };

    // Start button
    document.getElementById('start').addEventListener('click', async () => {
        // Показываем overlay и зелёный фон
        document.getElementById('stop-overlay').classList.remove('active');
        document.getElementById('start-overlay').classList.add('active');
        document.body.classList.remove('active-bg-stop');
        document.body.classList.add('active-bg-start');

        const data = {
            port: document.getElementById('port-select').value,
            frequency: parseInt(document.getElementById('frequency-input').value) || 0,
            timer: {
                enabled: document.getElementById('timer-toggle').checked,
                value: parseInt(document.getElementById('timer-input').value) || 0  // value in milliseconds
            },
            activeChannels: [],
            channels: {}
        };

        // Add validation for timer value
        if (data.timer.enabled && (data.timer.value < 0 || data.timer.value > 65534)) {
            alert('Delay start timer must be between 0 and 65534 ms');
            return;
        }

        // Collect data only for enabled channels
        for (let channel = 1; channel <= 4; channel++) {
            const toggle = document.querySelector(`.channel-toggle[data-channel="${channel}"]`);
            const isEnabled = toggle ? toggle.checked : false;
            if (isEnabled) {
                data.activeChannels.push(channel);
                data.channels[channel] = {
                    pulseWidth: Number(document.querySelector(`.pulse-width-input[data-channel="${channel}"]`).value),
                    offset: Number(document.querySelector(`.offset-input[data-channel="${channel}"]`).value),
                    power: Number(document.querySelector(`.power-input[data-channel="${channel}"]`).value),
                    voltage: Number(document.querySelector(`.voltage-input[data-channel="${channel}"]`).value)
                };
                // Add interlock state for channel 1
                if (channel === 1) {
                    const interlockToggle = document.querySelector(`.interlock-toggle[data-channel="1"]`);
                    data.channels[channel].interlock = interlockToggle ? interlockToggle.checked : false;
                }
            }
        }

        try {
            console.log('Sending updated data to server:', data);
            const response = await fetch('/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to start');
            }
            
            // Обновляем состояние кнопок после успешной отправки
            // Кнопка Start остается активной для повторного нажатия
            document.getElementById('stop').disabled = false;
            
            console.log('Data successfully sent to server');
        } catch (error) {
            console.error('Error starting:', error);
            alert(error.message || 'Error starting the generator');
        }
    });

    // Stop button
    document.getElementById('stop').addEventListener('click', async () => {
        // Скрываем overlay и убираем зелёный фон
        document.getElementById('start-overlay').classList.remove('active');
        document.getElementById('stop-overlay').classList.add('active');
        document.body.classList.remove('active-bg-start');
        document.body.classList.add('active-bg-stop');
        try {
            const response = await fetch('/stop', {
                method: 'POST'
            });
            let result = null;
            try {
                result = await response.json();
            } catch (e) {
                // Не JSON, игнорируем
            }
            if (!response.ok) {
                const msg = (result && result.error) ? result.error : 'Failed to stop';
                alert('Ошибка при остановке: ' + msg);
                throw new Error(msg);
            }
            // Кнопка Start остается активной для повторного нажатия
            document.getElementById('stop').disabled = true;
        } catch (error) {
            console.error('Error stopping:', error);
            alert('Ошибка при остановке генератора: ' + (error.message || error));
        }
    });

    // Initialize buttons - Start always enabled, Stop disabled initially
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;

    // Disable inputs for unchecked channels initially
    document.querySelectorAll('.channel-toggle').forEach(toggle => {
        if (!toggle.checked) {
            const channelRow = toggle.closest('.channel-row');
            const inputs = channelRow.querySelectorAll('input[type="text"]');
            inputs.forEach(input => input.disabled = true);
        }
    });

    // Handle timer toggle
    document.getElementById('timer-toggle').addEventListener('change', (e) => {
        const timerControl = e.target.closest('.timer-control');
        const timerInput = document.getElementById('timer-input');
        timerInput.disabled = !e.target.checked;
        if (e.target.checked) {
            timerControl.classList.remove('disabled');
        } else {
            timerControl.classList.add('disabled');
        }
    });
    // Initialize timer state on load
    const timerToggle = document.getElementById('timer-toggle');
    const timerControl = timerToggle.closest('.timer-control');
    const timerInput = document.getElementById('timer-input');
    timerInput.disabled = !timerToggle.checked;
    if (timerToggle.checked) {
        timerControl.classList.remove('disabled');
    } else {
        timerControl.classList.add('disabled');
    }

    // Dropdown for channels
    document.querySelectorAll('.channels-dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const wrapper = btn.closest('.channels-dropdown-wrapper');
            wrapper.classList.toggle('open');
        });
    });
    // Клик вне дропдауна — закрыть
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.channels-dropdown-wrapper.open').forEach(wrapper => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
            }
        });
    });

    // Dropdown for channels
    function updateChannelsDropdownValues() {
        document.querySelectorAll('.channels-dropdown-wrapper').forEach(wrapper => {
            const valuesSpan = wrapper.querySelector('.channels-dropdown-values');
            const checkboxes = wrapper.querySelectorAll('.channels-dropdown-list input[type="checkbox"]');
            const selected = Array.from(checkboxes)
                .map((cb, idx) => cb.checked ? (2 + idx) : null)
                .filter(Boolean);
            if (selected.length > 0) {
                valuesSpan.textContent = selected.join(',');
            } else {
                valuesSpan.textContent = 'select';
            }
        });
    }
    document.querySelectorAll('.channels-dropdown-list input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateChannelsDropdownValues);
    });
    // Первичная инициализация
    updateChannelsDropdownValues();

    // Открытие/закрытие по клику на прямоугольник
    document.querySelectorAll('.channels-dropdown-selected').forEach(box => {
        box.addEventListener('click', function(e) {
            const wrapper = box.closest('.channels-dropdown-wrapper');
            wrapper.classList.toggle('open');
        });
        box.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const wrapper = box.closest('.channels-dropdown-wrapper');
                wrapper.classList.toggle('open');
            }
        });
    });
    // Клик вне дропдауна — закрыть
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.channels-dropdown-wrapper.open').forEach(wrapper => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
            }
        });
    });

    // === Offset 2 4 min logic ===
    const pulseWidth1 = document.querySelector('.pulse-width-input[data-channel="1"]');
    const offset1 = document.querySelector('.offset-input[data-channel="1"]');
    const offset2 = document.querySelector('.offset-input[data-channel="2"]');
    const pulseWidth3 = document.querySelector('.pulse-width-input[data-channel="3"]');
    const offset3 = document.querySelector('.offset-input[data-channel="3"]');
    const offset4 = document.querySelector('.offset-input[data-channel="4"]');

    pulseWidth1.addEventListener('input', updateOffset2Min);
    offset1.addEventListener('input', updateOffset2Min);
    // Инициализация при загрузке
    updateOffset2Min();

    pulseWidth3.addEventListener('input', updateOffset4Min);
    offset3.addEventListener('input', updateOffset4Min);
    // Инициализация при загрузке
    updateOffset4Min();

    offset2.addEventListener('input', function() {
        const pw1 = parseFloat(pulseWidth1.value);
        const off1 = parseFloat(offset1.value);
        const safePw1 = isNaN(pw1) ? 0 : pw1;
        const safeOff1 = isNaN(off1) ? 0 : off1;
        const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
        const minVal = safePw1 + safeOff1 + interlock;
        if (parseFloat(offset2.value) < minVal || offset2.value === '') {
            offset2.value = minVal;
            offset2.dispatchEvent(new Event('input'));
            return;
        }
        if (window.previewActive) {
            const channelRow = offset2.closest('.channel-row');
            const mainInputDiv = channelRow.querySelector('.main-channel-input, .main-channel-input-1');
            const channel = mainInputDiv.dataset.channel;
            const canvas = mainInputDiv.querySelector('.pulse-chart');
            const pulseWidthInput = channelRow.querySelector('.pulse-width-input');
            const periodInput = document.getElementById('period-input');
            const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
            const offset = parseFloat(offset2.value) || 0;
            const period = parseFloat(periodInput.value) || 1000;
            const channelNum = parseInt(channel);
            const reverse = (channelNum === 2 || channelNum === 4);
            drawPulseChart(canvas, pulseWidth, offset, period, null, reverse);
        }
    });

    offset4.addEventListener('input', function() {
        const pw3 = parseFloat(pulseWidth3.value);
        const off3 = parseFloat(offset3.value);
        const safePw3 = isNaN(pw3) ? 0 : pw3;
        const safeOff3 = isNaN(off3) ? 0 : off3;
        const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
        const minVal = safePw3 + safeOff3 + interlock;
        if (parseFloat(offset4.value) < minVal || offset4.value === '') {
            offset4.value = minVal;
            offset4.dispatchEvent(new Event('input'));
            return;
        }
        if (window.previewActive) {
            const channelRow = offset4.closest('.channel-row');
            const mainInputDiv = channelRow.querySelector('.main-channel-input, .main-channel-input-1');
            const channel = mainInputDiv.dataset.channel;
            const canvas = mainInputDiv.querySelector('.pulse-chart');
            const pulseWidthInput = channelRow.querySelector('.pulse-width-input');
            const periodInput = document.getElementById('period-input');
            const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
            const offset = parseFloat(offset4.value) || 0;
            const period = parseFloat(periodInput.value) || 1000;
            const channelNum = parseInt(channel);
            const reverse = (channelNum === 2 || channelNum === 4);
            drawPulseChart(canvas, pulseWidth, offset, period, null, reverse);
        }
    });

    // Добавляем специальные классы слайдерам 1 и 3 канала
    const slider1 = document.querySelector('.channel-toggle[data-channel="1"]').nextElementSibling;
    if (slider1) slider1.classList.add('slider-channel-1');
    const slider3 = document.querySelector('.channel-toggle[data-channel="3"]').nextElementSibling;
    if (slider3) slider3.classList.add('slider-channel-3');

    const slider2 = document.querySelector('.channel-toggle[data-channel="2"]').nextElementSibling;
    if (slider2) slider2.classList.add('slider-channel-2');
    const slider4 = document.querySelector('.channel-toggle[data-channel="4"]').nextElementSibling;
    if (slider4) slider4.classList.add('slider-channel-4');

    // =====================
    // 5. Инициализация состояния при загрузке
    // =====================
    // Set default values of 1000 for all channel inputs
    document.getElementById('period-input').value = '1000';
    document.getElementById('period-input').setAttribute('inputmode', 'decimal');
    document.getElementById('period-input').setAttribute('pattern', '[0-9.]*');
    // Calculate and set default frequency based on period
    const period = 1000.00; // microseconds
    const frequency = (1 / period) * 1000000;
    document.getElementById('frequency-input').value = frequency.toFixed(2);
    document.getElementById('interlock-input').value = '5';
    // Initialize all channel input fields with value 10
    document.querySelectorAll('.channel-row').forEach(channelRow => {
        channelRow.querySelector('.pulse-width-input').value = '10';
        channelRow.querySelector('.offset-input').value = '10';
        channelRow.querySelector('.power-input').value = '10';
        channelRow.querySelector('.voltage-input').value = '10';
    });

    // === ВАЖНО: теперь инициализация Offset 2 и 4 после установки значений ===
    updateOffset2Min();
    updateOffset4Min();

    // =====================
    // 6. Прочие обработчики и служебные функции
    // =====================
    function resizeCanvasToDisplaySize(canvas) {
        const parent = canvas.parentElement;
        const style = getComputedStyle(parent);
        const width = Math.round(parseFloat(style.width));
        const height = Math.round(parseFloat(style.height));
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }
    
    // === ADDED TODAY === функция getPulseData с поддержкой repeat, reverse, maxX
    function getPulseData(pulseWidth, offset, period=1000, repeat=3, reverse=false, maxX=Infinity) {
        // reverse: если true — инвертировать импульс (0↔️1)
        // maxX: максимальное значение X для обрезки графика
        const data = [];
        
        // Проверяем валидность входных данных
        if (pulseWidth < 0 || offset < 0 || period <= 0) {
            console.log('Invalid input data:', {pulseWidth, offset, period});
            return data;
        }
        
        // Ограничиваем количество повторений для производительности
        const maxRepeat = Math.min(repeat, 20);
        console.log(`getPulseData called with: pulseWidth=${pulseWidth}, offset=${offset}, period=${period}, repeat=${repeat}, maxRepeat=${maxRepeat}, maxX=${maxX}`);
        
        for (let n = 0; n < maxRepeat; n++) {
            const base = n * period;
            let points;
            if (!reverse) {
                points = [
                    {x: base + 0, y: 0},
                    {x: base + offset, y: 0},
                    {x: base + offset, y: 1},
                    {x: base + offset + pulseWidth, y: 1},
                    {x: base + offset + pulseWidth, y: 0},
                    {x: base + period, y: 0}
                ];
            } else {
                points = [
                    {x: base + 0, y: 1},
                    {x: base + offset, y: 1},
                    {x: base + offset, y: 0},
                    {x: base + offset + pulseWidth, y: 0},
                    {x: base + offset + pulseWidth, y: 1},
                    {x: base + period, y: 1}
                ];
            }
            
            // Добавляем только те точки, которые не выходят за пределы maxX
            for (const pt of points) {
                if (pt.x <= maxX) {
                    data.push(pt);
                } else {
                    // Если точка выходит за пределы, добавляем точку на границе maxX
                    // с тем же уровнем, что и предыдущая
                    if (data.length > 0) {
                        data.push({x: maxX, y: data[data.length-1].y});
                    }
                    console.log(`Data truncated at maxX=${maxX}, generated ${data.length} points`);
                    return data;
                }
            }
        }
        console.log(`Generated ${data.length} points for ${maxRepeat} repeats`);
        return data;
    }
    
    // === ADDED TODAY === drawPulseChart с поддержкой обрезки и реверса
    function drawPulseChart(canvas, pulseWidth, offset, period=1000, repeat=3, reverse=false) {
        // Проверяем валидность входных данных
        if (isNaN(pulseWidth) || isNaN(offset) || isNaN(period) || 
            pulseWidth < 0 || offset < 0 || period <= 0) {
            console.log('Invalid input data, skipping chart update');
            return;
        }
        
        resizeCanvasToDisplaySize(canvas);
        const width = canvas.width;
        
        // Упрощенная логика расчета количества импульсов
        let showRepeat = 3; // базовое количество
        
        if (repeat === null) {
            const totalPulseWidth = pulseWidth + offset;
            
            // Простая логика: если импульс узкий - больше повторений
            if (totalPulseWidth < period * 0.5) {
                showRepeat = 5; // узкие импульсы
            } else if (totalPulseWidth < period * 0.7) {
                showRepeat = 3; // средние импульсы
            } else if (totalPulseWidth < period) {
                showRepeat = 2;
            }    else {
                showRepeat = 1; // широкие импульсы
            }
            
            console.log(`Simple calculation: totalPulse=${totalPulseWidth}, period=${period}, showRepeat=${showRepeat}`);
        } else {
            showRepeat = repeat;
        }
        
        // Простое масштабирование
        let scaleFactor = 1;
        let maxX = period * showRepeat;
        
        // Масштабируем только если график не помещается
        if (maxX > width) {
            scaleFactor = width / maxX;
            maxX = width;
        }
        
        // Применяем масштабирование
        const scaledPulseWidth = pulseWidth * scaleFactor;
        const scaledOffset = offset * scaleFactor;
        const scaledPeriod = period * scaleFactor;
        
        console.log(`Final: pulse=${scaledPulseWidth}, offset=${scaledOffset}, period=${scaledPeriod}, repeat=${showRepeat}, maxX=${maxX}`);
        
        // Всегда пересоздаем график для надежности
        if (canvas._chart) {
            canvas._chart.destroy();
        }
        
        const chartData = getPulseData(scaledPulseWidth, scaledOffset, scaledPeriod, showRepeat, reverse, maxX);
        
        canvas._chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{
                    label: '',
                    data: chartData,
                    borderColor: '#e91e1e',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0,
                    stepped: true,
                }]
            },
            options: {
                animation: false,
                responsive: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: maxX,
                        display: false
                    },
                    y: {
                        min: -0.1,
                        max: 1.1,
                        display: false
                    }
                }
            }
        });
        
        console.log(`Chart updated with ${chartData.length} points`);
    }

    // === ADDED TODAY === drawPulseChart1 специально для canvas1
    function drawPulseChart1(canvas1, pulseWidth, offset, period=1000, repeat=3, reverse=false) {
        // Проверяем валидность входных данных
        if (isNaN(pulseWidth) || isNaN(offset) || isNaN(period) || 
            pulseWidth < 0 || offset < 0 || period <= 0) {
            console.log('Invalid input data for canvas1, skipping chart update');
            return;
        }
        
        resizeCanvasToDisplaySize(canvas1);
        const width = canvas1.width;
        
        // Специальная логика для canvas1
        let showRepeat = 3; // базовое количество
        
        if (repeat === null) {
            const totalPulseWidth = pulseWidth + offset;
            
            // Специальная логика для canvas1: больше повторений для лучшей видимости
            if (totalPulseWidth < period * 0.3) {
                showRepeat = 5; // узкие импульсы
            } else if (totalPulseWidth < period * 0.7) {
                showRepeat = 3; // средние импульсы
            } else if (totalPulseWidth < period) {
                showRepeat = 2; // средние импульсы
            }else {
                showRepeat = 1; // широкие импульсы
            }
            
            console.log(`Canvas1 calculation: totalPulse=${totalPulseWidth}, period=${period}, showRepeat=${showRepeat}`);
        } else {
            showRepeat = repeat;
        }
        
        // Специальное масштабирование для canvas1
        let scaleFactor = 1;
        let maxX = period * showRepeat;
        
        // Более агрессивное масштабирование для canvas1
        if (maxX > width * 0.9) {
            scaleFactor = (width * 0.9) / maxX;
            maxX = width * 0.9;
        }
        
        // Применяем масштабирование
        const scaledPulseWidth = pulseWidth * scaleFactor;
        const scaledOffset = offset * scaleFactor;
        const scaledPeriod = period * scaleFactor;
        
        console.log(`Canvas1 final: pulse=${scaledPulseWidth}, offset=${scaledOffset}, period=${scaledPeriod}, repeat=${showRepeat}, maxX=${maxX}`);
        
        // Всегда пересоздаем график для надежности
        if (canvas1._chart) {
            canvas1._chart.destroy();
        }
        
        const chartData = getPulseData(scaledPulseWidth, scaledOffset, scaledPeriod, showRepeat, reverse, maxX);
        
        canvas1._chart = new Chart(canvas1.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{
                    label: '',
                    data: chartData,
                    borderColor: '#4c5baf',
                    borderWidth: 2, // Толще линия
                    fill: false,
                    pointRadius: 0,
                    stepped: true,
                }]
            },
            options: {
                animation: false,
                responsive: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: maxX,
                        display: false
                    },
                    y: {
                        min: -0.1,
                        max: 1.1,
                        display: false
                    }
                }
            }
        });
        
        console.log(`Canvas1 chart updated with ${chartData.length} points`);
    }
    
    // === ADDED TODAY === инициализация графиков для каналов 1 и 3
    document.querySelectorAll('.channel-row').forEach(channelRow => {
        const mainInputDiv = channelRow.querySelector('.main-channel-input, .main-channel-input-1');
        const channel = mainInputDiv.dataset.channel;
        const channelNum = parseInt(channel);
        
        // Инициализируем только каналы 1 и 3
        if (channelNum === 1 || channelNum === 3) {
            const canvas = mainInputDiv.querySelector('.pulse-chart');
            const mainInput = mainInputDiv.querySelector('input[type="text"]');
            const pulseWidthInput = channelRow.querySelector('.pulse-width-input');
            const offsetInput = channelRow.querySelector('.offset-input');
            const periodInput = document.getElementById('period-input');
            
            function updateChart() {
                if (!window.previewActive) return;
                
                const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                const offset = parseFloat(offsetInput.value) || 0;
                const period = parseFloat(periodInput.value) || 1000;
                const reverse = true; // Каналы 1 и 3 идут сверху вниз
                
                console.log(`updateChart called for channel ${channelNum}: pulseWidth=${pulseWidth}, offset=${offset}, period=${period}`);
                
                // Пересчитываем количество импульсов при каждом обновлении
                drawPulseChart(canvas, pulseWidth, offset, period, null, reverse);
            }
            
            // Добавляем обработчики для событий изменения
            pulseWidthInput.addEventListener('input', updateChart);
            offsetInput.addEventListener('input', updateChart);
            periodInput.addEventListener('input', updateChart);
        }
    });

    // === ADDED TODAY === инициализация графиков для каналов 2 и 4
    document.querySelectorAll('.channel-row').forEach(channelRow => {
        const mainInputDiv = channelRow.querySelector('.main-channel-input, .main-channel-input-1');
        const channel = mainInputDiv.dataset.channel;
        const channelNum = parseInt(channel);
        
        // Инициализируем только каналы 2 и 4
        if (channelNum === 2 || channelNum === 4) {
            const canvas1 = mainInputDiv.querySelector('.pulse-chart');
            const mainInput = mainInputDiv.querySelector('input[type="text"]');
            const pulseWidthInput = channelRow.querySelector('.pulse-width-input');
            const offsetInput = channelRow.querySelector('.offset-input');
            const periodInput = document.getElementById('period-input');
            
            function updateChart() {
                if (!window.previewActive) return;
                
                const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                const offset = parseFloat(offsetInput.value) || 0;
                const period = parseFloat(periodInput.value) || 1000;
                const reverse = false; // Каналы 2 и 4 идут снизу вверх
                
                console.log(`updateChart called for channel ${channelNum} (REVERSE): pulseWidth=${pulseWidth}, offset=${offset}, period=${period}`);
                
                // Пересчитываем количество импульсов при каждом обновлении
                drawPulseChart1(canvas1, pulseWidth, offset, period, null, reverse);
            }
            
            // Добавляем обработчики для событий изменения
            pulseWidthInput.addEventListener('input', updateChart);
            offsetInput.addEventListener('input', updateChart);
            periodInput.addEventListener('input', updateChart);
        }
    });
    
    // === ADDED TODAY === Preview Toggle через #preview-recipe
    const previewBtn = document.getElementById('preview-recipe');
    window.previewActive = false;
    function setPreviewState(active) {
        window.previewActive = active;
        document.querySelectorAll('.main-channel-input, .main-channel-input-1').forEach(mainInputDiv => {
            const canvas = mainInputDiv.querySelector('.pulse-chart');
            if (canvas) canvas.style.display = active ? '' : 'none';
        });
        previewBtn.textContent = active ? 'Hide Preview' : 'Preview';
        previewBtn.style.background = active ? '#2196F3' : '';
        previewBtn.style.color = active ? '#fff' : '';
    }
    previewBtn.addEventListener('click', () => {
        window.previewActive = !window.previewActive;
        setPreviewState(window.previewActive);
        if (window.previewActive) {
            document.querySelectorAll('.main-channel-input, .main-channel-input-1').forEach(mainInputDiv => {
                const channel = mainInputDiv.dataset.channel;
                const canvas = mainInputDiv.querySelector('.pulse-chart');
                const channelRow = mainInputDiv.closest('.channel-row');
                const pulseWidthInput = channelRow.querySelector('.pulse-width-input');
                const offsetInput = channelRow.querySelector('.offset-input');
                const periodInput = document.getElementById('period-input');
                const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                const offset = parseFloat(offsetInput.value) || 0;
                const period = parseFloat(periodInput.value) || 1000;
                const channelNum = parseInt(channel);
                const reverse = (channelNum === 1 || channelNum === 3);
                
                // Используем правильную функцию в зависимости от канала
                if (channelNum === 2 || channelNum === 4) {
                    drawPulseChart1(canvas, pulseWidth, offset, period, null, reverse);
                } else {
                    drawPulseChart(canvas, pulseWidth, offset, period, null, reverse);
                }
            });
        }
    });
    setPreviewState(false);

    // Добавляю обработчик на изменение interlock-input
    document.getElementById('interlock-input').addEventListener('input', function() {
        updateOffset2Min();
        updateOffset4Min();
    });
    
    // Устанавливаем порт по умолчанию при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        const portSelect = document.getElementById('port-select');
        if (portSelect && !portSelect.value) {
            portSelect.value = '/dev/serial0';
        }
    });
}); 