// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path'); // Import the path module
const { spawn } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // No default frame
        icon: path.join(__dirname, 'assets', 'icon.ico'), // Set the application icon
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile('index.html');

    // Minimize window
    ipcMain.on('minimize-window', () => {
        win.minimize();
    });

    // Maximize/Restore window
    ipcMain.on('maximize-window', () => {
        if (win.isMaximized()) {
            win.restore();
        } else {
            win.maximize();
        }
    });

    // Close window
    ipcMain.on('close-window', () => {
        win.close();
    });
}

app.whenReady().then(createWindow);

// Handle optimization IPC messages
ipcMain.on('optimize-pc', (event) => {
    clearTempFiles(event);
});

function clearTempFiles(event) {
    const clearCache = spawn('cmd.exe', ['/c', 'del', '/q/f/s', '%temp%\\*']);

    clearCache.stdout.on('data', (data) => {
        event.sender.send('debug-message', `Clearing temporary files: ${data}`);
    });

    clearCache.stderr.on('data', (data) => {
        event.sender.send('debug-message', `Error clearing cache: ${data}`);
        event.reply('optimization-result', 'Error clearing cache.');
    });

    clearCache.on('close', (code) => {
        if (code !== 0) {
            event.reply('optimization-result', 'Error clearing cache.');
            return;
        }
        event.sender.send('debug-message', 'Temporary files cleared successfully.');
        closeUnnecessaryProcesses(event);
    });
}

function closeUnnecessaryProcesses(event) {
    const closeProcesses = spawn('cmd.exe', ['/c', 'taskkill', '/F', '/IM', 'notepad.exe']);

    closeProcesses.stdout.on('data', (data) => {
        event.sender.send('debug-message', `Closing processes: ${data}`);
    });

    closeProcesses.stderr.on('data', (data) => {
        if (data.includes('not found')) {
            event.sender.send('debug-message', 'Process not found, continuing...');
        } else {
            event.sender.send('debug-message', `Error closing processes: ${data}`);
            event.reply('optimization-result', 'Error closing processes.');
            return;
        }
    });

    closeProcesses.on('close', (code) => {
        if (code !== 0) {
            event.reply('optimization-result', 'Cache cleared, but there was an error closing processes.');
            return;
        }
        event.sender.send('debug-message', 'Unnecessary processes closed successfully.');
        disableStartupPrograms(event);
    });
}

function disableStartupPrograms(event) {
    const disableStartup = spawn('cmd.exe', ['/c', 'reg', 'delete', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', '/v', 'YourAppName', '/f']);

    disableStartup.stdout.on('data', (data) => {
        event.sender.send('debug-message', `Disabling startup programs: ${data}`);
    });

    disableStartup.stderr.on('data', (data) => {
        if (data.includes('ERROR: The system was unable to find the specified registry key or value.')) {
            event.sender.send('debug-message', 'Registry key not found, continuing...');
        } else {
            event.sender.send('debug-message', `Error disabling startup programs: ${data}`);
            event.reply('optimization-result', 'Error disabling startup programs.');
            return;
        }
    });

    disableStartup.on('close', (code) => {
        if (code !== 0) {
            event.reply('optimization-result', 'Cache cleared, processes closed, but error disabling startup programs.');
            return;
        }
        event.sender.send('debug-message', 'Startup programs disabled successfully.');
        defragmentDisk(event);
    });
}

function defragmentDisk(event) {
    const defragDisk = spawn('cmd.exe', ['/c', 'defrag', 'C:']);

    defragDisk.stdout.on('data', (data) => {
        event.sender.send('debug-message', `Defragmenting disk: ${data}`);
    });

    defragDisk.stderr.on('data', (data) => {
        event.sender.send('debug-message', `Error during disk defragmentation: ${data}`);
    });

    defragDisk.on('close', (code) => {
        if (code !== 0) {
            event.reply('optimization-result', 'Optimization completed, but error during disk defragmentation.');
            return;
        }
        event.reply('optimization-result', 'PC optimized successfully!');
        event.sender.send('debug-message', 'Disk defragmentation completed successfully.');
    });
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});