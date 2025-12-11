import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Avatar,
  IconButton,
  Button,
  useTheme,
  Chip,
  Card,
  ActivityIndicator,
  Badge,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SolarIcon } from 'react-native-solar-icons';
import Header from '../components/Header';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../store/slices/friendsSlice';
import socketService from '../services/socket';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const filterTabs = [
  { id: 'all', label: 'Tất cả bạn bè' },
  { id: 'university', label: 'Đại học' },
  { id: 'city', label: 'Tỉnh/Thành phố hiện tại' },
  { id: 'hometown', label: 'Quê quán' },
  { id: 'following', label: 'Đang theo dõi' },
];

// Flag để bật/tắt mock data
const USE_MOCK_DATA = false;

export default function FriendsScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { friends, friendRequests, isLoading } = useAppSelector(
    (state) => state.friends
  );
  const { user } = useAppSelector((state) => state.auth);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  // Mock data fallback
  const mockFriends = [
    { id: 1, name: 'Phạm Nhật Long', mutualFriends: 1, avatar: null },
    { id: 2, name: 'Mai Hương', mutualFriends: 1, avatar: null },
    { id: 3, name: 'Nguyễn Bá Nghĩa', mutualFriends: 1, avatar: null },
    { id: 4, name: 'Le Hung', mutualFriends: 4, avatar: null },
    { id: 5, name: 'Trần Duy Tân', mutualFriends: 5, avatar: null },
    { id: 6, name: 'Thành Long', mutualFriends: 19, avatar: null },
    { id: 7, name: 'Huy Đặng', mutualFriends: 20, avatar: null },
    { id: 8, name: 'Nguyễn Văn Thiện', mutualFriends: 14, avatar: null },
  ];

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      dispatch(getFriends());
      dispatch(getFriendRequests());
    }
  }, [dispatch]);

  // Lắng nghe friend request notifications từ socket
  useEffect(() => {
    if (!user) return;

    const handleNotification = (data) => {
      if (data.type === 'friend_request' && data.data?.from_user) {
        // Thêm friend request vào Redux
        dispatch({
          type: 'friends/addFriendRequest',
          payload: {
            id: data.data.friendship_id,
            user: data.data.from_user,
            created_at: new Date().toISOString(),
          },
        });
        // Refresh friend requests để đảm bảo sync
        dispatch(getFriendRequests());
      } else if (data.type === 'friend_request_accepted' && data.data?.friendship_id) {
        // Khi đối phương chấp nhận lời mời kết bạn
        const acceptedUserName = data.data?.accepted_user?.name || 'Đối phương';
        
        // Refresh friends list để cập nhật
        dispatch(getFriends());
        dispatch(getFriendRequests());
        
        // Hiển thị Dialog để người dùng chú ý
        setDialogTitle('🎉 Lời mời đã được chấp nhận');
        setDialogMessage(`${acceptedUserName} đã chấp nhận lời mời kết bạn của bạn!`);
        setDialogVisible(true);
      }
    };

    socketService.onNotification(handleNotification);

    return () => {
      socketService.offNotification(handleNotification);
    };
  }, [user, dispatch]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (!USE_MOCK_DATA) {
      Promise.all([
        dispatch(getFriends()),
        dispatch(getFriendRequests()),
      ]).finally(() => {
        setRefreshing(false);
      });
    } else {
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [dispatch]);

  const { width } = dimensions;
  const isTablet = width >= 768;
  
  // Tính số cột dựa trên width
  // Lớn nhất (>= 1024px): 3 cột
  // Trung bình (600px - 1023px): 2 cột
  // Nhỏ nhất (< 600px): 1 cột
  const getColumns = () => {
    if (width >= 1024) return 3;
    if (width >= 600) return 2;
    return 1;
  };
  
  const columns = getColumns();
  const contentPadding = isTablet ? 20 : 16;
  const gap = 12;
  // Tính cardWidth: width - (padding trái + padding phải) - (gap giữa các cột)
  const cardWidth = (width - (contentPadding * 2) - (gap * (columns - 1))) / columns;

  const displayFriends = USE_MOCK_DATA ? mockFriends : friends;
  const displayRequests = USE_MOCK_DATA ? [] : friendRequests;

  const filteredFriends = displayFriends.filter((friend) => {
    if (searchQuery) {
      return friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleAcceptRequest = async (requestId) => {
    try {
      await dispatch(acceptFriendRequest(requestId)).unwrap();
      setDialogTitle('Thành công');
      setDialogMessage('Đã chấp nhận lời mời kết bạn');
      setDialogVisible(true);
      // Refresh danh sách ngay lập tức
      dispatch(getFriends());
      dispatch(getFriendRequests());
    } catch (error) {
      setDialogTitle('Lỗi');
      setDialogMessage(error || 'Không thể chấp nhận lời mời');
      setDialogVisible(true);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await dispatch(rejectFriendRequest(requestId)).unwrap();
      setDialogTitle('Thành công');
      setDialogMessage('Đã từ chối lời mời kết bạn');
      setDialogVisible(true);
    } catch (error) {
      setDialogTitle('Lỗi');
      setDialogMessage(error || 'Không thể từ chối lời mời');
      setDialogVisible(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={{
          padding: isTablet ? 20 : 16,
          paddingBottom: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}>
          <Text style={{
            fontSize: isTablet ? 32 : 28,
            fontWeight: 'bold',
            color: theme.colors.onSurface,
            marginBottom: 16,
          }}>Bạn bè</Text>
          
          <View style={{ marginBottom: 16 }}>
            <TextInput
              mode="outlined"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChangeText={setSearchQuery}
              left={<TextInput.Icon icon="magnify" />}
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: theme.roundness,
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={{
            flexDirection: 'row',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <Button
              mode="outlined"
              onPress={() => setShowRequests(!showRequests)}
              style={{
                flex: 1,
                minWidth: 120,
              }}
              textColor={theme.colors.primary}
              icon="account-plus"
            >
              Lời mời kết bạn
              {displayRequests.length > 0 && (
                <Badge
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: theme.colors.error,
                  }}
                >
                  {displayRequests.length}
                </Badge>
              )}
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('SearchUsers')}
              style={{
                flex: 1,
                minWidth: 120,
              }}
              textColor={theme.colors.primary}
              icon="account-search"
            >
              Tìm bạn bè
            </Button>
            <IconButton
              icon="dots-vertical"
              iconColor={theme.colors.onSurfaceVariant}
              size={20}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Friend Requests Section */}
        {showRequests && displayRequests.length > 0 && (
          <View style={{
            padding: isTablet ? 20 : 16,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.onSurface,
              }}>
                Lời mời kết bạn ({displayRequests.length})
              </Text>
              <IconButton
                icon="close"
                iconColor={theme.colors.onSurfaceVariant}
                size={20}
                onPress={() => setShowRequests(false)}
              />
            </View>
            <View style={{ gap: 12 }}>
              {displayRequests.map((request) => (
                <Card
                  key={request.id}
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: theme.roundness,
                  }}
                >
                  <Card.Content style={{
                    padding: isTablet ? 16 : 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <Avatar.Text
                      size={48}
                      label={request.user.name.charAt(0).toUpperCase()}
                      style={{
                        backgroundColor: theme.colors.primaryContainer,
                      }}
                      labelStyle={{
                        color: theme.colors.onPrimaryContainer,
                      }}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.colors.onSurface,
                        marginBottom: 4,
                      }} numberOfLines={1}>
                        {request.user.name}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: theme.colors.onSurfaceVariant,
                      }}>
                        {new Date(request.created_at).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Button
                        mode="contained"
                        onPress={() => handleAcceptRequest(request.id)}
                        disabled={isLoading}
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary}
                        style={{ borderRadius: theme.roundness }}
                        compact
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleRejectRequest(request.id)}
                        disabled={isLoading}
                        textColor={theme.colors.error}
                        borderColor={theme.colors.error}
                        style={{ borderRadius: theme.roundness }}
                        compact
                      >
                        Từ chối
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Filter Section */}
        <View style={{
          paddingHorizontal: isTablet ? 20 : 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {filterTabs.map((tab) => (
              <Chip
                key={tab.id}
                selected={activeFilter === tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={{ marginRight: 8 }}
                selectedColor={theme.colors.primary}
                textStyle={{
                  color:
                    activeFilter === tab.id
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                  fontWeight: activeFilter === tab.id ? '600' : '400',
                }}
              >
                {tab.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Friends List */}
        <View style={{
          padding: isTablet ? 20 : 16,
        }}>
          {isLoading && filteredFriends.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{
                marginTop: 16,
                color: theme.colors.onSurfaceVariant,
                fontSize: 14,
              }}>
                Đang tải danh sách bạn bè...
              </Text>
            </View>
          ) : filteredFriends.length === 0 ? (
            <View style={{
              paddingVertical: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SolarIcon
                name="User"
                size={64}
                color={theme.colors.onSurfaceVariant}
                type="outline"
              />
              <Text style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                {searchQuery ? 'Không tìm thấy' : 'Chưa có bạn bè'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
              }}>
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Tìm kiếm và kết bạn với mọi người'}
              </Text>
            </View>
          ) : (
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: gap,
            }}>
              {filteredFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={{
                  width: cardWidth,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.roundness,
                  padding: isTablet ? 16 : 12,
                  ...createShadow({
                    color: theme.colors.shadow,
                    offsetY: 2,
                    opacity: 0.1,
                    radius: 8,
                    elevation: 2,
                  }),
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}>
                  <Avatar.Text
                    size={48}
                    label={friend.name.charAt(0).toUpperCase()}
                    style={{
                      marginRight: 12,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                    labelStyle={{ color: theme.colors.onSurfaceVariant }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.onSurface,
                      marginBottom: 4,
                    }} numberOfLines={1}>
                      {friend.name}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.onSurfaceVariant,
                    }}>
                      {friend.mutualFriends} bạn chung
                    </Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={16}
                    style={{ marginTop: -4 }}
                    onPress={() => {}}
                  />
                </View>
              </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dialog for notifications */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
