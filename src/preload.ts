import { contextBridge, ipcRenderer } from 'electron';
import { IElectronAPI } from './types/types';

const electronAPI: IElectronAPI = {
    typeText: (data: { text: string; speed: number; delay: number }) => 
        ipcRenderer.send('typeText', data),
    saveSettings: (settings: { globalHotkey: string; startDelay: number }) => 
        ipcRenderer.send('saveSettings', settings),
    saveTheme: (theme: 'light' | 'dark') => 
        ipcRenderer.send('saveTheme', theme)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 