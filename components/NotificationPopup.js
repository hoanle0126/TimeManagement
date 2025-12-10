import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  useTheme,
  Divider,
  IconButton,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { getFriends, getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../store/slices/friendsSlice';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, addNotification } from '../store/slices/notificationsSlice';
import socketService from '../services/socket';

const { width } = Dimensions.get('window');

// Flag để bật/tắt mock data
const USE_MOCK_DATA = false;

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'task',
    title: 'Task mới được giao',
    message: 'Bạn đã được giao task "Hoàn thành báo cáo dự án"',
    time: '5 phút trước',
    read: false,
    icon: 'Clipboard',
    color: '#4CAF50',
  },
  {
    id: 2,
    type: 'friend_request',
    title: 'Lời mời kết bạn',
    message: 'Nguyễn Văn A đã gửi lời mời kết bạn',
    time: '10 phút trước',
    read: false,
    icon: 'UserPlus',
    color: '#2196F3',
    friendship_id: 1,
    from_user: { id: 2, name: 'Nguyễn Văn A', email: 'a@example.com' },
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Nhắc nhở deadline',
    message: 'Task "Gọi điện cho khách hàng" sắp đến hạn trong 2 giờ',
    time: '2 giờ trước',
    read: true,
    icon: 'Alarm',
    color: '#FF9800',
  },
];

