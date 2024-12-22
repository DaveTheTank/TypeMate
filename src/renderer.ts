class ClipboardUI {
    constructor() {
        this.initializeUI();
    }

    private initializeUI() {
        const addButton = document.getElementById('add-clipboard');
        const clipboardList = document.getElementById('clipboard-list');
        const settingsButton = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
        const speedDisplay = document.getElementById('typing-speed-display');
        const themeToggle = document.getElementById('theme-toggle');
        const closeButton = document.querySelector('.close-button') as HTMLElement;
        const startDelay = document.getElementById('start-delay') as HTMLInputElement;
        const delayDisplay = document.getElementById('delay-display');
        const saveSettingsButton = document.getElementById('save-settings');

        // Theme Toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                window.electronAPI.saveTheme(newTheme as 'light' | 'dark');
                
                // Icon aktualisieren
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        if (addButton) {
            addButton.addEventListener('click', () => {
                const entry = this.createClipboardEntry();
                clipboardList?.appendChild(entry);
            });
        }

        if (settingsButton && settingsModal) {
            settingsButton.addEventListener('click', () => {
                settingsModal.style.display = 'block';
            });
        }

        if (closeButton && settingsModal) {
            closeButton.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === settingsModal && settingsModal) {
                settingsModal.style.display = 'none';
            }
        });

        // Update speed display
        if (speedSlider && speedDisplay) {
            speedSlider.addEventListener('input', () => {
                speedDisplay.textContent = speedSlider.value;
            });
        }

        // Verzögerungszeit-Anzeige aktualisieren
        if (startDelay && delayDisplay) {
            startDelay.addEventListener('input', () => {
                delayDisplay.textContent = startDelay.value;
            });
        }

        // Einstellungen speichern
        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', () => {
                const settings = {
                    globalHotkey: (document.getElementById('global-hotkey') as HTMLInputElement).value,
                    startDelay: parseFloat(startDelay?.value || '3')
                };
                
                window.electronAPI.saveSettings(settings);
                
                if (settingsModal) {
                    settingsModal.style.display = 'none';
                }
            });
        }

        // Lade gespeicherte Einstellungen
        const loadSettings = async () => {
            try {
                const savedSettings = localStorage.getItem('settings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    if (startDelay) {
                        startDelay.value = settings.startDelay.toString();
                        if (delayDisplay) {
                            delayDisplay.textContent = settings.startDelay.toString();
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };

        loadSettings();
    }

    private createClipboardEntry(): HTMLDivElement {
        const entry = document.createElement('div');
        entry.className = 'clipboard-entry';

        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Text eingeben...';

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const typeButton = document.createElement('button');
        typeButton.innerHTML = '<i class="fas fa-keyboard"></i>';
        typeButton.onclick = async () => {
            try {
                typeButton.classList.add('waiting');
                const delay = parseFloat((document.getElementById('start-delay') as HTMLInputElement).value) * 1000;
                console.log('Starting delay:', delay); // Debug-Log
                await new Promise(resolve => setTimeout(resolve, delay));
                typeButton.classList.remove('waiting');

                typeButton.classList.add('typing');
                const globalSpeedSlider = document.getElementById('speed-slider') as HTMLInputElement;
                await window.electronAPI.typeText({
                    text: textarea.value,
                    speed: parseInt(globalSpeedSlider.value),
                    delay: 0
                });
            } catch (error) {
                console.error('Error during typing:', error);
            } finally {
                typeButton.classList.remove('typing');
            }
        };

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = () => entry.remove();

        buttonContainer.appendChild(typeButton);
        buttonContainer.appendChild(deleteButton);
        
        entry.appendChild(textarea);
        entry.appendChild(buttonContainer);

        return entry;
    }
}

// Initialisierung
new ClipboardUI(); 