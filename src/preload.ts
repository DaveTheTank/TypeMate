import { contextBridge, ipcRenderer } from 'electron';
import { IElectronAPI } from './types/types';

const electronAPI: IElectronAPI = {
    typeText: (data) => new Promise((resolve, reject) => {
        ipcRenderer.send('typeText', data);
        ipcRenderer.once('typeText-complete', () => resolve());
        ipcRenderer.once('typeText-error', (_, error) => reject(error));
    }),
    saveSettings: (settings) => ipcRenderer.send('saveSettings', settings),
    saveTheme: (theme) => ipcRenderer.send('saveTheme', theme)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 