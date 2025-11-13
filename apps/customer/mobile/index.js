// index.js (Expo)
// Run with: expo start --android hoặc expo start --ios
// Không support web platform

import { registerRootComponent } from 'expo';
import App from './App.jsx';

console.log('[index.js] Mobile app starting...');

// Setup localStorage polyfill lazily to avoid blocking app startup
setupLocalStoragePolyfill();

function setupLocalStoragePolyfill() {
    if (typeof global.localStorage === 'undefined') {
        try {
            // Lazy import to avoid blocking bundle
            import('./src/utils/storage.js').then(module => {
                global.localStorage = module.default;
                console.log('[index.js] localStorage polyfill installed successfully');
            }).catch(error => {
                console.warn('[index.js] Could not install localStorage polyfill:', error.message);
                // Fallback to basic object
                global.localStorage = {};
            });
        } catch (error) {
            console.warn('[index.js] Could not install localStorage polyfill:', error.message);
            global.localStorage = {};
        }
    }
}

console.log('[index.js] Registering root component...');
registerRootComponent(App);
console.log('[index.js] App registered');

