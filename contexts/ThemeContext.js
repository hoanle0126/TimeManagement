import React, { createContext, useContext, useState, useMemo } from 'react';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const lightColors = {
  primary: '#4CAF50',
  secondary: '#FF9800',
  tertiary: '#2196F3',
  error: '#FF3B30',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F0F0',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onTertiary: '#FFFFFF',
  onError: '#FFFFFF',
  onBackground: '#1A1A1A',
  onSurface: '#1A1A1A',
  onSurfaceVariant: '#666666',
  outline: '#E0E0E0',
  outlineVariant: '#CCCCCC',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1A1A1A',
  inverseOnSurface: '#FFFFFF',
  inversePrimary: '#81C784',
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#FFFFFF',
    level3: '#FFFFFF',
    level4: '#FFFFFF',
    level5: '#FFFFFF',
  },
};

const darkColors = {
  primary: '#66BB6A',
  secondary: '#FFB74D',
  tertiary: '#64B5F6',
  error: '#EF5350',
  warning: '#FFB74D',
  success: '#66BB6A',
  info: '#64B5F6',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  onPrimary: '#000000',
  onSecondary: '#000000',
  onTertiary: '#000000',
  onError: '#000000',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#CCCCCC',
  outline: '#424242',
  outlineVariant: '#616161',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E0E0E0',
  inverseOnSurface: '#1A1A1A',
  inversePrimary: '#4CAF50',
  elevation: {
    level0: 'transparent',
    level1: '#1E1E1E',
    level2: '#242424',
    level3: '#272727',
    level4: '#2C2C2C',
    level5: '#2D2D2D',
  },
};

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };

