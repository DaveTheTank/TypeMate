// Definieren Sie den Typ für das Window-Objekt
declare global {
    interface Window {
        electronAPI: {
            saveClipboard: (data: any) => void;
            saveSettings: (settings: any) => void;
            typeText: (data: { text: string, speed: number, delay: number }) => void;
            saveTheme: (theme: string) => void;
        }
    }
}

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

        document.addEventListener('keydown', (e) => {
            if (!this.isRecording) return;
            e.preventDefault();
            e.stopPropagation();

            let keys = [];
            if (e.metaKey) keys.push('⌘');
            if (e.ctrlKey) keys.push('⌃');
            if (e.altKey) keys.push('⌥');
            if (e.shiftKey) keys.push('⇧');
            
            // Füge nur Nicht-Modifier-Tasten hinzu
            if (!['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
                // Wandle spezielle Tasten in lesbare Namen um
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

                keys.push(keyName);
            }

            if (keys.length > 0) {
                this.hotkeyInput.value = keys.join(' + ');
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

        // Escape beendet die Aufnahme
        document.addEventListener('keyup', (e) => {
            if (this.isRecording && e.key === 'Escape') {
                this.hotkeyInput.value = '';
                stopRecording();
            }
        });
    }

    private createNewClipboard() {
        const clipboardDiv = document.createElement('div');
        clipboardDiv.className = 'clipboard-entry';
        
        const contentInput = document.createElement('textarea');
        contentInput.placeholder = 'Text eingeben...';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const typeButton = document.createElement('button');
        typeButton.innerHTML = '<i class="fas fa-keyboard"></i>';
        typeButton.title = 'Text tippen';
        typeButton.onclick = () => {
            const text = contentInput.value;
            const speed = parseInt(this.speedSlider.value);
            const delay = parseInt(this.startDelay.value) * 1000;
            window.electronAPI.typeText({ text, speed, delay });
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
    }

    private saveSettings() {
        const settings = {
            globalHotkey: this.globalHotkey.value,
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    new ClipboardUI();
}); 