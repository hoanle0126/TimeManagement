import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  Text, 
  TextInput, 
  IconButton, 
  Avatar, 
  Button,
  Badge,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import UserMenuPopup from './UserMenuPopup';

export default function Header({ onMenuPress }) {
  const navigation = useNavigation();
  const theme = useTheme();
  const { token, user } = useAppSelector((state) => state.auth);
  const { isDark, toggleTheme } = useCustomTheme();
  const isAuthenticated = !!token;
  const userName = user?.name || 'Guest';
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const [menuVisible, setMenuVisible] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const userProfileRef = useRef(null);

  const handleUserProfilePress = () => {
    if (userProfileRef.current) {
      userProfileRef.current.measure((x, y, width, height, pageX, pageY) => {
        setUserPosition({
          x: pageX,
          y: pageY,
          width,
          height,
        });
        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

  const handleMenuItemPress = (itemId) => {
    console.log('Header: Menu item pressed:', itemId);
    if (onMenuPress) {
      console.log('Header: Calling onMenuPress with:', itemId);
      onMenuPress(itemId);
    } else {
      console.warn('Header: onMenuPress is not defined');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    containerTablet: {
      paddingHorizontal: 24,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logoIcon: {
      width: 32,
      height: 32,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    logoTextTablet: {
      fontSize: 20,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      paddingHorizontal: 16,
      marginHorizontal: 20,
      height: 40,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.onSurface,
      backgroundColor: 'transparent',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconButtonContainer: {
      position: 'relative',
    },
    userProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingLeft: 12,
      paddingRight: 4,
      paddingVertical: 4,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.outline,
      borderRadius: theme.roundness,
    },
    userInfo: {
      marginRight: 4,
    },
  });

  return (
    <>
      <View style={[styles.container, isTablet && styles.containerTablet]}>
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="checkmark" size={20} color={theme.colors.onPrimary} />
            </View>
            <Text style={[styles.logoText, isTablet && styles.logoTextTablet]}>
              FLOW
            </Text>
          </View>
        </View>

        {isTablet && (
          <View style={styles.searchContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.colors.onSurfaceVariant} 
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Start searching here..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>
        )}

        <View style={styles.rightSection}>
          {/* Theme toggle button - always visible */}
          <IconButton
            icon={isDark ? "weather-sunny" : "weather-night"}
            iconColor={theme.colors.onSurfaceVariant}
            size={20}
            onPress={toggleTheme}
          />
          
          {isTablet && (
            <>
              <IconButton
                icon="filter"
                iconColor={theme.colors.onSurfaceVariant}
                size={20}
                onPress={() => {}}
              />
              <View style={styles.iconButtonContainer}>
                <IconButton
                  icon="bell"
                  iconColor={theme.colors.onSurfaceVariant}
                  size={20}
                  onPress={() => {}}
                />
                <Badge 
                  style={{ 
                    position: 'absolute', 
                    top: 4, 
                    right: 4,
                    backgroundColor: theme.colors.error,
                  }}
                >
                  6
                </Badge>
              </View>
              <IconButton
                icon="cog"
                iconColor={theme.colors.onSurfaceVariant}
                size={20}
                onPress={() => {}}
              />
            </>
          )}

          {isAuthenticated ? (
            <View
              ref={userProfileRef}
              style={styles.userProfile}
            >
              <Avatar.Text 
                size={36} 
                label={userName.charAt(0).toUpperCase()}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
                labelStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              {(isTablet || width >= 400) && (
                <View style={styles.userInfo}>
                  <Text 
                    variant="bodyMedium" 
                    style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                    numberOfLines={1}
                  >
                    {userName}
                  </Text>
                  {isTablet && (
                    <Text 
                      variant="bodySmall" 
                      style={{ color: theme.colors.onSurfaceVariant }}
                      numberOfLines={1}
                    >
                      {user?.email || ''}
                    </Text>
                  )}
                </View>
              )}
              <IconButton
                icon="chevron-down"
                iconColor={theme.colors.onSurfaceVariant}
                size={16}
                onPress={handleUserProfilePress}
              />
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={{ borderRadius: theme.roundness }}
            >
              Đăng nhập
            </Button>
          )}
        </View>
      </View>

      <UserMenuPopup
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onMenuItemPress={handleMenuItemPress}
        userPosition={userPosition}
      />
    </>
  );
}
