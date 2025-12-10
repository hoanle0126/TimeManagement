import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import UserMenuPopup from './UserMenuPopup';

export default function Header({ onMenuPress }) {
  const navigation = useNavigation();
  const { authState } = useAuth();
  const isAuthenticated = !!authState?.token;
  const userName = authState?.user?.name || 'Guest';
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
    if (onMenuPress) {
      onMenuPress(itemId);
    }
  };

  return (
    <>
      <View style={[styles.container, isTablet && styles.containerTablet]}>
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoText, isTablet && styles.logoTextTablet]}>
              TaskMaster.
            </Text>
          </View>
        </View>

        {isTablet && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Start searching here..."
              placeholderTextColor="#999"
            />
          </View>
        )}

        <View style={styles.rightSection}>
          {isTablet && (
            <>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="filter" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="sunny" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>6</Text>
                </View>
                <Ionicons name="notifications" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="settings" size={20} color="#666" />
              </TouchableOpacity>
            </>
          )}

          {isAuthenticated ? (
            <TouchableOpacity
              ref={userProfileRef}
              style={styles.userProfile}
              onPress={handleUserProfilePress}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                {authState?.user?.avatar ? (
                  <Text style={styles.avatarText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <Ionicons name="person" size={20} color="#666" />
                )}
              </View>
              {(isTablet || width >= 400) && (
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {userName}
                  </Text>
                  {isTablet && (
                    <Text style={styles.userTitle} numberOfLines={1}>
                      {authState?.user?.email || ''}
                    </Text>
                  )}
                </View>
              )}
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                // Navigate to login screen
                navigation.navigate('Auth', { screen: 'Login' });
              }}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  logoTextTablet: {
    fontSize: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    borderRadius: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginRight: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userTitle: {
    fontSize: 12,
    color: '#666',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

