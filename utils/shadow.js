import { Platform } from 'react-native';

/**
 * Creates shadow styles that work on both web and native
 * @param {Object} options - Shadow options
 * @param {string} options.color - Shadow color
 * @param {number} options.offsetX - Horizontal offset
 * @param {number} options.offsetY - Vertical offset
 * @param {number} options.opacity - Shadow opacity (0-1)
 * @param {number} options.radius - Shadow blur radius
 * @param {number} options.elevation - Android elevation
 * @returns {Object} Shadow styles
 */
export const createShadow = ({
  color = '#000',
  offsetX = 0,
  offsetY = 2,
  opacity = 0.1,
  radius = 8,
  elevation = 3,
}) => {
  if (Platform.OS === 'web') {
    // Trên web, chỉ dùng boxShadow, không dùng shadow* props
    const colorHex = typeof color === 'string' && color.startsWith('#') 
      ? color.slice(1) 
      : '000000';
    const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px #${colorHex}${opacityHex}`,
    };
  }
  
  // Trên native (iOS/Android), dùng shadow* props
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};
