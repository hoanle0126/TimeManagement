import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Avatar,
  Button,
  useTheme,
  ActivityIndicator,
  Card,
  IconButton,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SolarIcon } from 'react-native-solar-icons';
import Header from '../components/Header';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  searchUsers,
  sendFriendRequest,
  clearSearchResults,
} from '../store/slices/friendsSlice';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SearchUsersScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { searchResults, isSearching, isLoading } = useAppSelector(
    (state) => state.friends
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    // Clear results khi unmount
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  useEffect(() => {
    // Debounce search
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        dispatch(searchUsers(searchQuery.trim()));
      }, 500);
      setDebounceTimer(timer);
    } else {
      dispatch(clearSearchResults());
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchQuery, dispatch]);

  const handleSendRequest = async (userId) => {
    try {
      await dispatch(sendFriendRequest(userId)).unwrap();
      setDialogTitle('Thành công');
      setDialogMessage('Đã gửi lời mời kết bạn');
      setDialogVisible(true);
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Không thể gửi lời mời kết bạn';
      setDialogTitle('Lỗi');
      setDialogMessage(errorMessage);
      setDialogVisible(true);
    }
  };

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 2,
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top']}
    >
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View
          style={{
            padding: isTablet ? 20 : 16,
            paddingBottom: 12,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <IconButton
              icon="arrow-left"
              iconColor={theme.colors.onSurface}
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text
              style={{
                fontSize: isTablet ? 32 : 28,
                fontWeight: 'bold',
                color: theme.colors.onSurface,
                flex: 1,
              }}
            >
              Tìm bạn bè
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              mode="outlined"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              left={<TextInput.Icon icon="magnify" />}
              right={
                searchQuery ? (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => setSearchQuery('')}
                  />
                ) : null
              }
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: theme.roundness,
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.onSurfaceVariant,
                marginTop: -12,
                marginBottom: 8,
              }}
            >
              Nhập ít nhất 2 ký tự để tìm kiếm
            </Text>
          )}
        </View>

        {/* Search Results */}
        <View style={{ padding: isTablet ? 20 : 16 }}>
          {isSearching ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 16,
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 14,
                }}
              >
                Đang tìm kiếm...
              </Text>
            </View>
          ) : searchQuery.trim().length < 2 ? (
            <View
              style={{
                paddingVertical: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SolarIcon
                name="UserSearch"
                size={64}
                color={theme.colors.onSurfaceVariant}
                type="outline"
              />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  marginBottom: 8,
                }}
              >
                Tìm kiếm bạn bè
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.onSurfaceVariant,
                  textAlign: 'center',
                }}
              >
                Nhập tên hoặc email để tìm kiếm người dùng
              </Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View
              style={{
                paddingVertical: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SolarIcon
                name="UserSearch"
                size={64}
                color={theme.colors.onSurfaceVariant}
                type="outline"
              />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  marginBottom: 8,
                }}
              >
                Không tìm thấy
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.onSurfaceVariant,
                  textAlign: 'center',
                }}
              >
                Không có người dùng nào phù hợp với từ khóa "{searchQuery}"
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {searchResults.map((user) => (
                <Card
                  key={user.id}
                  style={[
                    {
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.roundness,
                    },
                    cardShadow,
                  ]}
                >
                  <Card.Content
                    style={{
                      padding: isTablet ? 20 : 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Avatar.Text
                      size={56}
                      label={user.name.charAt(0).toUpperCase()}
                      style={{
                        backgroundColor: theme.colors.primaryContainer,
                      }}
                      labelStyle={{
                        color: theme.colors.onPrimaryContainer,
                        fontSize: 20,
                        fontWeight: '600',
                      }}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: theme.colors.onSurface,
                          marginBottom: 4,
                        }}
                        numberOfLines={1}
                      >
                        {user.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.onSurfaceVariant,
                        }}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleSendRequest(user.id)}
                      disabled={isLoading}
                      buttonColor={theme.colors.primary}
                      textColor={theme.colors.onPrimary}
                      icon="account-plus"
                      style={{
                        borderRadius: theme.roundness,
                      }}
                    >
                      Kết bạn
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness * 2,
          }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            {dialogTitle}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
              {dialogMessage}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
              textColor={theme.colors.primary}
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

