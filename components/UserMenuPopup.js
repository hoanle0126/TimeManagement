import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UserMenuPopup({ visible, onClose, onMenuItemPress, userPosition }) {
  const menuItems = [
    {
      id: 'profile',
      label: 'Chi tiết người dùng',
      icon: 'person-outline',
      color: '#1A1A1A',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
      color: '#1A1A1A',
    },
    {
      id: 'logout',
      label: 'Đăng xuất',
      icon: 'log-out-outline',
      color: '#FF3B30',
    },
  ];

  const handleMenuItemPress = (itemId) => {
    onMenuItemPress(itemId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.menuContainer,
            userPosition && {
              top: userPosition.y + userPosition.height + 8,
              right: Math.max(16, width - userPosition.x - userPosition.width),
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuItemPress(item.id)}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
              <Text style={[styles.menuItemText, { color: item.color }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }
      : {
          shadowColor: '#000',
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
    borderTopColor: '#E0E0E0',
    marginTop: 4,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

