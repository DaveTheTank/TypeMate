export interface IElectronAPI {
    typeText: (data: {
        text: string;
        speed: number;
        delay: number;
    }) => void;
    saveSettings: (settings: {
        globalHotkey: string;
        startDelay: number;
    }) => void;
    saveTheme: (theme: 'light' | 'dark') => void;
} 