import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface Settings {
    globalHotkey: string;
    startDelay: number;
}

class ClipboardManagerApp {
    private mainWindow: BrowserWindow | null = null;
    private settings: Settings = {
        globalHotkey: '',
        startDelay: 3
    };

    constructor() {
        this.loadSettings();
        app.on('ready', this.createWindow);
        app.on('window-all-closed', this.handleWindowsClosed);
        this.setupIPCHandlers();
    }

    private setupIPCHandlers() {
        ipcMain.on('typeText', async (event, data: { text: string; speed: number; delay: number }) => {
            try {
                console.log('Starting typing with delay:', data.delay);
                await new Promise(resolve => setTimeout(resolve, data.delay));

                const script = `
                    tell application "System Events"
                        repeat with char in (text items of "${data.text}")
                            keystroke char
                            delay ${Math.floor(1000 / data.speed) / 1000}
                        end repeat
                    end tell
                `;
                await execPromise(`osascript -e '${script}'`);
                
                event.reply('typeText-complete');
            } catch (error) {
                console.error('Error typing text:', error);
                event.reply('typeText-error', error);
            }
        });

        ipcMain.on('saveSettings', (event, settings: Settings) => {
            try {
                this.settings = settings;
                this.saveSettings();
                console.log('Settings saved:', settings);
            } catch (error) {
                console.error('Error saving settings:', error);
            }
        });
    }

    private loadSettings() {
        try {
            const settingsPath = path.join(app.getPath('userData'), 'settings.json');
            if (fs.existsSync(settingsPath)) {
                const data = fs.readFileSync(settingsPath, 'utf8');
                this.settings = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    private saveSettings() {
        try {
            const settingsPath = path.join(app.getPath('userData'), 'settings.json');
            fs.writeFileSync(settingsPath, JSON.stringify(this.settings, null, 2));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    private createWindow = (): void => {
        this.mainWindow = new BrowserWindow({
            width: 520,
            height: 500,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            frame: false,
            transparent: true,
            resizable: false,
            titleBarStyle: 'hidden',
            vibrancy: 'window',
            visualEffectState: 'active',
            alwaysOnTop: true,
        });

        this.mainWindow.on('focus', () => {
            if (this.mainWindow) {
                this.mainWindow.setAlwaysOnTop(true, 'floating');
            }
        });

        this.mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }

    private handleWindowsClosed = (): void => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }
}

new ClipboardManagerApp(); 