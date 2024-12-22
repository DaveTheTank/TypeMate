export interface Settings {
    globalHotkey: string;
    startDelay: number;
}

export interface IElectronAPI {
    typeText: (data: {
        text: string;
        speed: number;
        delay: number;
    }) => Promise<void>;
    saveSettings: (settings: Settings) => void;
    saveTheme: (theme: 'light' | 'dark') => void;
    closeWindow: () => void;
    minimizeWindow: () => void;
    adjustWindowSize: (height: number) => void;
} 