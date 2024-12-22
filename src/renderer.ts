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
        const closeButton = document.querySelector('.control-button.close');
        const startDelay = document.getElementById('start-delay') as HTMLInputElement;
        const delayDisplay = document.getElementById('delay-display');
        const saveSettingsButton = document.getElementById('save-settings');
        const minimizeButton = document.querySelector('.control-button.minimize');
        const modalCloseButton = settingsModal?.querySelector('.close-button') as HTMLElement;

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
                setTimeout(() => this.updateWindowSize(), 100);
            });
        }

        if (settingsButton && settingsModal) {
            settingsButton.addEventListener('click', () => {
                settingsModal.style.display = 'block';
            });
        }

        if (modalCloseButton && settingsModal) {
            modalCloseButton.addEventListener('click', () => {
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

        if (minimizeButton) {
            minimizeButton.addEventListener('click', () => {
                window.electronAPI.minimizeWindow();
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => {
                window.electronAPI.closeWindow();
            });
        }

        // Hotkey Recording
        const hotkeyInput = document.getElementById('global-hotkey') as HTMLInputElement;
        const recordButton = document.getElementById('record-hotkey');
        let isRecording = false;
        let firstKey = '';

        if (recordButton && hotkeyInput) {
            recordButton.addEventListener('click', () => {
                isRecording = !isRecording;
                firstKey = ''; // Reset beim Start der Aufnahme
                
                if (isRecording) {
                    hotkeyInput.value = 'Drücken Sie eine Tastenkombination...';
                    hotkeyInput.classList.add('recording');
                    recordButton.classList.add('recording');
                } else {
                    hotkeyInput.classList.remove('recording');
                    recordButton.classList.remove('recording');
                }
            });

            // Hotkey aufnehmen
            document.addEventListener('keydown', (e) => {
                if (!isRecording) return;

                e.preventDefault();

                const modifiers = [];
                if (e.ctrlKey) modifiers.push('Strg');
                if (e.altKey) modifiers.push('Alt');
                if (e.shiftKey) modifiers.push('Shift');

                let key = e.key;
                // Übersetze spezielle Tasten
                if (key === ' ') key = 'Leertaste';
                if (key === 'Control') key = '';
                if (key === 'Alt') key = '';
                if (key === 'Shift') key = '';
                if (key === 'Enter') key = 'Eingabe';
                if (key === 'Escape') key = 'Esc';
                if (key === 'Tab') key = 'Tab';
                if (key === 'ArrowUp') key = '↑';
                if (key === 'ArrowDown') key = '↓';
                if (key === 'ArrowLeft') key = '←';
                if (key === 'ArrowRight') key = '→';

                // Wenn es nur ein Modifier ist, nicht aufnehmen
                if (!key) return;

                // Wenn es Modifikatoren gibt, direkt die Kombination speichern
                if (modifiers.length > 0) {
                    const hotkey = [...modifiers, key].filter(Boolean).join(' + ');
                    if (hotkey) {
                        hotkeyInput.value = hotkey;
                        isRecording = false;
                        hotkeyInput.classList.remove('recording');
                        recordButton.classList.remove('recording');
                    }
                    return;
                }

                // Wenn es die erste Taste ist
                if (!firstKey) {
                    firstKey = key;
                    hotkeyInput.value = `${key} + ...`;
                    return;
                }

                // Wenn es die zweite Taste ist
                const hotkey = `${firstKey} + ${key}`;
                hotkeyInput.value = hotkey;
                isRecording = false;
                firstKey = '';
                hotkeyInput.classList.remove('recording');
                recordButton.classList.remove('recording');
            });
        }

        // Initiale Größenanpassung
        setTimeout(() => this.updateWindowSize(), 100);
    }

    private updateWindowSize() {
        const clipboardList = document.getElementById('clipboard-list');
        const container = document.querySelector('.container') as HTMLElement;
        if (container && clipboardList) {
            // Berechne die tatsächliche Höhe aller Elemente
            const headerHeight = 80;  // Erhöht für Header + Titelleiste
            const speedControlHeight = 80;  // Erhöht für Geschwindigkeitsregler + Margins
            const footerHeight = 60;  // Erhöht für Footer + Margins
            const padding = 40;  // Erhöht für Container-Padding
            const marginBetweenEntries = 20;  // Margin zwischen Einträgen
            
            // Berechne die Höhe aller Einträge inklusive Margins
            const entries = Array.from(clipboardList.children) as HTMLElement[];
            const entriesHeight = entries.reduce((total, entry) => {
                const height = entry.offsetHeight;
                return total + height + marginBetweenEntries;
            }, 0);
            
            // Extra Platz für den "Neuer Eintrag" Button
            const addButtonHeight = 50;
            
            // Gesamthöhe berechnen
            const totalHeight = headerHeight + 
                              speedControlHeight + 
                              entriesHeight + 
                              addButtonHeight +
                              footerHeight + 
                              padding;
            
            // Füge etwas extra Platz hinzu, um sicherzustellen, dass alles sichtbar ist
            const finalHeight = totalHeight + 50;
            
            window.electronAPI.adjustWindowSize(finalHeight);
        }
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
        deleteButton.onclick = () => {
            entry.remove();
            setTimeout(() => this.updateWindowSize(), 0);
        };

        buttonContainer.appendChild(typeButton);
        buttonContainer.appendChild(deleteButton);
        
        entry.appendChild(textarea);
        entry.appendChild(buttonContainer);

        // Größe auch anpassen, wenn sich die Textarea-Höhe ändert
        textarea.addEventListener('input', () => {
            setTimeout(() => this.updateWindowSize(), 0);
        });

        return entry;
    }
}

// Initialisierung
new ClipboardUI(); 