export default function NotificationPopup({
  visible,
  onClose,
  notificationPosition,
}) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isDark = theme.dark;
  const { friendRequests } = useAppSelector((state) => state.friends);
  const { notifications: dbNotifications, unreadCount: dbUnreadCount, isLoading } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);

  // Load notifications từ database khi component mount
  useEffect(() => {
    if (!USE_MOCK_DATA && user) {
      dispatch(getNotifications());
      dispatch(getFriendRequests());
    }
  }, [user, dispatch]);

  // Chuyển đổi notifications từ database sang format hiển thị
  const formatNotification = (notification) => {
    const getIcon = (type) => {
      switch (type) {
        case 'friend_request': return 'UserPlus';
        case 'friend_request_accepted': return 'CheckCircle';
        case 'task': return 'Clipboard';
        default: return 'Bell';
      }
    };

    const getColor = (type) => {
      switch (type) {
        case 'friend_request': return '#2196F3';
        case 'friend_request_accepted': return '#4CAF50';
        case 'task': return '#4CAF50';
        default: return '#2196F3';
      }
    };

    const timeAgo = (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Vừa xong';
      if (minutes < 60) return `${minutes} phút trước`;
      if (hours < 24) return `${hours} giờ trước`;
      if (days < 7) return `${days} ngày trước`;
      return new Date(date).toLocaleDateString('vi-VN');
    };

    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      time: timeAgo(notification.created_at),
      read: notification.read,
      icon: getIcon(notification.type),
      color: getColor(notification.type),
      friendship_id: notification.data?.friendship_id,
      from_user: notification.data?.from_user || notification.data?.accepted_user,
      created_at: notification.created_at,
    };
  };

  // Sử dụng notifications từ database hoặc mock data
  const displayNotifications = USE_MOCK_DATA 
    ? MOCK_NOTIFICATIONS 
    : dbNotifications.map(formatNotification);

  // Lắng nghe socket notifications và thêm vào Redux
  useEffect(() => {
    if (!user) return;

    const handleNotification = (data) => {
      // Thêm notification vào Redux (sẽ được lưu vào database từ backend)
      const notification = {
        id: data.data?.friendship_id 
          ? `${data.type}_${data.data.friendship_id}` 
          : Date.now(),
        type: data.type,
        title: data.title || 'Thông báo',
        message: data.message || '',
        read: false,
        data: data.data || {},
        created_at: new Date().toISOString(),
      };

      dispatch(addNotification(notification));
      
      // Refresh notifications từ database để đảm bảo sync
      dispatch(getNotifications());

      // Xử lý các action cụ thể
      if (data.type === 'friend_request') {
        dispatch(getFriendRequests());
      } else if (data.type === 'friend_request_accepted') {
        const acceptedUserName = data.data?.accepted_user?.name || 'Đối phương';
        dispatch(getFriends());
        dispatch(getFriendRequests());
        
        // Hiển thị Alert để người dùng chú ý
        Alert.alert(
          '🎉 Lời mời đã được chấp nhận',
          `${acceptedUserName} đã chấp nhận lời mời kết bạn của bạn!`,
          [{ text: 'OK' }]
        );
      }
    };

    socketService.onNotification(handleNotification);

    return () => {
      socketService.offNotification(handleNotification);
    };
  }, [user, dispatch]);

  // Đếm số thông báo chưa đọc
  const unreadCount = USE_MOCK_DATA 
    ? displayNotifications.filter(n => !n.read).length 
    : dbUnreadCount;

  // Đánh dấu đã đọc
  const handleMarkAsRead = (notificationId) => {
    if (!USE_MOCK_DATA) {
      dispatch(markAsRead(notificationId));
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = () => {
    if (!USE_MOCK_DATA) {
      dispatch(markAllAsRead());
    }
  };

  // Xóa thông báo
  const handleDeleteNotification = (notificationId) => {
    if (!USE_MOCK_DATA) {
      dispatch(deleteNotification(notificationId));
    }
  };

  // Xử lý click vào notification
  const handleNotificationPress = (notification) => {
    handleMarkAsRead(notification.id);
    
    // Nếu là friend request, có thể navigate đến FriendsScreen
    if (notification.type === 'friend_request') {
      // TODO: Navigate đến FriendsScreen với tab friend requests mở
      onClose();
    } else {
      // TODO: Navigate đến màn hình tương ứng
      onClose();
    }
  };

  // Xử lý accept friend request từ notification
  const handleAcceptFriendRequest = async (friendshipId) => {
    try {
      await dispatch(acceptFriendRequest(friendshipId)).unwrap();
      // Xóa notification
      setNotifications((prev) =>
        prev.filter((n) => n.friendship_id !== friendshipId)
      );
      // Refresh friends list ngay lập tức
      dispatch(getFriends());
      dispatch(getFriendRequests());
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  // Xử lý reject friend request từ notification
  const handleRejectFriendRequest = async (friendshipId) => {
    try {
      await dispatch(rejectFriendRequest(friendshipId)).unwrap();
      // Xóa notification
      setNotifications((prev) =>
        prev.filter((n) => n.friendship_id !== friendshipId)
      );
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const overlayColor = isDark ? `rgba(0, 0, 0, 0.5)` : `rgba(0, 0, 0, 0.3)`;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: overlayColor,
    },
    popupContainer: {
      position: 'absolute',
      top: notificationPosition
        ? notificationPosition.y + notificationPosition.height + 8
        : 60,
      right: notificationPosition
        ? Math.max(16, width - notificationPosition.x - notificationPosition.width)
        : 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 1.5,
      width: Math.min(400, width - 32),
      maxHeight: 600,
      zIndex: 1000,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    notificationsList: {
      maxHeight: 500,
    },
    notificationItem: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      backgroundColor: 'transparent',
    },
    notificationItemUnread: {
      backgroundColor: theme.colors.primaryContainer + '20',
    },
    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    notificationContent: {
      flex: 1,
      minWidth: 0,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    notificationTitleUnread: {
      fontWeight: '700',
    },
    notificationMessage: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 16,
      marginBottom: 4,
    },
    notificationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    notificationTime: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    notificationType: {
      height: 20,
    },
    notificationActions: {
      flexDirection: 'row',
      gap: 4,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      alignItems: 'center',
    },
    viewAllButton: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });

  const getTypeLabel = (type) => {
    const labels = {
      task: 'Task',
      update: 'Cập nhật',
      reminder: 'Nhắc nhở',
      comment: 'Bình luận',
      system: 'Hệ thống',
      friend_request: 'Kết bạn',
      friend_request_accepted: 'Kết bạn',
    };
    return labels[type] || type;
  };

  return (
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
            styles.popupContainer,
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Thông báo</Text>
              {unreadCount > 0 && (
                <Chip
                  mode="flat"
                  compact
                  style={{
                    backgroundColor: theme.colors.errorContainer,
                    height: 24,
                  }}
                  textStyle={{
                    color: theme.colors.onErrorContainer,
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  {unreadCount} mới
                </Chip>
              )}
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <IconButton
                  icon="check-all"
                  iconColor={theme.colors.primary}
                  size={20}
                  onPress={handleMarkAllAsRead}
                />
              )}
              <IconButton
                icon="close"
                iconColor={theme.colors.onSurfaceVariant}
                size={20}
                onPress={onClose}
              />
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Đang tải...</Text>
              </View>
            ) : displayNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <SolarIcon
                  name="Bell"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                  type="outline"
                />
                <Text style={styles.emptyStateText}>
                  Không có thông báo nào
                </Text>
              </View>
            ) : (
              displayNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <TouchableOpacity
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.notificationItemUnread,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                  >
                    {/* Icon */}
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: notification.color + '20' },
                      ]}
                    >
                      <SolarIcon
                        name={notification.icon}
                        size={20}
                        color={notification.color}
                        type="outline"
                      />
                    </View>

                    {/* Content */}
                    <View style={styles.notificationContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                        <Text
                          style={[
                            styles.notificationTitle,
                            !notification.read && styles.notificationTitleUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.colors.primary,
                              marginTop: 4,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={styles.notificationMessage}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>
                      <View style={styles.notificationFooter}>
                        <Chip
                          mode="flat"
                          compact
                          style={[
                            styles.notificationType,
                            { backgroundColor: theme.colors.surfaceVariant },
                          ]}
                          textStyle={{
                            fontSize: 10,
                            color: theme.colors.onSurfaceVariant,
                          }}
                        >
                          {getTypeLabel(notification.type)}
                        </Chip>
                        <Text style={styles.notificationTime}>
                          {notification.time}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.notificationActions}>
                      {notification.type === 'friend_request' && notification.friendship_id ? (
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          <IconButton
                            icon="check"
                            iconColor={theme.colors.primary}
                            size={16}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAcceptFriendRequest(notification.friendship_id);
                            }}
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                          />
                          <IconButton
                            icon="close"
                            iconColor={theme.colors.error}
                            size={16}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleRejectFriendRequest(notification.friendship_id);
                            }}
                            style={{ backgroundColor: theme.colors.errorContainer }}
                          />
                        </View>
                      ) : (
                        <IconButton
                          icon="close"
                          iconColor={theme.colors.onSurfaceVariant}
                          size={16}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                  {index < displayNotifications.length - 1 && (
                    <Divider style={{ marginHorizontal: 16 }} />
                  )}
                </React.Fragment>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <TouchableOpacity
              style={styles.footer}
              onPress={() => {
                // TODO: Navigate to notifications screen
                onClose();
              }}
            >
              <Text style={styles.viewAllButton}>Xem tất cả thông báo</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

