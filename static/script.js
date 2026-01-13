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

// Обработчик формы (будет перемещен в основной DOMContentLoaded блок)

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
    // Responsive scaling for different screen sizes
    // Preserves layout and element positions
    // =====================
    
    // Function to scale interface - simple and direct approach
    // Works on both PC and Raspberry Pi Chromium
    function scaleInterfaceForScreen() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Target design size
        const targetWidth = 1920;
        const targetHeight = 1080;
        
        // Calculate scale
        const scaleX = viewportWidth / targetWidth;
        const scaleY = viewportHeight / targetHeight;
        const scale = Math.min(scaleX, scaleY, 1.0);
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Scale: ${(scale * 100).toFixed(1)}%`);
        
        // Apply scaling only if needed
        if (scale < 1.0 && viewportWidth < targetWidth) {
            // Try zoom first (works in Chrome, Edge)
            document.documentElement.style.zoom = scale;
            
            // Wait a bit and check if zoom worked
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(document.documentElement);
                const zoomValue = computedStyle.zoom;
                
                // If zoom didn't work (value is normal or 1), use transform
                if (!zoomValue || zoomValue === 'normal' || zoomValue === '1' || parseFloat(zoomValue) === 1) {
                    document.documentElement.style.zoom = '';
                    document.body.style.transform = `scale(${scale})`;
                    document.body.style.transformOrigin = 'top left';
                    document.body.style.width = `${100 / scale}%`;
                    document.body.style.height = `${100 / scale}%`;
                    console.log(`Using transform scale: ${(scale * 100).toFixed(1)}%`);
                } else {
                    console.log(`Using CSS zoom: ${(scale * 100).toFixed(1)}%`);
                }
            }, 50);
            
            // Prevent scrolling (don't set width/height here, let transform handle it)
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            // Reset for larger screens
            document.documentElement.style.zoom = '';
            document.body.style.transform = '';
            document.body.style.transformOrigin = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }
    
    // Call on load and resize
    scaleInterfaceForScreen();
    window.addEventListener('resize', scaleInterfaceForScreen);
    
    // Multiple calls to ensure scaling is applied on Raspberry Pi Chromium
    setTimeout(scaleInterfaceForScreen, 100);
    setTimeout(scaleInterfaceForScreen, 300);
    setTimeout(scaleInterfaceForScreen, 500);
    setTimeout(scaleInterfaceForScreen, 800);
    setTimeout(scaleInterfaceForScreen, 1000);
    setTimeout(scaleInterfaceForScreen, 1500);
    
    // Also call after window is fully loaded
    window.addEventListener('load', function() {
        setTimeout(scaleInterfaceForScreen, 100);
        setTimeout(scaleInterfaceForScreen, 300);
        setTimeout(scaleInterfaceForScreen, 500);
        setTimeout(scaleInterfaceForScreen, 800);
    });
    
    // Also try on page visibility change (for Raspberry Pi)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(scaleInterfaceForScreen, 100);
            setTimeout(scaleInterfaceForScreen, 300);
        }
    });
    
    // =====================
    // Car Dashboard Features
    // =====================
    
    // Form handler
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
    
    // Update current time
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    // Optimized for Raspberry Pi 4: Update time every 2 seconds (reduced frequency)
    updateTime();
    setInterval(updateTime, 2000); // Changed from 1000ms to 2000ms for RPi4
    
    // Navigation tabs functionality
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show/hide content sections based on tab
            const tabName = tab.dataset.tab;
            console.log('Switched to tab:', tabName);
            
            // Hide all panels
            document.querySelector('.control-panel').style.display = 'none';
            document.getElementById('oscilloscope-panel').style.display = 'none';
            
            // Show selected panel
            if (tabName === 'control') {
                document.querySelector('.control-panel').style.display = 'block';
            } else if (tabName === 'oscilloscope') {
                document.getElementById('oscilloscope-panel').style.display = 'flex';
                // Get current channel count and generate oscilloscope channels
                const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
                const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
                generateOscilloscopeChannels(maxChannels);
                initializeOscilloscope();
            }
        });
    });
    
    // =====================
    // 3. Вспомогательные функции (утилиты)
    // =====================
    
    // Function to create a channel card HTML
    function createChannelCard(channelNum) {
        // Channel 1, 3, 5... are negative (odd numbers)
        // Channel 2, 4, 6... are positive (even numbers)
        const polarity = channelNum % 2 === 1 ? 'negative' : 'positive';
        const polarityLabel = channelNum % 2 === 1 ? 'Negative' : 'Positive';
        const polarityClass = channelNum % 2 === 1 ? 'negative' : 'positive';
        
        return `
            <div class="channel-card" data-channel="${channelNum}">
                <div class="channel-header">
                    <div class="channel-toggle-container">
                        <label class="car-switch">
                            <input type="checkbox" class="channel-toggle" data-channel="${channelNum}" checked>
                            <span class="car-switch-slider"></span>
                        </label>
                    </div>
                    <div class="channel-info">
                        <div class="channel-name">Channel ${channelNum}</div>
                        <div class="channel-polarity ${polarityClass}">${polarityLabel}</div>
                    </div>
                </div>
                <div class="channel-visual">
                    <div class="pulse-display" data-channel="${channelNum}">
                        <canvas class="pulse-chart" data-channel="${channelNum}" width="120" height="44"></canvas>
                        <input type="text" class="pulse-value" data-channel="${channelNum}" readonly>
                    </div>
                </div>
                <div class="channel-params">
                    <div class="param-item">
                        <label>Pulse Width</label>
                        <div class="param-input">
                            <input type="text" class="pulse-width-input" data-channel="${channelNum}">
                            <span class="unit">mks</span>
                        </div>
                    </div>
                    <div class="param-item">
                        <label>Offset</label>
                        <div class="param-input">
                            <input type="text" class="offset-input" data-channel="${channelNum}">
                            <span class="unit">mks</span>
                        </div>
                    </div>
                    <div class="param-item">
                        <label>Power</label>
                        <div class="param-input">
                            <input type="text" class="power-input" data-channel="${channelNum}">
                            <span class="unit">W</span>
                        </div>
                    </div>
                    <div class="param-item">
                        <label>Voltage</label>
                        <div class="param-input">
                            <input type="text" class="voltage-input" data-channel="${channelNum}">
                            <span class="unit">V</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Function to generate channels dynamically
    function generateChannels(count) {
        console.log('generateChannels called with count:', count);
        const channelsGrid = document.querySelector('.channels-grid');
        if (!channelsGrid) {
            console.error('channels-grid not found!');
            return;
        }
        
        console.log('Clearing existing channels...');
        // Clear existing channels
        channelsGrid.innerHTML = '';
        
        console.log('Generating', count, 'channels...');
        // Generate new channels
        for (let i = 1; i <= count; i++) {
            const channelHTML = createChannelCard(i);
            channelsGrid.insertAdjacentHTML('beforeend', channelHTML);
        }
        
        // Set max-height based on channel count
        // For 4 channels: no max-height (no scroll)
        // For 8 or 12 channels: set max-height to enable scroll
        if (count <= 4) {
            channelsGrid.style.maxHeight = 'none';
            channelsGrid.style.overflowY = 'visible';
        } else {
            // Set max-height to enable scrolling for 8 and 12 channels
            channelsGrid.style.maxHeight = '600px';
            channelsGrid.style.overflowY = 'auto';
        }
        
        console.log('Channels generated, initializing handlers...');
        // Re-initialize all channel-related functionality
        initializeChannels();
        
        // Initialize all channel input fields with default values and setup interlock handlers
        setTimeout(() => {
            document.querySelectorAll('.channel-card').forEach(channelCard => {
                const pulseWidthInput = channelCard.querySelector('.pulse-width-input');
                const offsetInput = channelCard.querySelector('.offset-input');
                const powerInput = channelCard.querySelector('.power-input');
                const voltageInput = channelCard.querySelector('.voltage-input');
                
                if (pulseWidthInput && !pulseWidthInput.value) pulseWidthInput.value = '10';
                if (offsetInput && !offsetInput.value) offsetInput.value = '10';
                if (powerInput && !powerInput.value) powerInput.value = '10';
                if (voltageInput && !voltageInput.value) voltageInput.value = '10';
            });
            
            // Setup interlock handlers for all channels
            setupInterlockHandlers();
        }, 150);
        
        console.log('Channel initialization complete');
    }
    
    // Function to initialize channel event handlers
    function initializeChannels() {
        // Add numeric validation to all new inputs
        document.querySelectorAll('input[type="text"]:not(#port-select):not(.modal-input)').forEach(input => {
            // Check if already has listener to avoid duplicates
            if (!input.hasAttribute('data-numeric-initialized')) {
                handleNumericInput(input);
                input.setAttribute('data-numeric-initialized', 'true');
            }
        });
        
        // Initialize channel toggles - only for new ones
        document.querySelectorAll('.channel-toggle').forEach(toggle => {
            // Skip if already initialized
            if (toggle.hasAttribute('data-toggle-initialized')) return;
            toggle.setAttribute('data-toggle-initialized', 'true');
            
            const channelCard = toggle.closest('.channel-card');
            const channelNum = parseInt(toggle.dataset.channel);
            const slider = toggle.nextElementSibling;
            const inputs = channelCard.querySelectorAll('input[type="text"]:not(.pulse-value)');
            const mainInput = channelCard.querySelector('.pulse-value');
            
            toggle.addEventListener('change', () => {
                // Затемнение слайдера
                if (!toggle.checked) {
                    slider.classList.add('slider-off');
                } else {
                    slider.classList.remove('slider-off');
                }
                // Затемнение всей карточки канала
                if (toggle.checked) {
                    channelCard.classList.remove('disabled');
                } else {
                    channelCard.classList.add('disabled');
                }
                // Блокировка/разблокировка input-ов
                inputs.forEach(input => {
                    input.disabled = !toggle.checked;
                });
                if (mainInput) {
                    mainInput.disabled = !toggle.checked;
                }
                // Затемнение positive/negative
                const pos = channelCard.querySelector('.channel-polarity.positive');
                const neg = channelCard.querySelector('.channel-polarity.negative');
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
                channelCard.classList.add('disabled');
                inputs.forEach(input => input.disabled = true);
                if (mainInput) mainInput.disabled = true;
                // Затемнение positive/negative при инициализации
                const pos = channelCard.querySelector('.channel-polarity.positive');
                const neg = channelCard.querySelector('.channel-polarity.negative');
                if (pos) pos.classList.add('label-dimmed');
                if (neg) neg.classList.add('label-dimmed');
            } else {
                slider.classList.remove('slider-off');
                channelCard.classList.remove('disabled');
                inputs.forEach(input => { input.disabled = false; });
                if (mainInput) mainInput.disabled = false;
                // Снятие затемнения positive/negative при инициализации
                const pos = channelCard.querySelector('.channel-polarity.positive');
                const neg = channelCard.querySelector('.channel-polarity.negative');
                if (pos) pos.classList.remove('label-dimmed');
                if (neg) neg.classList.remove('label-dimmed');
            }
        });
        
        // Re-initialize pulse charts if needed
        if (typeof initializePulseCharts === 'function') {
            initializePulseCharts();
        }
    }
    
    function handleNumericInput(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9.]/g, '');
            if (value.split('.').length > 2) value = value.replace(/\.+$/, '');
            e.target.value = value;
        });
    }
    // Universal function to update offset minimum for any even channel based on previous odd channel
    function updateOffsetMinForEvenChannel(evenChannelNum) {
        if (evenChannelNum % 2 !== 0) return; // Only work for even channels
        
        const prevChannel = evenChannelNum - 1; // Previous odd channel
        const prevPulseWidth = document.querySelector(`.pulse-width-input[data-channel="${prevChannel}"]`);
        const prevOffset = document.querySelector(`.offset-input[data-channel="${prevChannel}"]`);
        const currentOffset = document.querySelector(`.offset-input[data-channel="${evenChannelNum}"]`);
        
        if (!prevPulseWidth || !prevOffset || !currentOffset) return;
        
        const pw = parseFloat(prevPulseWidth.value) || 0;
        const off = parseFloat(prevOffset.value) || 0;
        const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
        const minVal = pw + off + interlock;
        
        // Store old minimum before updating
        const oldMin = parseFloat(currentOffset.min) || minVal;
        const currentValue = parseFloat(currentOffset.value) || 0;
        
        // Update minimum
        currentOffset.min = minVal;
        
        // If current value is less than new minimum, set it to minimum
        if (currentValue < minVal) {
            currentOffset.value = minVal;
            currentOffset.dispatchEvent(new Event('input'));
        }
        // If old minimum was set and new minimum is less than old, 
        // and current value was at or very close to old minimum,
        // update to new minimum (this handles the case when Pulse Width or Offset decreases)
        else if (oldMin > 0 && minVal < oldMin) {
            // Check if current value was at old minimum (within small tolerance)
            const wasAtOldMin = Math.abs(currentValue - oldMin) < 0.01;
            if (wasAtOldMin) {
                // Current value was at old minimum, update to new minimum
                currentOffset.value = minVal;
                currentOffset.dispatchEvent(new Event('input'));
            }
        }
    }
    
    // Update all even channel offsets based on interlock
    function updateAllEvenChannelOffsets() {
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        // Update offset min for all even channels (2, 4, 6, 8, 10, 12...)
        for (let ch = 2; ch <= maxChannels; ch += 2) {
            updateOffsetMinForEvenChannel(ch);
        }
    }
    
    // Legacy functions for backward compatibility
    function updateOffset2Min() {
        updateOffsetMinForEvenChannel(2);
    }
    function updateOffset4Min() {
        updateOffsetMinForEvenChannel(4);
    }
    // ... (другие утилиты)

    // =====================
    // 4. События и обработчики для основных блоков
    // =====================
    // --- Пинг/KeepAlive ---
    let pingTimeout;
    let failedPings = 0;
    const MAX_FAILED_PINGS = 3;
    const PING_INTERVAL = 10000; // Optimized for Raspberry Pi: 10 seconds (reduced from 5 seconds)

    async function doPing() {
        try {
            // Reduced logging for Raspberry Pi optimization
            // console.log('Sending ping...');
            const response = await fetch('/ping');
            if (response.ok) {
                // console.log('Ping successful');
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
        // Reduced logging for Raspberry Pi optimization
        // console.log('Starting ping mechanism...');
        // console.log('Ping timeout cleared, starting ping cycle...');
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
    console.log('Starting ping mechanism...');
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
        // --- ДОБАВЛЕНО: обновлять все четные каналы Offset при изменении Period ---
        updateAllEvenChannelOffsets();
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
        // --- ДОБАВЛЕНО: обновлять все четные каналы Offset при изменении Frequency ---
        updateAllEvenChannelOffsets();
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
    // Port is now static: /dev/serial0

    // Add numeric validation to all inputs except port and modal inputs
    document.querySelectorAll('input[type="text"]:not(#port-select):not(.modal-input)').forEach(input => {
        handleNumericInput(input);
    });

    // --- Channel count dropdown (custom styled) ---
    const channelsCountDropdown = document.getElementById('channels-count-dropdown');
    const channelsCountSelected = document.getElementById('channels-count-selected');
    const channelsCountMenu = document.getElementById('channels-count-menu');
    const channelsCountValue = channelsCountSelected?.querySelector('.car-dropdown-value');
    
    if (channelsCountDropdown && channelsCountSelected && channelsCountMenu) {
        console.log('Found channels-count-dropdown, setting up event listeners');
        
        // Toggle dropdown menu
        channelsCountSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = channelsCountSelected.classList.contains('active');
            
            // Close all other dropdowns
            document.querySelectorAll('.car-dropdown-selected').forEach(el => {
                if (el !== channelsCountSelected) {
                    el.classList.remove('active');
                    el.nextElementSibling?.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            channelsCountSelected.classList.toggle('active');
            channelsCountMenu.classList.toggle('show');
        });
        
        // Handle item selection
        channelsCountMenu.querySelectorAll('.car-dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = item.dataset.value;
                const count = parseInt(value);
                
                // Update selected value
                if (channelsCountValue) {
                    channelsCountValue.textContent = value;
                }
                
                // Update selected state
                channelsCountMenu.querySelectorAll('.car-dropdown-item').forEach(el => {
                    el.classList.remove('selected');
                });
                item.classList.add('selected');
                
                // Close dropdown
                channelsCountSelected.classList.remove('active');
                channelsCountMenu.classList.remove('show');
                
                console.log('Channel count changed to:', count);
                generateChannels(count);
                
                // Update oscilloscope channels if oscilloscope is visible
                setTimeout(() => {
                    if (document.getElementById('oscilloscope-panel') && 
                        document.getElementById('oscilloscope-panel').style.display !== 'none') {
                        generateOscilloscopeChannels(count);
                        generateOscilloscopeWaveforms();
                    }
                }, 200);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!channelsCountDropdown.contains(e.target)) {
                channelsCountSelected.classList.remove('active');
                channelsCountMenu.classList.remove('show');
            }
        });
        
        // Initialize with default value (4 channels) when page loads
        const initialCount = 4;
        const initialItem = channelsCountMenu.querySelector(`[data-value="${initialCount}"]`);
        if (initialItem) {
            initialItem.classList.add('selected');
        }
        console.log('Initializing with', initialCount, 'channels');
        generateChannels(initialCount);
    } else {
        // Fallback: if dropdown doesn't exist, initialize with 4 channels
        console.warn('channels-count-dropdown not found, initializing with 4 channels');
        generateChannels(4);
    }

    // --- Переключатели каналов ---
    // Channels are now initialized dynamically via generateChannels() function
    // Old static initialization removed - see initializeChannels() function above

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
            port: '/dev/serial0', // Static port
            period: Number(document.getElementById('period-input').value),
            frequency: Number(document.getElementById('frequency-input').value),
            timer: {
                enabled: document.getElementById('timer-toggle').checked,
                value: Number(document.getElementById('timer-input').value)
            },
            interlock: Number(document.getElementById('interlock-input').value),
            channels: []
        };

        // Collect channel settings - get dynamic channel count
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        for (let channel = 1; channel <= maxChannels; channel++) {
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
            updateAllEvenChannelOffsets();
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
            port: '/dev/serial0', // Static port
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

        // Collect data only for enabled channels - use dynamic channel count
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        for (let channel = 1; channel <= maxChannels; channel++) {
            const toggle = document.querySelector(`.channel-toggle[data-channel="${channel}"]`);
            const isEnabled = toggle ? toggle.checked : false;
            if (isEnabled) {
                data.activeChannels.push(channel);
                const pulseWidthEl = document.querySelector(`.pulse-width-input[data-channel="${channel}"]`);
                const offsetEl = document.querySelector(`.offset-input[data-channel="${channel}"]`);
                const powerEl = document.querySelector(`.power-input[data-channel="${channel}"]`);
                const voltageEl = document.querySelector(`.voltage-input[data-channel="${channel}"]`);
                
                data.channels[channel] = {
                    pulseWidth: pulseWidthEl ? Number(pulseWidthEl.value) : 0,
                    offset: offsetEl ? Number(offsetEl.value) : 0,
                    power: powerEl ? Number(powerEl.value) : 0,
                    voltage: voltageEl ? Number(voltageEl.value) : 0
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
            const channelCard = toggle.closest('.channel-card');
            const inputs = channelCard.querySelectorAll('input[type="text"]');
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

    // === Setup interlock handlers for all channels ===
    function setupInterlockHandlers() {
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        // Setup handlers for all odd channels (1, 3, 5, 7, 9, 11...)
        // Each odd channel affects the next even channel
        for (let oddCh = 1; oddCh < maxChannels; oddCh += 2) {
            const evenCh = oddCh + 1;
            const pulseWidthInput = document.querySelector(`.pulse-width-input[data-channel="${oddCh}"]`);
            const offsetInput = document.querySelector(`.offset-input[data-channel="${oddCh}"]`);
            const evenOffsetInput = document.querySelector(`.offset-input[data-channel="${evenCh}"]`);
            
            if (pulseWidthInput && offsetInput && evenOffsetInput) {
                // Remove old listeners if any
                const newPulseWidth = pulseWidthInput.cloneNode(true);
                pulseWidthInput.parentNode.replaceChild(newPulseWidth, pulseWidthInput);
                newPulseWidth.value = pulseWidthInput.value;
                
                const newOffset = offsetInput.cloneNode(true);
                offsetInput.parentNode.replaceChild(newOffset, offsetInput);
                newOffset.value = offsetInput.value;
                
                // Add listeners to update corresponding even channel
                newPulseWidth.addEventListener('input', () => updateOffsetMinForEvenChannel(evenCh));
                newOffset.addEventListener('input', () => updateOffsetMinForEvenChannel(evenCh));
            }
        }
        
        // Setup validation for all even channels
        for (let evenCh = 2; evenCh <= maxChannels; evenCh += 2) {
            const evenOffsetInput = document.querySelector(`.offset-input[data-channel="${evenCh}"]`);
            if (evenOffsetInput) {
                // Remove old listener if any
                const newEvenOffset = evenOffsetInput.cloneNode(true);
                evenOffsetInput.parentNode.replaceChild(newEvenOffset, evenOffsetInput);
                newEvenOffset.value = evenOffsetInput.value;
                
                newEvenOffset.addEventListener('input', function() {
                    const oddCh = evenCh - 1;
                    const prevPulseWidth = document.querySelector(`.pulse-width-input[data-channel="${oddCh}"]`);
                    const prevOffset = document.querySelector(`.offset-input[data-channel="${oddCh}"]`);
                    
                    if (!prevPulseWidth || !prevOffset) return;
                    
                    const pw = parseFloat(prevPulseWidth.value) || 0;
                    const off = parseFloat(prevOffset.value) || 0;
                    const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
                    const minVal = pw + off + interlock;
                    
                    if (parseFloat(newEvenOffset.value) < minVal || newEvenOffset.value === '') {
                        newEvenOffset.value = minVal;
                        newEvenOffset.dispatchEvent(new Event('input'));
                        return;
                    }
                    
                    // Update preview if active
                    if (window.previewActive) {
                        const channelCard = newEvenOffset.closest('.channel-card');
                        const pulseDisplay = channelCard?.querySelector('.pulse-display');
                        const channel = pulseDisplay?.dataset.channel;
                        const canvas = pulseDisplay?.querySelector('.pulse-chart');
                        const pulseWidthInput = channelCard?.querySelector('.pulse-width-input');
                        const periodInput = document.getElementById('period-input');
                        
                        if (canvas && pulseWidthInput && periodInput) {
                            const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                            const offset = parseFloat(newEvenOffset.value) || 0;
                            const period = parseFloat(periodInput.value) || 1000;
                            const channelNum = parseInt(channel);
                            const reverse = (channelNum % 2 === 0); // All even channels are reversed
                            
                            if (!canvas._updateThrottled) {
                                canvas._updateThrottled = throttle(() => {
                                    if (channelNum % 2 === 0) {
                                        drawPulseChart1(canvas, pulseWidth, offset, period, null, reverse);
                                    } else {
                                        drawPulseChart(canvas, pulseWidth, offset, period, null, reverse);
                                    }
                                }, 200);
                            }
                            canvas._updateThrottled();
                        }
                    }
                });
            }
        }
        
        // Initial update
        updateAllEvenChannelOffsets();
    }
    
    // Initialize handlers after channels are generated (will be called from generateChannels)
    // setupInterlockHandlers(); // Moved to generateChannels
    
    // Legacy handlers removed - now handled dynamically in setupInterlockHandlers()
    // Old offset2 and offset4 handlers removed - they are now set up dynamically for all even channels

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
    // Initialize all channel input fields with value 10 (will be done after channels are generated)
    // This is now handled in generateChannels function

    // =====================
    // 6. Прочие обработчики и служебные функции
    // =====================
    function resizeCanvasToDisplaySize(canvas) {
        // Use getBoundingClientRect for actual displayed size
        const rect = canvas.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }
    
    // === OPTIMIZED FOR RASPBERRY PI 4 === функция getPulseData с поддержкой repeat, reverse, maxX
    function getPulseData(pulseWidth, offset, period=1000, repeat=3, reverse=false, maxX=Infinity) {
        // reverse: если true — инвертировать импульс (0↔️1)
        // maxX: максимальное значение X для обрезки графика
        const data = [];
        
        // Проверяем валидность входных данных
        if (pulseWidth < 0 || offset < 0 || period <= 0) {
            return data; // Removed console.log for performance
        }
        
        // Ограничиваем количество повторений для производительности на Raspberry Pi 4
        const maxRepeat = Math.min(repeat, 15); // Reduced from 20 to 15 for RPi4
        // Removed console.log for performance
        
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
                    // Removed console.log for performance
                    return data;
                }
            }
        }
        // Removed console.log for performance
        return data;
    }
    
    // === OPTIMIZED FOR RASPBERRY PI 4 === drawPulseChart с поддержкой обрезки и реверса
    function drawPulseChart(canvas, pulseWidth, offset, period=1000, repeat=3, reverse=false) {
        // Проверяем валидность входных данных
        if (isNaN(pulseWidth) || isNaN(offset) || isNaN(period) || 
            pulseWidth < 0 || offset < 0 || period <= 0) {
            return; // Removed console.log for performance
        }
        
        resizeCanvasToDisplaySize(canvas);
        const width = canvas.width;
        
        // Упрощенная логика расчета количества импульсов - оптимизировано для RPi4
        let showRepeat = 3; // базовое количество
        
        if (repeat === null) {
            const totalPulseWidth = pulseWidth + offset;
            
            // Оптимизированная логика: меньше повторений для лучшей производительности
            if (totalPulseWidth < period * 0.5) {
                showRepeat = 4; // Reduced from 5 to 4 for RPi4
            } else if (totalPulseWidth < period * 0.7) {
                showRepeat = 3;
            } else if (totalPulseWidth < period) {
                showRepeat = 2;
            } else {
                showRepeat = 1;
            }
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
        
        // Всегда пересоздаем график для надежности
        if (canvas._chart) {
            canvas._chart.destroy();
        }
        
        const chartData = getPulseData(scaledPulseWidth, scaledOffset, scaledPeriod, showRepeat, reverse, maxX);
        
        // Optimized Chart.js configuration for Raspberry Pi 4
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
                maintainAspectRatio: false, // Added for better performance
                plugins: { 
                    legend: { display: false },
                    tooltip: { enabled: false } // Disable tooltips for performance
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: maxX,
                        display: false,
                        ticks: { display: false }
                    },
                    y: {
                        min: -0.1,
                        max: 1.1,
                        display: false,
                        ticks: { display: false }
                    }
                },
                elements: {
                    line: {
                        tension: 0 // No smoothing for better performance
                    }
                }
            }
        });
    }

    // === OPTIMIZED FOR RASPBERRY PI 4 === drawPulseChart1 специально для canvas1
    function drawPulseChart1(canvas1, pulseWidth, offset, period=1000, repeat=3, reverse=false) {
        // Проверяем валидность входных данных
        if (isNaN(pulseWidth) || isNaN(offset) || isNaN(period) || 
            pulseWidth < 0 || offset < 0 || period <= 0) {
            return; // Removed console.log for performance
        }
        
        resizeCanvasToDisplaySize(canvas1);
        const width = canvas1.width;
        
        // Оптимизированная логика для canvas1 - меньше повторений для RPi4
        let showRepeat = 3; // базовое количество
        
        if (repeat === null) {
            const totalPulseWidth = pulseWidth + offset;
            
            // Оптимизированная логика: меньше повторений для лучшей производительности
            if (totalPulseWidth < period * 0.3) {
                showRepeat = 4; // Reduced from 5 to 4 for RPi4
            } else if (totalPulseWidth < period * 0.7) {
                showRepeat = 3;
            } else if (totalPulseWidth < period) {
                showRepeat = 2;
            } else {
                showRepeat = 1;
            }
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
        
        // Всегда пересоздаем график для надежности
        if (canvas1._chart) {
            canvas1._chart.destroy();
        }
        
        const chartData = getPulseData(scaledPulseWidth, scaledOffset, scaledPeriod, showRepeat, reverse, maxX);
        
        // Optimized Chart.js configuration for Raspberry Pi 4
        canvas1._chart = new Chart(canvas1.getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{
                    label: '',
                    data: chartData,
                    borderColor: '#4c5baf',
                    borderWidth: 1, // Reduced from 2 to 1 for better performance
                    fill: false,
                    pointRadius: 0,
                    stepped: true,
                }]
            },
            options: {
                animation: false,
                responsive: false,
                maintainAspectRatio: false, // Added for better performance
                plugins: { 
                    legend: { display: false },
                    tooltip: { enabled: false } // Disable tooltips for performance
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: maxX,
                        display: false,
                        ticks: { display: false }
                    },
                    y: {
                        min: -0.1,
                        max: 1.1,
                        display: false,
                        ticks: { display: false }
                    }
                },
                elements: {
                    line: {
                        tension: 0 // No smoothing for better performance
                    }
                }
            }
        });
    }
    
    // === OPTIMIZED FOR RASPBERRY PI 4 === Throttling function for chart updates
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // === OPTIMIZED FOR RASPBERRY PI 4 === инициализация графиков для каналов 1 и 3
    document.querySelectorAll('.channel-card').forEach(channelCard => {
        const pulseDisplay = channelCard.querySelector('.pulse-display');
        const channel = pulseDisplay.dataset.channel;
        const channelNum = parseInt(channel);
        
        // Инициализируем только каналы 1 и 3
        if (channelNum === 1 || channelNum === 3) {
            const canvas = pulseDisplay.querySelector('.pulse-chart');
            const mainInput = pulseDisplay.querySelector('.pulse-value');
            const pulseWidthInput = channelCard.querySelector('.pulse-width-input');
            const offsetInput = channelCard.querySelector('.offset-input');
            const periodInput = document.getElementById('period-input');
            
            function updateChart() {
                if (!window.previewActive) return;
                
                const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                const offset = parseFloat(offsetInput.value) || 0;
                const period = parseFloat(periodInput.value) || 1000;
                const reverse = true; // Каналы 1 и 3 идут сверху вниз
                
                // Removed console.log for performance
                
                // Пересчитываем количество импульсов при каждом обновлении
                drawPulseChart(canvas, pulseWidth, offset, period, null, reverse);
            }
            
            // Optimized for Raspberry Pi 4: throttle chart updates (200ms delay)
            const throttledUpdateChart = throttle(updateChart, 200);
            
            // Добавляем обработчики для событий изменения с throttling
            pulseWidthInput.addEventListener('input', throttledUpdateChart);
            offsetInput.addEventListener('input', throttledUpdateChart);
            periodInput.addEventListener('input', throttledUpdateChart);
        }
    });

    // === OPTIMIZED FOR RASPBERRY PI 4 === инициализация графиков для каналов 2 и 4
    document.querySelectorAll('.channel-card').forEach(channelCard => {
        const pulseDisplay = channelCard.querySelector('.pulse-display');
        const channel = pulseDisplay.dataset.channel;
        const channelNum = parseInt(channel);
        
        // Инициализируем только каналы 2 и 4
        if (channelNum === 2 || channelNum === 4) {
            const canvas1 = pulseDisplay.querySelector('.pulse-chart');
            const mainInput = pulseDisplay.querySelector('.pulse-value');
            const pulseWidthInput = channelCard.querySelector('.pulse-width-input');
            const offsetInput = channelCard.querySelector('.offset-input');
            const periodInput = document.getElementById('period-input');
            
            function updateChart() {
                if (!window.previewActive) return;
                
                const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                const offset = parseFloat(offsetInput.value) || 0;
                const period = parseFloat(periodInput.value) || 1000;
                const reverse = false; // Каналы 2 и 4 идут снизу вверх
                
                // Removed console.log for performance
                
                // Пересчитываем количество импульсов при каждом обновлении
                drawPulseChart1(canvas1, pulseWidth, offset, period, null, reverse);
            }
            
            // Optimized for Raspberry Pi 4: throttle chart updates (200ms delay)
            const throttledUpdateChart = throttle(updateChart, 200);
            
            // Добавляем обработчики для событий изменения с throttling
            pulseWidthInput.addEventListener('input', throttledUpdateChart);
            offsetInput.addEventListener('input', throttledUpdateChart);
            periodInput.addEventListener('input', throttledUpdateChart);
        }
    });
    
    // === ADDED TODAY === Preview Toggle через #preview-recipe
    const previewBtn = document.getElementById('preview-recipe');
    window.previewActive = false;
    function setPreviewState(active) {
        window.previewActive = active;
        document.querySelectorAll('.pulse-display').forEach(pulseDisplay => {
            const canvas = pulseDisplay.querySelector('.pulse-chart');
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
            // Optimized for Raspberry Pi 4: batch updates using requestAnimationFrame
            // This spreads chart updates across frames for better performance
            requestAnimationFrame(() => {
                document.querySelectorAll('.pulse-display').forEach(pulseDisplay => {
                    const channel = pulseDisplay.dataset.channel;
                    const canvas = pulseDisplay.querySelector('.pulse-chart');
                    const channelCard = pulseDisplay.closest('.channel-card');
                    const pulseWidthInput = channelCard.querySelector('.pulse-width-input');
                    const offsetInput = channelCard.querySelector('.offset-input');
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
            });
        }
    });
    setPreviewState(false);

    // Добавляю обработчик на изменение interlock-input
    document.getElementById('interlock-input').addEventListener('input', function() {
        updateAllEvenChannelOffsets();
    });
    
    // Port is now static: /dev/serial0
    
    // =====================
    // Oscilloscope Functions
    // =====================
    
    let oscilloscopeCanvas;
    let oscilloscopeCtx;
    let oscilloscopeAnimationId;
    // Variable to store settings before autoscale
    let savedOscilloscopeSettings = null;
    let oscilloscopeData = {
        channels: {
            1: { 
                enabled: true, 
                data: [], 
                color: '#ffff00',
                position: 0 // individual channel position
            },
            2: { 
                enabled: true, 
                data: [], 
                color: '#00ff00',
                position: 0
            },
            3: { 
                enabled: true, 
                data: [], 
                color: '#0080ff',
                position: 0
            },
            4: { 
                enabled: true, 
                data: [], 
                color: '#ff00ff',
                position: 0
            }
        },
        timeScale: 1,
        voltageScale: 1,
        triggerLevel: 0.5,
        running: false,
        // Analyzer settings
        analyzer: {
            timePerDiv: 10, // microseconds per division
            voltagePerDiv: 1, // volts per division
            timePosition: 0, // time position offset
            voltageOffset: 0, // voltage offset
            cursors: {
                enabled: false,
                a: 20, // percentage
                b: 80  // percentage
            },
            measurements: {
                enabled: false,
                frequency: 0,
                period: 0,
                dutyCycle: 0,
                peakToPeak: 0
            },
            fft: {
                enabled: false,
                window: 'hann'
            },
            spectrum: {
                enabled: false
            }
        }
    };
    
    // Function to generate oscilloscope channels dynamically
    function generateOscilloscopeChannels(count) {
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = count || (channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4);
        
        // Generate channel labels
        const channelLabelsContainer = document.getElementById('oscilloscope-channel-labels');
        if (channelLabelsContainer) {
            channelLabelsContainer.innerHTML = '';
            for (let i = 1; i <= maxChannels; i++) {
                const label = document.createElement('div');
                label.className = `channel-label ch${i}`;
                label.textContent = i;
                channelLabelsContainer.appendChild(label);
            }
        }
        
        // Generate channel controls
        const channelControlsContainer = document.getElementById('oscilloscope-channel-controls');
        if (channelControlsContainer) {
            channelControlsContainer.innerHTML = '';
            for (let i = 1; i <= maxChannels; i++) {
                const channelControl = document.createElement('div');
                channelControl.className = `channel-controls ch${i}`;
                channelControl.innerHTML = `
                    <div class="channel-label">CH${i}</div>
                    <div class="control-group">
                        <label>Position:</label>
                        <input type="range" id="ch${i}-position" class="channel-slider" min="-5" max="5" value="0" step="0.1">
                        <span id="ch${i}-position-value">0V</span>
                    </div>
                `;
                channelControlsContainer.appendChild(channelControl);
            }
        }
        
        // Initialize oscilloscope data for all channels
        oscilloscopeData.channels = {};
        const colors = ['#ffff00', '#00ff00', '#0080ff', '#ff00ff', '#ff8000', '#00ffff', '#ff0080', '#80ff00', '#8000ff', '#ff8080', '#80ff80', '#8080ff'];
        for (let i = 1; i <= maxChannels; i++) {
            oscilloscopeData.channels[i] = {
                enabled: true,
                data: [],
                color: colors[(i - 1) % colors.length],
                position: 0
            };
        }
        
        // Setup event listeners for channel position sliders
        setupOscilloscopeChannelHandlers();
    }
    
    // Function to setup oscilloscope channel handlers
    function setupOscilloscopeChannelHandlers() {
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        for (let i = 1; i <= maxChannels; i++) {
            const slider = document.getElementById(`ch${i}-position`);
            const valueSpan = document.getElementById(`ch${i}-position-value`);
            
            if (slider && valueSpan) {
                // Remove old listeners if any
                const newSlider = slider.cloneNode(true);
                slider.parentNode.replaceChild(newSlider, slider);
                newSlider.value = slider.value;
                
                newSlider.addEventListener('input', function() {
                    const value = parseFloat(newSlider.value);
                    valueSpan.textContent = value.toFixed(1) + 'V';
                    if (oscilloscopeData.channels[i]) {
                        oscilloscopeData.channels[i].position = value;
                    }
                });
            }
        }
    }
    
    function initializeOscilloscope() {
        oscilloscopeCanvas = document.getElementById('oscilloscope-canvas');
        if (!oscilloscopeCanvas) return;
        
        oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
        
        // Generate oscilloscope channels based on current channel count
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        generateOscilloscopeChannels(maxChannels);
        
        // Update oscilloscope time
        updateOscilloscopeTime();
        setInterval(updateOscilloscopeTime, 1000);
        
        // Start oscilloscope animation
        startOscilloscopeAnimation();
        
        // Generate initial waveforms based on PWM settings
        generateOscilloscopeWaveforms();
    }
    
    function updateOscilloscopeTime() {
        // Time update function - no longer needed since header was removed
        // Keeping function for compatibility but it does nothing
    }
    
    function generateOscilloscopeWaveforms() {
        // Get current PWM settings
        const period = parseFloat(document.getElementById('period-input').value) || 1000;
        const frequency = parseFloat(document.getElementById('frequency-input').value) || 1000;
        const interlock = parseFloat(document.getElementById('interlock-input').value) || 0;
        
        // Get current channel count
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        // Generate waveforms for each channel
        for (let channel = 1; channel <= maxChannels; channel++) {
            // Skip if channel doesn't exist in oscilloscopeData
            if (!oscilloscopeData.channels[channel]) {
                continue;
            }
            
            const toggle = document.querySelector(`.channel-toggle[data-channel="${channel}"]`);
            if (!toggle || !toggle.checked) {
                oscilloscopeData.channels[channel].enabled = false;
                continue;
            }
            
            oscilloscopeData.channels[channel].enabled = true;
            
            // Get pulseWidth and offset
            const pulseWidth = parseFloat(document.querySelector(`.pulse-width-input[data-channel="${channel}"]`)?.value) || 10;
            let offset = parseFloat(document.querySelector(`.offset-input[data-channel="${channel}"]`)?.value) || 10;
            
            // For even channels, ensure offset respects minimum value (previous odd channel's pulseWidth + offset + interlock)
            if (channel % 2 === 0) {
                const prevChannel = channel - 1;
                const prevPulseWidth = parseFloat(document.querySelector(`.pulse-width-input[data-channel="${prevChannel}"]`)?.value) || 10;
                const prevOffset = parseFloat(document.querySelector(`.offset-input[data-channel="${prevChannel}"]`)?.value) || 10;
                const minOffset = prevPulseWidth + prevOffset + interlock;
                offset = Math.max(offset, minOffset);
            }
            
            // Generate square wave data - optimized for Raspberry Pi 4 (4GB RAM)
            const data = generateSquareWave(pulseWidth, offset, period, 150); // Optimized: 150 samples for RPi4
            oscilloscopeData.channels[channel].data = data;
        }
    }
    
    function generateSquareWave(pulseWidth, offset, period, samples) {
        // Optimized for Raspberry Pi 4 (4GB RAM) - simple and precise
        const timeStep = period / samples;
        const pulseStart = offset;
        const pulseEnd = offset + pulseWidth;
        
        // Generate simple square wave with precise boundary points
        // Ensure we have exact points at pulse boundaries for accurate scaling
        const data = [];
        
        // Add point at the very start
        data.push({ time: 0, value: 0 });
        
        // Generate samples
        for (let i = 0; i < samples; i++) {
            const time = i * timeStep;
            
            // Skip if time exceeds period
            if (time > period) break;
            
            // Check if pulse is active at this time
            // Use >= for start and <= for end to ensure full pulse width
            let value = 0;
            if (time >= pulseStart && time <= pulseEnd) {
                value = 1;
            }
            
            data.push({ time: time, value: value });
        }
        
        // Add exact boundary points to ensure precise scaling
        // Point just before pulse start
        if (pulseStart > 0) {
            data.push({ time: pulseStart - 0.0001, value: 0 });
        }
        // Point at pulse start (transition up)
        data.push({ time: pulseStart, value: 0 });
        data.push({ time: pulseStart, value: 1 });
        // Point at pulse end (transition down)
        data.push({ time: pulseEnd, value: 1 });
        data.push({ time: pulseEnd, value: 0 });
        
        // Add point at period boundary
        data.push({ time: period, value: 0 });
        
        // Sort by time and remove duplicates
        data.sort((a, b) => a.time - b.time);
        
        // Remove near-duplicates while keeping boundary points
        const uniqueData = [];
        const tolerance = 0.0001;
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const isDuplicate = uniqueData.length > 0 && 
                Math.abs(uniqueData[uniqueData.length - 1].time - point.time) < tolerance &&
                uniqueData[uniqueData.length - 1].value === point.value;
            
            // Keep boundary points even if close
            const isBoundary = Math.abs(point.time - pulseStart) < tolerance || 
                              Math.abs(point.time - pulseEnd) < tolerance ||
                              Math.abs(point.time - 0) < tolerance ||
                              Math.abs(point.time - period) < tolerance;
            
            if (!isDuplicate || isBoundary) {
                uniqueData.push(point);
            }
        }
        
        return uniqueData;
    }
    
    // Optimized for Raspberry Pi 4 (4GB RAM) - lower frame rate
    let lastDrawTime = 0;
    const DRAW_INTERVAL = 150; // Update every 150ms (~6.7 FPS) for better performance on RPi4
    
    function startOscilloscopeAnimation() {
        if (oscilloscopeAnimationId) {
            cancelAnimationFrame(oscilloscopeAnimationId);
        }
        
        lastDrawTime = 0;
        
        function animate(currentTime) {
            // Only draw if enough time has passed (throttle for Raspberry Pi)
            if (currentTime - lastDrawTime >= DRAW_INTERVAL) {
                drawOscilloscope();
                lastDrawTime = currentTime;
            }
            
            oscilloscopeAnimationId = requestAnimationFrame(animate);
        }
        
        oscilloscopeAnimationId = requestAnimationFrame(animate);
    }
    
    function drawOscilloscope() {
        if (!oscilloscopeCanvas || !oscilloscopeCtx) return;
        
        const canvas = oscilloscopeCanvas;
        const ctx = oscilloscopeCtx;
        
        // Resize canvas to match display size - CRITICAL for correct scaling
        const resized = resizeCanvasToDisplaySize(canvas);
        
        // Force grid redraw if canvas was resized
        if (resized) {
            gridImageData = null;
            lastGridSettings = null;
        }
        
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid - MUST use same width as waveforms
        drawGrid(ctx, width, height);
        
        // Draw reference lines
        drawReferenceLines(ctx, width, height);
        
        // Cursors removed
        
        // Draw waveforms for each channel - MUST use same width as grid
        // Get current channel count dynamically
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        for (let channel = 1; channel <= maxChannels; channel++) {
            if (oscilloscopeData.channels[channel] && oscilloscopeData.channels[channel].enabled) {
                drawChannelWaveform(ctx, width, height, channel);
            }
        }
        
        // Draw channel labels (removed from graph)
        // drawChannelLabels(ctx, width, height);
        
        // FFT removed
    }
    
    // Optimized grid drawing for Raspberry Pi - cache grid pattern
    let gridImageData = null;
    let lastGridSettings = null;
    
    function drawGrid(ctx, width, height) {
        // Get current analyzer settings
        const timePerDiv = oscilloscopeData.analyzer.timePerDiv;
        const voltagePerDiv = oscilloscopeData.analyzer.voltagePerDiv;
        const timePosition = oscilloscopeData.analyzer.timePosition;
        const voltageOffset = oscilloscopeData.analyzer.voltageOffset;
        
        // Check if grid needs to be redrawn (settings changed or canvas size changed)
        const gridSettings = {
            width, height, timePerDiv, voltagePerDiv, timePosition, voltageOffset
        };
        const settingsChanged = !lastGridSettings || 
            JSON.stringify(gridSettings) !== JSON.stringify(lastGridSettings);
        
        if (!gridImageData || gridImageData.width !== width || gridImageData.height !== height || settingsChanged) {
            // Create offscreen canvas for grid
            const gridCanvas = document.createElement('canvas');
            gridCanvas.width = width;
            gridCanvas.height = height;
            const gridCtx = gridCanvas.getContext('2d');
            
            // Calculate grid spacing based on Time Base and Voltage Scale
            // Standard oscilloscope: 10 horizontal divisions, 8 vertical divisions
            // IMPORTANT: These values MUST match the time scale calculation in drawChannelWaveform
            const horizontalDivisions = 10; // MUST match majorDivisions in drawChannelWaveform
            const verticalDivisions = 8;
            const majorDivX = width / horizontalDivisions; // Major division spacing (X) - pixels per division
            const majorDivY = height / verticalDivisions; // Major division spacing (Y)
            const subDivisions = 5; // Subdivisions per major division
            const minorDivX = majorDivX / subDivisions; // Minor division spacing (X)
            const minorDivY = majorDivY / subDivisions; // Minor division spacing (Y)
            
            // Calculate offset from time position and voltage offset
            // timePosition is in percentage (-100 to 100)
            const timeOffset = (timePosition / 100) * width;
            // voltageOffset is in volts, convert to pixels: offset_volts / (volts_per_div) * pixels_per_div
            const voltageOffsetPx = (voltageOffset / voltagePerDiv) * majorDivY;
            
            // Draw minor grid lines (lighter)
            gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            gridCtx.lineWidth = 0.5;
            
            // Vertical minor lines
            gridCtx.beginPath();
            const startX = timeOffset % majorDivX;
            for (let x = startX; x < width; x += minorDivX) {
                gridCtx.moveTo(x, 0);
                gridCtx.lineTo(x, height);
            }
            for (let x = startX - minorDivX; x >= 0; x -= minorDivX) {
                gridCtx.moveTo(x, 0);
                gridCtx.lineTo(x, height);
            }
            gridCtx.stroke();
            
            // Horizontal minor lines
            gridCtx.beginPath();
            const centerY = height / 2;
            const startY = centerY + voltageOffsetPx;
            for (let y = startY % minorDivY; y < height; y += minorDivY) {
                gridCtx.moveTo(0, y);
                gridCtx.lineTo(width, y);
            }
            for (let y = (startY % minorDivY) - minorDivY; y >= 0; y -= minorDivY) {
                gridCtx.moveTo(0, y);
                gridCtx.lineTo(width, y);
            }
            gridCtx.stroke();
            
            // Draw major grid lines (darker)
            gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            gridCtx.lineWidth = 1;
            
            // Vertical major lines
            gridCtx.beginPath();
            for (let x = startX; x < width; x += majorDivX) {
                gridCtx.moveTo(x, 0);
                gridCtx.lineTo(x, height);
            }
            for (let x = startX - majorDivX; x >= 0; x -= majorDivX) {
                gridCtx.moveTo(x, 0);
                gridCtx.lineTo(x, height);
            }
            gridCtx.stroke();
            
            // Horizontal major lines
            gridCtx.beginPath();
            for (let y = startY % majorDivY; y < height; y += majorDivY) {
                gridCtx.moveTo(0, y);
                gridCtx.lineTo(width, y);
            }
            for (let y = (startY % majorDivY) - majorDivY; y >= 0; y -= majorDivY) {
                gridCtx.moveTo(0, y);
                gridCtx.lineTo(width, y);
            }
            gridCtx.stroke();
            
            gridImageData = {
                canvas: gridCanvas,
                width: width,
                height: height
            };
            lastGridSettings = gridSettings;
        }
        
        // Draw cached grid
        ctx.drawImage(gridImageData.canvas, 0, 0);
    }
    
    function drawReferenceLines(ctx, width, height) {
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Center line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
    
    function drawChannelWaveform(ctx, width, height, channel) {
        const channelData = oscilloscopeData.channels[channel];
        if (!channelData.data || channelData.data.length === 0) return;
        
        // Optimized visual styling for Raspberry Pi 4
        const baseColor = channelData.color;
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2; // Optimized: reduced from 3 to 2 for better performance
        ctx.lineJoin = 'miter'; // Faster than round
        ctx.lineCap = 'butt'; // Faster than round
        ctx.setLineDash([]);
        
        // Disable shadow for better performance on Raspberry Pi 4
        // Shadow effects are CPU-intensive and can slow down rendering
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        const centerY = height / 2;
        const scaleY = height * 0.4; // Amplitude scale
        
        // Apply analyzer settings
        const timePerDiv = oscilloscopeData.analyzer.timePerDiv;
        const voltagePerDiv = oscilloscopeData.analyzer.voltagePerDiv;
        const timePosition = oscilloscopeData.analyzer.timePosition;
        const voltageOffset = oscilloscopeData.analyzer.voltageOffset;
        
        // Apply individual channel settings
        const channelPosition = channelData.position;
        
        // Get current channel count for dynamic distribution
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        // Calculate vertical offset for each channel to separate them evenly
        // Channels are distributed evenly across the vertical space to avoid overlapping
        // Use 80% of height for distribution to leave margins
        const verticalRange = height * 0.8; // Use 80% of height
        const startOffset = -verticalRange / 2; // Start from top
        
        // Calculate spacing between channels
        const spacing = maxChannels > 1 ? verticalRange / (maxChannels - 1) : 0;
        
        // Calculate offset for this channel (distribute evenly from top to bottom)
        channelVerticalOffset = startOffset + (channel - 1) * spacing;
        
        // Calculate time scale - EXACTLY matching grid
        // Grid uses exactly 10 horizontal major divisions
        // Each major division represents timePerDiv microseconds
        // Formula: pixels_per_division = width / 10 (must match grid)
        // Then: x_position = (time_in_microseconds / timePerDiv) * pixels_per_division
        // This ensures: 10 microseconds at 10mks/div = 1 division exactly
        const NUM_DIVISIONS = 10; // Must match grid's horizontalDivisions
        const pixelsPerDivision = width / NUM_DIVISIONS;
        
        // Calculate time offset from position slider (in pixels)
        // timePosition is -100 to +100, representing percentage shift
        const timeOffsetPixels = (timePosition / 100) * width;
        
        const voltageScale = scaleY / (voltagePerDiv * 8);
        
        ctx.beginPath();
        
        // Track previous point for line drawing
        let previousX = null;
        let previousY = null;
        let previousValue = null;
        let firstPoint = true;
        
        // Optimized loop for Raspberry Pi 4 - calculate scaling factors once
        // Use explicit division formula to ensure exact match with grid
        // Formula: x = (time / timePerDiv) * pixelsPerDivision
        // This ensures: if pulseWidth = timePerDiv, pulse spans exactly 1 division
        const minX = -100;
        const maxX = width + 100;
        
        for (let i = 0; i < channelData.data.length; i++) {
            const point = channelData.data[i];
            
            // Convert time from microseconds to screen X coordinate
            // CRITICAL: Use explicit division to match grid exactly
            // divisions = time_in_microseconds / timePerDiv
            // x = divisions * pixelsPerDivision (ensures exact grid alignment)
            const divisions = point.time / timePerDiv;
            const x = divisions * pixelsPerDivision + timeOffsetPixels;
            
            // Skip points outside visible range (optimized check)
            if (x < minX || x > maxX) continue;
            
            // Apply voltage scaling, global offset, individual channel position, and vertical separation
            const y = centerY - ((point.value - 0.5) * voltageScale) + 
                     (voltageOffset * voltageScale) + 
                     (channelPosition * voltageScale) +
                     channelVerticalOffset;
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                // Draw line to current point
                // For square waves, ensure sharp vertical transitions
                if (previousY !== null && previousValue !== null && 
                    point.value !== previousValue && Math.abs(y - previousY) > voltageScale * 0.1) {
                    // Sharp vertical transition - draw horizontal to same x, then vertical to new y
                    ctx.lineTo(x, previousY);
                    ctx.lineTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            previousX = x;
            previousY = y;
            previousValue = point.value;
        }
        
        // Draw the main waveform
        ctx.stroke();
        
        // Shadow already disabled for performance
    }
    
    function drawChannelLabels(ctx, width, height) {
        // Get current channel count for dynamic distribution
        const channelsCountValue = document.querySelector('#channels-count-selected .car-dropdown-value');
        const maxChannels = channelsCountValue ? parseInt(channelsCountValue.textContent) || 4 : 4;
        
        const labelHeight = 40;
        const labelSpacing = height / (maxChannels + 1);
        
        for (let channel = 1; channel <= maxChannels; channel++) {
            if (!oscilloscopeData.channels[channel] || !oscilloscopeData.channels[channel].enabled) continue;
            
            const y = labelSpacing * channel;
            const color = oscilloscopeData.channels[channel].color;
            
            // Draw channel label background
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(30, y, 20, 0, 2 * Math.PI); // Increased radius from 10 to 20
            ctx.fill();
            
            // Draw channel number
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial'; // Slightly larger font for bigger circles
            ctx.textAlign = 'center';
            ctx.fillText(channel.toString(), 30, y + 5);
        }
    }
    
    
    // Update oscilloscope when PWM settings change
    function updateOscilloscopeFromPWM() {
        if (document.getElementById('oscilloscope-panel').style.display === 'flex') {
            generateOscilloscopeWaveforms();
        }
    }
    
    // Add event listeners to PWM inputs to update oscilloscope
    document.addEventListener('input', function(e) {
        if (e.target.matches('#period-input, #frequency-input, .pulse-width-input, .offset-input, #interlock-input')) {
            updateOscilloscopeFromPWM();
        }
    });
    
    // Add event listeners to channel toggles
    document.addEventListener('change', function(e) {
        if (e.target.matches('.channel-toggle')) {
            updateOscilloscopeFromPWM();
        }
    });
    
    // Initialize oscilloscope when oscilloscope is initialized
    function initializeOscilloscope() {
        oscilloscopeCanvas = document.getElementById('oscilloscope-canvas');
        if (!oscilloscopeCanvas) return;
        
        oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
        
        // Update oscilloscope time
        updateOscilloscopeTime();
        setInterval(updateOscilloscopeTime, 1000);
        
        // Start oscilloscope animation
        startOscilloscopeAnimation();
        
        // Generate initial waveforms based on PWM settings
        generateOscilloscopeWaveforms();
        
        // Initialize analyzer controls
        initializeAnalyzerControls();
    }
    
    function initializeAnalyzerControls() {
        // Time base controls
        const timePerDivSelect = document.getElementById('time-per-div');
        const timePositionSlider = document.getElementById('time-position');
        const timePositionValue = document.getElementById('time-position-value');
        
        if (timePerDivSelect) {
            timePerDivSelect.addEventListener('change', function() {
                oscilloscopeData.analyzer.timePerDiv = parseFloat(this.value);
                updateAnalyzerDisplay();
            });
        }
        
        if (timePositionSlider && timePositionValue) {
            timePositionSlider.addEventListener('input', function() {
                oscilloscopeData.analyzer.timePosition = parseFloat(this.value);
                timePositionValue.textContent = this.value + '%';
                updateAnalyzerDisplay();
            });
        }
        
        // Voltage scale controls
        const voltagePerDivSelect = document.getElementById('voltage-per-div');
        const voltageOffsetSlider = document.getElementById('voltage-offset');
        const voltageOffsetValue = document.getElementById('voltage-offset-value');
        
        if (voltagePerDivSelect) {
            voltagePerDivSelect.addEventListener('change', function() {
                oscilloscopeData.analyzer.voltagePerDiv = parseFloat(this.value);
                updateAnalyzerDisplay();
            });
        }
        
        if (voltageOffsetSlider && voltageOffsetValue) {
            voltageOffsetSlider.addEventListener('input', function() {
                oscilloscopeData.analyzer.voltageOffset = parseFloat(this.value);
                voltageOffsetValue.textContent = this.value + 'V';
                updateAnalyzerDisplay();
            });
        }
        
        // Bottom control buttons
        const autoscaleBtn = document.getElementById('autoscale-btn');
        const undoAutoscaleBtn = document.getElementById('undo-autoscale-btn');
        
        if (autoscaleBtn) {
            autoscaleBtn.addEventListener('click', function() {
                performAutoscale();
            });
        }
        
        if (undoAutoscaleBtn) {
            undoAutoscaleBtn.addEventListener('click', function() {
                undoAutoscale();
            });
        }
        
        // Initialize individual channel controls
        initializeChannelControls();
    }
    
    function initializeChannelControls() {
        // Initialize controls for each channel
        for (let channel = 1; channel <= 4; channel++) {
            const positionSlider = document.getElementById(`ch${channel}-position`);
            const positionValue = document.getElementById(`ch${channel}-position-value`);
            
            if (positionSlider && positionValue) {
                positionSlider.addEventListener('input', function() {
                    oscilloscopeData.channels[channel].position = parseFloat(this.value);
                    positionValue.textContent = this.value + 'V';
                    updateAnalyzerDisplay();
                });
            }
        }
    }
    
    function updateAnalyzerDisplay() {
        // This function is called when analyzer settings change
        // Force grid redraw when settings change
        // Clear grid cache to force redraw with new settings
        gridImageData = null;
        lastGridSettings = null;
        // The actual drawing is handled in drawOscilloscope()
    }
    
    function performAutoscale() {
        // Save current settings before changing them
        savedOscilloscopeSettings = {
            analyzer: {
                timePerDiv: oscilloscopeData.analyzer.timePerDiv,
                voltagePerDiv: oscilloscopeData.analyzer.voltagePerDiv,
                timePosition: oscilloscopeData.analyzer.timePosition,
                voltageOffset: oscilloscopeData.analyzer.voltageOffset
            },
            channels: {}
        };
        
        // Save individual channel positions
        for (let channel = 1; channel <= 4; channel++) {
            savedOscilloscopeSettings.channels[channel] = {
                position: oscilloscopeData.channels[channel].position
            };
        }
        
        // Find all enabled channels and get their pulse width settings
        let pulseWidths = [];
        let hasEnabledChannels = false;
        
        // Get pulse width from PWM settings for each enabled channel
        for (let channel = 1; channel <= 4; channel++) {
            const channelData = oscilloscopeData.channels[channel];
            const toggle = document.querySelector(`.channel-toggle[data-channel="${channel}"]`);
            
            // Check if channel is enabled in oscilloscope
            if (channelData.enabled && toggle && toggle.checked) {
                hasEnabledChannels = true;
                
                // Get pulse width from PWM settings
                const pulseWidthInput = document.querySelector(`.pulse-width-input[data-channel="${channel}"]`);
                if (pulseWidthInput) {
                    const pulseWidth = parseFloat(pulseWidthInput.value) || 0;
                    if (pulseWidth > 0) {
                        pulseWidths.push(pulseWidth);
                    }
                }
            }
        }
        
        // If no enabled channels or no pulse width data, use default values
        if (!hasEnabledChannels || pulseWidths.length === 0) {
        oscilloscopeData.analyzer.timePerDiv = 10;
        oscilloscopeData.analyzer.voltagePerDiv = 1;
        } else {
            // Use the average pulse width to determine optimal Time/Div
            // This ensures the pulse width is approximately 1 division
            const avgPulseWidth = pulseWidths.reduce((sum, pw) => sum + pw, 0) / pulseWidths.length;
            
            // Calculate optimal Time/Div so that pulse width ≈ 1 division
            // Available options: 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000 (microseconds)
            const timePerDivOptions = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
            let optimalTimePerDiv = 10; // Default
            
            // Find the closest value where pulseWidth ≈ 1 division
            // We want pulseWidth / timePerDiv ≈ 1, so timePerDiv ≈ pulseWidth
            let minDiff = Infinity;
            for (let i = 0; i < timePerDivOptions.length; i++) {
                const diff = Math.abs(timePerDivOptions[i] - avgPulseWidth);
                if (diff < minDiff) {
                    minDiff = diff;
                    optimalTimePerDiv = timePerDivOptions[i];
                }
            }
            
            // Ensure we have a reasonable value (at least 1)
            if (optimalTimePerDiv < 1) {
                optimalTimePerDiv = 1;
            }
            
            // Calculate optimal Volt/Div
            // For PWM signals, values are typically 0-1 (amplitude = 1)
            // We want the amplitude (1) to be approximately 1 division
            // So we set voltagePerDiv = 1, which means 1 division = 1V
            // This ensures the pulse height (amplitude of 1) occupies approximately 1 division
            const optimalVoltagePerDiv = 1;
            
            // Set the calculated values
            oscilloscopeData.analyzer.timePerDiv = optimalTimePerDiv;
            oscilloscopeData.analyzer.voltagePerDiv = optimalVoltagePerDiv;
        }
        
        // Reset position and offset settings
        oscilloscopeData.analyzer.timePosition = 0;
        oscilloscopeData.analyzer.voltageOffset = 0;
        
        // Reset individual channel settings
        for (let channel = 1; channel <= 4; channel++) {
            oscilloscopeData.channels[channel].position = 0;
        }
        
        // Update UI
        const timePerDivSelect = document.getElementById('time-per-div');
        const voltagePerDivSelect = document.getElementById('voltage-per-div');
        const timePositionSlider = document.getElementById('time-position');
        const voltageOffsetSlider = document.getElementById('voltage-offset');
        
        if (timePerDivSelect) {
            timePerDivSelect.value = oscilloscopeData.analyzer.timePerDiv.toString();
            // Trigger change event to ensure handlers are called
            timePerDivSelect.dispatchEvent(new Event('change'));
        }
        if (voltagePerDivSelect) {
            voltagePerDivSelect.value = oscilloscopeData.analyzer.voltagePerDiv.toString();
            // Trigger change event to ensure handlers are called
            voltagePerDivSelect.dispatchEvent(new Event('change'));
        }
        if (timePositionSlider) {
            timePositionSlider.value = '0';
            document.getElementById('time-position-value').textContent = '0%';
        }
        if (voltageOffsetSlider) {
            voltageOffsetSlider.value = '0';
            document.getElementById('voltage-offset-value').textContent = '0V';
        }
        
        // Update individual channel controls
        for (let channel = 1; channel <= 4; channel++) {
            const positionSlider = document.getElementById(`ch${channel}-position`);
            const positionValue = document.getElementById(`ch${channel}-position-value`);
            
            if (positionSlider) {
                positionSlider.value = '0';
                if (positionValue) positionValue.textContent = '0V';
            }
        }
        
        updateAnalyzerDisplay();
    }
    
    function undoAutoscale() {
        // Restore saved settings if they exist
        if (!savedOscilloscopeSettings) {
            console.log('No saved settings to restore');
            return;
        }
        
        // Restore analyzer settings
        oscilloscopeData.analyzer.timePerDiv = savedOscilloscopeSettings.analyzer.timePerDiv;
        oscilloscopeData.analyzer.voltagePerDiv = savedOscilloscopeSettings.analyzer.voltagePerDiv;
        oscilloscopeData.analyzer.timePosition = savedOscilloscopeSettings.analyzer.timePosition;
        oscilloscopeData.analyzer.voltageOffset = savedOscilloscopeSettings.analyzer.voltageOffset;
        
        // Restore individual channel positions
        for (let channel = 1; channel <= 4; channel++) {
            if (savedOscilloscopeSettings.channels[channel]) {
                oscilloscopeData.channels[channel].position = savedOscilloscopeSettings.channels[channel].position;
            }
        }
        
        // Update UI elements
        const timePerDivSelect = document.getElementById('time-per-div');
        const voltagePerDivSelect = document.getElementById('voltage-per-div');
        const timePositionSlider = document.getElementById('time-position');
        const voltageOffsetSlider = document.getElementById('voltage-offset');
        
        if (timePerDivSelect) {
            // Convert to number and find the closest matching option
            const timePerDivValue = parseFloat(oscilloscopeData.analyzer.timePerDiv);
            // Try to find exact match first, then closest value
            const timePerDivStr = timePerDivValue.toString();
            // Check if the value exists in select options
            const optionExists = Array.from(timePerDivSelect.options).some(opt => parseFloat(opt.value) === timePerDivValue);
            if (optionExists) {
                timePerDivSelect.value = timePerDivStr;
            } else {
                // Find closest value
                const timePerDivOptions = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
                let closestValue = timePerDivOptions[0];
                let minDiff = Math.abs(timePerDivOptions[0] - timePerDivValue);
                for (let i = 1; i < timePerDivOptions.length; i++) {
                    const diff = Math.abs(timePerDivOptions[i] - timePerDivValue);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestValue = timePerDivOptions[i];
                    }
                }
                timePerDivSelect.value = closestValue.toString();
            }
            // Trigger change event to ensure handlers are called
            timePerDivSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (voltagePerDivSelect) {
            // Convert to number and find the closest matching option
            const voltagePerDivValue = parseFloat(oscilloscopeData.analyzer.voltagePerDiv);
            // Try to find exact match first, then closest value
            const voltagePerDivStr = voltagePerDivValue.toString();
            // Check if the value exists in select options
            const optionExists = Array.from(voltagePerDivSelect.options).some(opt => parseFloat(opt.value) === voltagePerDivValue);
            if (optionExists) {
                voltagePerDivSelect.value = voltagePerDivStr;
            } else {
                // Find closest value
                const voltagePerDivOptions = [0.1, 0.2, 0.5, 1, 2, 5, 10];
                let closestValue = voltagePerDivOptions[0];
                let minDiff = Math.abs(voltagePerDivOptions[0] - voltagePerDivValue);
                for (let i = 1; i < voltagePerDivOptions.length; i++) {
                    const diff = Math.abs(voltagePerDivOptions[i] - voltagePerDivValue);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestValue = voltagePerDivOptions[i];
                    }
                }
                voltagePerDivSelect.value = closestValue.toString();
            }
            // Trigger change event to ensure handlers are called
            voltagePerDivSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (timePositionSlider) {
            const timePositionValue = parseFloat(oscilloscopeData.analyzer.timePosition);
            timePositionSlider.value = timePositionValue.toString();
            // Trigger input event to update the display value
            timePositionSlider.dispatchEvent(new Event('input', { bubbles: true }));
            const timePositionValueEl = document.getElementById('time-position-value');
            if (timePositionValueEl) {
                timePositionValueEl.textContent = timePositionValue + '%';
            }
        }
        if (voltageOffsetSlider) {
            const voltageOffsetValue = parseFloat(oscilloscopeData.analyzer.voltageOffset);
            voltageOffsetSlider.value = voltageOffsetValue.toString();
            // Trigger input event to update the display value
            voltageOffsetSlider.dispatchEvent(new Event('input', { bubbles: true }));
            const voltageOffsetValueEl = document.getElementById('voltage-offset-value');
            if (voltageOffsetValueEl) {
                voltageOffsetValueEl.textContent = voltageOffsetValue + 'V';
            }
        }
        
        // Update individual channel controls
        for (let channel = 1; channel <= 4; channel++) {
            const positionSlider = document.getElementById(`ch${channel}-position`);
            const positionValue = document.getElementById(`ch${channel}-position-value`);
            
            if (positionSlider) {
                const channelPosition = parseFloat(oscilloscopeData.channels[channel].position);
                positionSlider.value = channelPosition.toString();
                // Trigger input event to update the display value
                positionSlider.dispatchEvent(new Event('input', { bubbles: true }));
                if (positionValue) {
                    positionValue.textContent = channelPosition + 'V';
                }
            }
        }
        
        // Force grid redraw after restoring settings
        // Clear grid cache to force redraw with restored settings
        gridImageData = null;
        lastGridSettings = null;
        
        // Update display to reflect restored settings
        updateAnalyzerDisplay();
    }
}); 