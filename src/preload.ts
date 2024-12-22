import { contextBridge, ipcRenderer } from 'electron';
import { IElectronAPI } from './types/electron';

const electronAPI: IElectronAPI = {
    saveClipboard: (data: any) => {
        ipcRenderer.send('saveClipboard', data);
    },
    typeText: (data: { text: string; speed: number; delay: number }) => {
        ipcRenderer.send('typeText', data);
    },
    saveSettings: (settings: { globalHotkey: string; startDelay: number }) => {
        ipcRenderer.send('saveSettings', settings);
    },
    saveTheme: (theme: string) => {
        ipcRenderer.send('saveTheme', theme);
    }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 