export interface IElectronAPI {
    saveClipboard: (data: any) => void;
    saveSettings: (settings: { globalHotkey: string; startDelay: number }) => void;
    typeText: (data: { text: string; speed: number; delay: number }) => void;
    saveTheme: (theme: string) => void;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
} 