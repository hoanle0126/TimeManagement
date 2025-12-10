import React from 'react';
import { View, StyleSheet, Modal, Dimensions, Platform } from 'react-native';
import { Menu, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UserMenuPopup({ visible, onClose, onMenuItemPress, userPosition }) {
  const theme = useTheme();
  
  const menuItems = [
    {
      id: 'profile',
      label: 'Chi tiết người dùng',
      icon: 'person-outline',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
    },
    {
      id: 'logout',
      label: 'Đăng xuất',
      icon: 'log-out-outline',
      textColor: theme.colors.error,
    },
  ];

  const handleMenuItemPress = (itemId) => {
    onMenuItemPress(itemId);
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    menuContainer: {
      position: 'absolute',
      top: userPosition ? userPosition.y + userPosition.height + 8 : 60,
      right: userPosition ? Math.max(16, width - userPosition.x - userPosition.width) : 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
      minWidth: 200,
      ...(Platform.OS === 'web' 
        ? { boxShadow: `0 4px 12px ${theme.colors.shadow}40` }
        : {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }
      ),
      paddingVertical: 8,
      zIndex: 1000,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    menuItemLast: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      marginTop: 4,
    },
    menuItemText: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} onStartShouldSetResponder={() => true}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Menu.Item
              key={item.id}
              leadingIcon={item.icon}
              title={item.label}
              titleStyle={{ 
                color: item.textColor || theme.colors.onSurface,
                fontSize: 14,
              }}
              onPress={() => handleMenuItemPress(item.id)}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}
