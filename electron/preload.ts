import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (content: string, filename: string) =>
        ipcRenderer.invoke('save-file', content, filename),

    openFile: () =>
        ipcRenderer.invoke('open-file'),

    getAppVersion: () =>
        ipcRenderer.invoke('get-app-version'),
});
