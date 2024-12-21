import { contextBridge, ipcRenderer } from 'electron';
import { IElectronAPI } from './types/electron';

const electronAPI: IElectronAPI = {
    typeText: (data) => ipcRenderer.send('typeText', data),
    saveSettings: (settings) => ipcRenderer.send('saveSettings', settings)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 