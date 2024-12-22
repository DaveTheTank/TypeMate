class ClipboardUI {
    private clipboardList: HTMLDivElement;
    private addButton: HTMLButtonElement;
    private settingsButton: HTMLButtonElement;
    private settingsModal: HTMLDivElement;
    private speedSlider: HTMLInputElement;
    private speedDisplay: HTMLSpanElement;
    private globalHotkey: HTMLInputElement;
    private startDelay: HTMLInputElement;
    private delayDisplay: HTMLSpanElement;
    private hotkeyInput: HTMLInputElement;
    private recordButton: HTMLButtonElement;
    private isRecording: boolean = false;
    private themeToggle: HTMLButtonElement;
    private activeClipboardText: string = '';
    private activeClipboardEntry: HTMLDivElement | null = null;

    constructor() {
        this.clipboardList = document.getElementById('clipboard-list') as HTMLDivElement;
        this.addButton = document.getElementById('add-clipboard') as HTMLButtonElement;
        this.settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
        this.settingsModal = document.getElementById('settings-modal') as HTMLDivElement;
        this.speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
        this.speedDisplay = document.getElementById('typing-speed-display') as HTMLSpanElement;
        this.globalHotkey = document.getElementById('global-hotkey') as HTMLInputElement;
        this.startDelay = document.getElementById('start-delay') as HTMLInputElement;
        this.delayDisplay = document.getElementById('delay-display') as HTMLSpanElement;
        this.hotkeyInput = document.getElementById('global-hotkey') as HTMLInputElement;
        this.recordButton = document.getElementById('record-hotkey') as HTMLButtonElement;
        this.themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
        
        this.setupEventListeners();
        this.setupHotkeyRecording();
        this.loadTheme();
        this.setupThemeToggle();
        console.log('ClipboardUI initialized');
    }

    private setupEventListeners() {
        this.addButton.addEventListener('click', () => {
            console.log('Add button clicked');
            this.createNewClipboard();
        });

        this.settingsButton.addEventListener('click', () => {
            this.settingsModal.style.display = 'block';
        });

        this.speedSlider.addEventListener('input', () => {
            this.speedDisplay.textContent = this.speedSlider.value;
        });

        this.startDelay.addEventListener('input', () => {
            this.delayDisplay.textContent = this.startDelay.value;
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.settingsModal) {
                this.settingsModal.style.display = 'none';
            }
        });

        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
            this.settingsModal.style.display = 'none';
        });
    }

    private setupHotkeyRecording() {
        const startRecording = () => {
            this.isRecording = true;
            this.hotkeyInput.value = 'Drücke Tastenkombination...';
            this.hotkeyInput.classList.add('recording');
            this.recordButton.classList.add('recording');
            pressedKeys.clear();
        };

        const stopRecording = () => {
            this.isRecording = false;
            this.hotkeyInput.classList.remove('recording');
            this.recordButton.classList.remove('recording');
        };

        this.hotkeyInput.addEventListener('click', startRecording);
        this.recordButton.addEventListener('click', () => {
            if (this.isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });

        // Speichere die aktuell gedrückten Tasten
        let pressedKeys = new Set<string>();
        let finalHotkey = '';

        document.addEventListener('keydown', (e) => {
            if (!this.isRecording) return;
            e.preventDefault();
            e.stopPropagation();

            // Füge die Taste zum Set hinzu
            if (e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
                const keyName = {
                    'ArrowUp': '↑',
                    'ArrowDown': '↓',
                    'ArrowLeft': '←',
                    'ArrowRight': '→',
                    'Enter': '↵',
                    'Escape': 'Esc',
                    'Tab': '⇥',
                    ' ': 'Space'
                }[e.key] || e.key.toUpperCase();
                pressedKeys.add(keyName);
            }

            // Füge Modifier-Tasten hinzu
            if (e.metaKey) pressedKeys.add('⌘');
            if (e.ctrlKey) pressedKeys.add('⌃');
            if (e.altKey) pressedKeys.add('⌥');
            if (e.shiftKey) pressedKeys.add('⇧');

            // Aktualisiere das Input-Feld
            if (pressedKeys.size > 0) {
                finalHotkey = Array.from(pressedKeys).join(' + ');
                this.hotkeyInput.value = finalHotkey;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (!this.isRecording) return;
            
            if (e.key === 'Escape') {
                pressedKeys.clear();
                this.hotkeyInput.value = '';
                stopRecording();
                return;
            }

            // Wenn mindestens eine nicht-Modifier Taste dabei ist, beende die Aufnahme
            const hasNonModifier = Array.from(pressedKeys).some(key => 
                !['⌘', '⌃', '⌥', '⇧'].includes(key));

            if (hasNonModifier) {
                this.hotkeyInput.value = finalHotkey;
                stopRecording();
            }
        });

        // Klick außerhalb beendet die Aufnahme
        document.addEventListener('click', (e) => {
            if (this.isRecording && 
                e.target !== this.hotkeyInput && 
                e.target !== this.recordButton) {
                stopRecording();
            }
        });
    }

    private createNewClipboard() {
        const clipboardDiv = document.createElement('div');
        clipboardDiv.className = 'clipboard-entry';
        
        const contentInput = document.createElement('textarea');
        contentInput.placeholder = 'Text eingeben...';
        
        clipboardDiv.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;
            
            this.clipboardList.querySelectorAll('.clipboard-entry').forEach(entry => {
                entry.classList.remove('active');
            });
            
            clipboardDiv.classList.add('active');
            this.activeClipboardEntry = clipboardDiv;
            this.activeClipboardText = contentInput.value;
        });
        
        contentInput.addEventListener('input', () => {
            if (clipboardDiv.classList.contains('active')) {
                this.activeClipboardText = contentInput.value;
            }
        });
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const typeButton = document.createElement('button');
        typeButton.innerHTML = '<i class="fas fa-keyboard"></i>';
        typeButton.title = 'Text tippen';
        typeButton.onclick = async () => {
            const text = contentInput.value;
            const speed = parseInt(this.speedSlider.value);
            const delay = parseInt(this.startDelay.value) * 1000;

            try {
                // Warte-Status
                typeButton.classList.add('waiting');
                await new Promise(resolve => setTimeout(resolve, delay));
                typeButton.classList.remove('waiting');

                // Tipp-Status
                typeButton.classList.add('typing');
                await window.electronAPI.typeText({ text, speed, delay: 0 });
            } catch (error) {
                console.error('Error typing text:', error);
            } finally {
                // Reset Button-Status nach dem Tippen
                typeButton.classList.remove('typing');
                typeButton.classList.remove('waiting');
            }
        };
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Clipboard löschen';
        deleteButton.onclick = () => {
            clipboardDiv.remove();
        };
        
        buttonContainer.appendChild(typeButton);
        buttonContainer.appendChild(deleteButton);
        
        clipboardDiv.appendChild(contentInput);
        clipboardDiv.appendChild(buttonContainer);
        this.clipboardList.appendChild(clipboardDiv);

        if (this.clipboardList.children.length === 1) {
            clipboardDiv.classList.add('active');
            this.activeClipboardEntry = clipboardDiv;
            this.activeClipboardText = contentInput.value;
        }
    }

    public async typeActiveClipboard() {
        console.log('typeActiveClipboard called');

        if (!this.activeClipboardEntry) {
            console.log('Kein aktiver Clipboard gefunden');
            return;
        }

        const contentInput = this.activeClipboardEntry.querySelector('textarea') as HTMLTextAreaElement;
        if (!contentInput || !contentInput.value) {
            console.log('Kein Text im aktiven Clipboard gefunden');
            return;
        }

        const text = contentInput.value;
        const speed = parseInt(this.speedSlider.value);
        const delay = parseInt(this.startDelay.value) * 1000;

        try {
            const typeButton = this.activeClipboardEntry.querySelector('button') as HTMLButtonElement;
            if (typeButton) {
                // Warte-Status
                typeButton.classList.add('waiting');
                console.log('Warte für', delay, 'ms');
                await new Promise(resolve => setTimeout(resolve, delay));
                typeButton.classList.remove('waiting');

                // Tipp-Status
                typeButton.classList.add('typing');
                console.log('Starte Tippen:', { text, speed });
                
                // Tippe den Text ohne zusätzliche Verzögerung
                await window.electronAPI.typeText({
                    text,
                    speed,
                    delay: 0  // Keine zusätzliche Verzögerung hier
                });
            }
        } catch (error) {
            console.error('Error typing active clipboard:', error);
        } finally {
            if (this.activeClipboardEntry) {
                const typeButton = this.activeClipboardEntry.querySelector('button');
                if (typeButton) {
                    typeButton.classList.remove('typing');
                }
            }
        }
    }

    private saveSettings() {
        const settings = {
            globalHotkey: this.hotkeyInput.value,
            startDelay: parseInt(this.startDelay.value)
        };
        window.electronAPI.saveSettings(settings);
    }

    private setupThemeToggle() {
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            window.electronAPI.saveTheme(newTheme);
        });
    }

    private loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    private setTheme(theme: string) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
}

let clipboardUI: ClipboardUI;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    clipboardUI = new ClipboardUI();
    (window as any).clipboardUI = clipboardUI;
}); 