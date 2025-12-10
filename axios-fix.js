/**
 * Fix for axios FormData issue in React Native/Expo
 * This file should be imported before any axios usage
 */

// Mock FormData helper for axios if needed
if (typeof global !== 'undefined') {
  // Ensure FormData is available
  if (typeof FormData === 'undefined' && typeof global.FormData === 'undefined') {
    // Use native FormData if available, otherwise create a simple polyfill
    if (typeof window !== 'undefined' && window.FormData) {
      global.FormData = window.FormData;
    } else {
      // Simple FormData polyfill for React Native
      global.FormData = class FormData {
        constructor() {
          this._data = [];
        }
        
        append(name, value) {
          this._data.push({ name, value });
        }
        
        getAll(name) {
          return this._data.filter(item => item.name === name).map(item => item.value);
        }
        
        get(name) {
          const item = this._data.find(item => item.name === name);
          return item ? item.value : null;
        }
        
        has(name) {
          return this._data.some(item => item.name === name);
        }
        
        delete(name) {
          this._data = this._data.filter(item => item.name !== name);
        }
        
        set(name, value) {
          this.delete(name);
          this.append(name, value);
        }
      };
    }
  }
}

export default {};

