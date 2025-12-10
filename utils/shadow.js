import { Platform } from 'react-native';

/**
 * Helper function để tạo shadow styles tương thích với web và native
 */
export const createShadow = (elevation = 3) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    };
  }
  
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation,
  };
};

