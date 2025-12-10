import { Dimensions } from 'react-native';

export const getScreenDimensions = () => {
  return Dimensions.get('window');
};

export const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

export const isDesktop = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024;
};

export const getResponsiveValue = (mobile, tablet, desktop) => {
  const { width } = Dimensions.get('window');
  if (width >= 1024) return desktop;
  if (width >= 768) return tablet;
  return mobile;
};

