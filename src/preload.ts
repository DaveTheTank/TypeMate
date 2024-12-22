import { contextBridge, ipcRenderer } from 'electron';
import { IElectronAPI } from './types/electron';

const electronAPI: IElectronAPI = {
    typeText: (data: { text: string; speed: number; delay: number }) => {
        ipcRenderer.send('typeText', data);
    },
    saveSettings: (settings: { globalHotkey: string; startDelay: number }) => {
        ipcRenderer.send('saveSettings', settings);
    }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 