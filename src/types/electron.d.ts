export interface IElectronAPI {
    typeText: (data: { text: string; speed: number; delay: number }) => void;
    saveSettings: (settings: { globalHotkey: string; startDelay: number }) => void;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
} 