import { contextBridge, ipcRenderer } from 'electron';
import { IElectronAPI } from './types/types';

const electronAPI: IElectronAPI = {
    typeText: (data) => ipcRenderer.send('typeText', data),
    saveSettings: (settings) => ipcRenderer.send('saveSettings', settings),
    saveTheme: (theme) => ipcRenderer.send('saveTheme', theme)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 