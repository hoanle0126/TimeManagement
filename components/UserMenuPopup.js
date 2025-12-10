import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Text,
  useTheme,
  Dialog,
  Portal,
  Button,
  Paragraph,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { createShadow } from "../utils/shadow";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";

const { width } = Dimensions.get("window");

export default function UserMenuPopup({
  visible,
  onClose,
  onMenuItemPress,
  userPosition,
}) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isDark = theme.dark;
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const timeoutRef = useRef(null);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    // Đóng menu trước khi hiện Dialog
    onClose();

    // Delay một chút để modal đóng hoàn toàn trước khi hiện Dialog
    timeoutRef.current = setTimeout(() => {
      setLogoutDialogVisible(true);
    }, 100);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogVisible(false);
    console.log("UserMenuPopup: Logout button pressed");
    try {
      await dispatch(logout());
      console.log("UserMenuPopup: Logout completed");
    } catch (error) {
      console.error("UserMenuPopup: Logout error:", error);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogVisible(false);
  };

  const menuItems = [
    {
      id: "profile",
      label: "Chi tiết người dùng",
      icon: "person-outline",
      onClick: () => {
        if (onMenuItemPress) {
          onMenuItemPress("profile");
        }
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings-outline",
      onClick: () => {
        if (onMenuItemPress) {
          onMenuItemPress("settings");
        }
      },
    },
    {
      id: "logout",
      label: "Đăng xuất",
      icon: "log-out-outline",
      textColor: theme.colors.error,
      onClick: handleLogout,
    },
  ];

  const handleMenuItemPress = (item) => {
    console.log("UserMenuPopup: Menu item pressed:", item.id);

    // Nếu là logout, không gọi onClose ở đây vì handleLogout sẽ tự xử lý
    if (item.id === "logout") {
      if (item.onClick) {
        item.onClick();
      }
      return;
    }

    // Với các item khác, gọi onClick hoặc onMenuItemPress rồi đóng menu
    if (item.onClick) {
      item.onClick();
    } else if (onMenuItemPress) {
      onMenuItemPress(item.id);
    }
    onClose();
  };

  // Create overlay color with opacity based on theme
  const overlayColor = isDark ? `rgba(0, 0, 0, 0.5)` : `rgba(0, 0, 0, 0.3)`;


  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: overlayColor,
    },
    menuContainer: {
      position: "absolute",
      top: userPosition ? userPosition.y + userPosition.height + 8 : 60,
      right: userPosition
        ? Math.max(16, width - userPosition.x - userPosition.width)
        : 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
      minWidth: 200,
      paddingVertical: 8,
      zIndex: 1000,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
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
      fontWeight: "500",
      flex: 1,
    },
  });

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={onClose}
        >
          <View
            style={[
              styles.menuContainer,
              createShadow({
                color: theme.colors.shadow,
                offsetY: 4,
                opacity: 0.2,
                radius: 12,
                elevation: 8,
              }),
            ]}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleMenuItemPress(item)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.textColor || theme.colors.onSurface}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: item.textColor || theme.colors.onSurface },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={handleLogoutCancel}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
            maxWidth: 600,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Đăng xuất
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
              Bạn có chắc chắn muốn đăng xuất?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={handleLogoutCancel}
              textColor={theme.colors.onSurfaceVariant}
            >
              Hủy
            </Button>
            <Button
              onPress={handleLogoutConfirm}
              textColor={theme.colors.error}
              mode="text"
            >
              Đăng xuất
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
