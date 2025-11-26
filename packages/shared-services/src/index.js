// Export endpoints for use in all apps
export { ENDPOINTS } from './config/endpoints';

// Export services
export * from './services/index';

// Export platform abstraction utilities
export { storage, initStorage } from './utils/storage';
export { geolocation, initGeolocation } from './utils/geolocation';

// Export data transformers
export {
    transformOrderFromAPI,
    transformOrderToAPI,
    extractFoodIds,
    calculateOrderTotals
} from './utils/orderTransformer';
