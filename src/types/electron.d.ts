interface IElectronAPI {
    typeText: (data: { text: string; speed: number; delay: number }) => Promise<void>;
    saveSettings: (settings: { globalHotkey: string; startDelay: number }) => void;
    saveTheme: (theme: 'light' | 'dark') => void;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}

export {}; 