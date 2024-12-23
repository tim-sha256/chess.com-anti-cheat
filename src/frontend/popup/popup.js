import { RiskDisplay } from './RiskDisplay.js';

class PopupManager {
    constructor() {
        this.display = new RiskDisplay();
        this.port = null;
        this.setupConnection();
        this.display.showLoading();
    }

    setupConnection() {
        try {
            this.port = chrome.runtime.connect({ name: 'popup' });
            console.debug('Connected to background script');
            
            this.port.onMessage.addListener((message) => {
                console.debug('Received message:', message);
                this.handleMessage(message);
            });

            this.port.onDisconnect.addListener(() => {
                console.debug('Disconnected from background script');
                this.port = null;
                this.display.showError('Connection lost');
            });

            // After successfully connecting, request current state
            this.port.postMessage({ action: 'getCurrentState' });

        } catch (error) {
            console.error('Failed to connect:', error);
            this.display.showError('Failed to connect');
        }
    }

    async handleMessage(message) {
        try {
            switch (message.action) {
                case 'updateRiskScore':
                    if (!message.data) {
                        console.error('No data in updateRiskScore message');
                        return;
                    }

                    // Comment out the strict opponent check:
                    /*
                    const data = message.data;
                    const opponentOk =
                        data.opponentUsername &&
                        (!data.currentPlayer || data.opponentUsername !== data.currentPlayer);

                    if (!opponentOk) {
                        console.debug('[PopupManager] Opponent not stable yet. Showing loading.');
                        this.display.showLoading();
                        return;
                    }
                    */

                    // Directly update display without the extra opponent check
                    this.display.updateDisplay(message.data);
                    break;
                    
                case 'calculatingRiskScore':
                    this.display.showLoading();
                    break;
                    
                case 'clearDisplay':
                    this.display.showLoading();
                    break;
                    
                default:
                    console.warn('Unknown message action:', message.action);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            this.display.showError('Error processing data');
        }
    }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.popupManager = new PopupManager();
    document.getElementById('settings-link').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
});
