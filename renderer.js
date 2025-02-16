// renderer.js
const { ipcRenderer } = require('electron');
const optimizeButton = document.getElementById('optimize-button');
const loadingSpinner = document.getElementById('loading-spinner');

// Minimize button functionality
document.getElementById('minimize-btn').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

// Maximize button functionality
document.getElementById('maximize-btn').addEventListener('click', () => {
    ipcRenderer.send('maximize-window');
});

// Close button functionality
document.getElementById('close-btn').addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

optimizeButton.addEventListener('click', () => {
    loadingSpinner.style.display = 'block'; // Show loading spinner
    ipcRenderer.send('optimize-pc'); // Send message to main process
});

// Handle optimization result messages
ipcRenderer.on('optimization-result', (event, message) => {
    loadingSpinner.style.display = 'none'; // Hide loading spinner
    document.getElementById('result-message').innerText = message; // Display result message
});

// Handle debug messages
ipcRenderer.on('debug-message', (event, message) => {
    const debugConsole = document.getElementById('debug-console');
    debugConsole.innerHTML += `<div>${message}</div>`;
    debugConsole.scrollTop = debugConsole.scrollHeight; // Scroll to the bottom
});