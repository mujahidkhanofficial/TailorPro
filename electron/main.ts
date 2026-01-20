import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        title: 'Tailor Pro',
        icon: path.join(__dirname, '../assets/icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        show: false,
    });

    // Load the app
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers for file operations
ipcMain.handle('save-file', async (_event, content: string, filename: string) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: filename,
        filters: [
            { name: 'Backup Files', extensions: ['json'] },
            { name: 'CSV Files', extensions: ['csv'] },
        ],
    });

    if (filePath) {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        return { success: true, path: filePath };
    }
    return { success: false };
});

ipcMain.handle('open-file', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'Backup', extensions: ['json'] }],
        properties: ['openFile'],
    });

    if (filePaths && filePaths[0]) {
        const content = await fs.promises.readFile(filePaths[0], 'utf-8');
        return { success: true, content, path: filePaths[0] };
    }
    return { success: false };
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
