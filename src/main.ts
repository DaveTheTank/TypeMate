import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
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
        app.on('will-quit', this.cleanup);
        this.setupIPCHandlers();
    }

    private setupIPCHandlers() {
        ipcMain.on('typeText', async (event, data: { text: string; speed: number; delay: number }) => {
            try {
                if (process.platform === 'win32') {
                    const ks = require('node-key-sender');
                    const path = require('path');
                    
                    const jarPath = app.isPackaged 
                        ? path.join(process.resourcesPath, 'resources/jar/key-sender.jar')
                        : path.join(__dirname, '../node_modules/node-key-sender/jar/key-sender.jar');
                    
                    console.log('JAR Path:', jarPath);
                    console.log('File exists:', fs.existsSync(jarPath));
                    
                    ks.setKeyboardLayout("QWERTZ");
                    ks.jarPath = jarPath;
                    
                    const charDelay = Math.floor(200 / data.speed);
                    ks.setOption('globalDelayPressMillisec', charDelay);
                    const chunkSize = 50;
                    
                    for (let i = 0; i < data.text.length; i += chunkSize) {
                        const chunk = data.text.slice(i, i + chunkSize);
                        await ks.sendText(chunk);
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                } else {
                    const script = `
                        tell application "System Events"
                            repeat with char in (text items of "${data.text}")
                                keystroke char
                                delay ${Math.floor(500 / data.speed) / 1000}
                            end repeat
                        end tell
                    `;
                    await execPromise(`osascript -e '${script}'`);
                }
                
                event.reply('typeText-complete');
            } catch (error) {
                console.error('Error typing text:', error);
                event.reply('typeText-error', error);
            }
        });

        ipcMain.on('saveSettings', (event, settings: Settings) => {
            try {
                if (this.settings.globalHotkey) {
                    globalShortcut.unregister(this.settings.globalHotkey);
                }

                this.settings = settings;
                
                if (settings.globalHotkey) {
                    const electronHotkey = this.convertHotkeyToElectron(settings.globalHotkey);
                    
                    globalShortcut.register(electronHotkey, () => {
                        if (this.mainWindow) {
                            this.mainWindow.show();
                            this.mainWindow.focus();
                        }
                    });
                }

                this.saveSettings();
                console.log('Settings saved:', settings);
            } catch (error) {
                console.error('Error saving settings:', error);
            }
        });

        ipcMain.on('minimize-window', () => {
            if (this.mainWindow) {
                this.mainWindow.minimize();
            }
        });

        ipcMain.on('close-window', () => {
            if (this.mainWindow) {
                this.mainWindow.close();
            }
        });

        ipcMain.on('adjust-window-size', (_, height) => {
            if (this.mainWindow) {
                const { height: screenHeight } = require('electron').screen.getPrimaryDisplay().workAreaSize;
                const maxHeight = Math.floor(screenHeight * 0.9);
                const minHeight = 500;
                
                const newHeight = Math.min(Math.max(height + 20, minHeight), maxHeight);
                
                this.mainWindow.setSize(520, newHeight);
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
            resizable: true,
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

        this.mainWindow.on('will-resize', (event) => {
            event.preventDefault();
        });

        this.mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }

    private handleWindowsClosed = (): void => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    private convertHotkeyToElectron(hotkey: string): string {
        return hotkey
            .replace('Strg', 'CommandOrControl')
            .replace('Alt', 'Alt')
            .replace('Shift', 'Shift')
            .replace('Eingabe', 'Return')
            .replace('Esc', 'Escape')
            .replace('Leertaste', 'Space')
            .replace('↑', 'Up')
            .replace('↓', 'Down')
            .replace('←', 'Left')
            .replace('→', 'Right')
            .replace(/\s+\+\s+/g, '+');
    }

    private cleanup() {
        globalShortcut.unregisterAll();
    }
}

new ClipboardManagerApp(); 