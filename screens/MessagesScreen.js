import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Avatar,
  IconButton,
  Chip,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
  addMessage,
  updateConversation,
  markConversationAsRead,
  setCurrentConversation,
} from '../store/slices/messagesSlice';
import { getFriends } from '../store/slices/friendsSlice';
import socketService from '../services/socket';

const getIsTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

const getIsDesktop = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024;
};

// Helper function to format timestamp
const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays < 7) return `${diffDays} ngày`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'groups', label: 'Nhóm' },
];

export default function MessagesScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { friends } = useAppSelector((state) => state.friends);
  const {
    conversations,
    messages,
    currentConversation,
    isLoading,
    isSending,
  } = useAppSelector((state) => state.messages);

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Load conversations and friends on mount
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(getFriends());
  }, [dispatch]);

  // Connect to socket for real-time messaging
  useEffect(() => {
    if (user) {
      socketService.connect(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
      });

      // Listen for new messages
      const handleNewMessage = (data) => {
        if (data.conversation_id) {
          dispatch(addMessage({
            conversationId: data.conversation_id,
            message: data,
          }));
          dispatch(updateConversation({
            id: data.conversation_id,
            last_message: data.message || data.text,
            last_message_at: data.created_at,
            unread: data.sender_id !== user.id,
          }));
        }
      };

      socketService.on('message:received', handleNewMessage);
      socketService.on('message:sent', handleNewMessage);

      return () => {
        socketService.off('message:received', handleNewMessage);
        socketService.off('message:sent', handleNewMessage);
      };
    }
  }, [user, dispatch]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Chỉ fetch messages nếu conversation ID không phải là friend-X (tạm thời)
      // Vì backend API chưa có, nên skip fetch cho conversations từ friends
      if (!selectedConversation.toString().startsWith('friend-')) {
        dispatch(fetchMessages(selectedConversation));
      }
      dispatch(setCurrentConversation(selectedConversation));
      dispatch(markConversationAsRead(selectedConversation));
      
      // Join conversation room for real-time updates
      socketService.joinRoom(`conversation:${selectedConversation}`);
      
      return () => {
        socketService.leaveRoom(`conversation:${selectedConversation}`);
      };
    }
  }, [selectedConversation, dispatch]);

  const { width } = dimensions;
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isMobile = !isTablet && !isDesktop;

  // Trên mobile, mặc định ẩn sidebar nếu đã chọn conversation
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(!selectedConversation);
    } else if (isTablet || isDesktop) {
      setShowSidebar(true);
    }
  }, [isMobile, isTablet, isDesktop, selectedConversation]);

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const currentMessages = selectedConversation ? (messages[selectedConversation] || []) : [];

  const handleConversationSelect = (id) => {
    setSelectedConversation(id);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      const conv = conversations.find(c => c.id === selectedConversation);
      const recipientId = conv?.participant?.id || conv?.friend_id;
      
      await dispatch(sendMessage({
        conversationId: selectedConversation,
        message: text,
        recipientId: recipientId,
      })).unwrap();

      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Emit socket event for real-time
      socketService.emit('message:send', {
        conversation_id: selectedConversation,
        recipient_id: recipientId,
        message: text,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(text);
    }
  };

  const handleStartConversation = async (friendId) => {
    try {
      const result = await dispatch(createConversation(friendId)).unwrap();
      setSelectedConversation(result.id);
      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: isDesktop ? 380 : isTablet ? 360 : width,
      backgroundColor: theme.colors.surface,
      borderRightWidth: isMobile ? 0 : 1,
      borderRightColor: theme.colors.outline,
      display: showSidebar ? 'flex' : 'none',
      position: isMobile ? 'absolute' : 'relative',
      zIndex: isMobile ? 10 : 0,
      height: '100%',
      left: isMobile ? 0 : 'auto',
      top: isMobile ? 0 : 'auto',
    },
    sidebarHeader: {
      padding: isTablet ? 16 : 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    sidebarTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isTablet ? 12 : 8,
    },
    titleText: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    searchContainer: {
      marginBottom: 12,
    },
    searchInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      height: 40,
    },
    tabsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    tab: {
      marginRight: 8,
    },
    conversationsList: {
      flex: 1,
    },
    conversationItem: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: 'transparent',
    },
    conversationItemActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    conversationAvatar: {
      marginRight: 12,
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    conversationName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    conversationNameUnread: {
      fontWeight: 'bold',
    },
    conversationTime: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    conversationMessage: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      flex: 1,
    },
    conversationMessageUnread: {
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    onlineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.success,
      position: 'absolute',
      bottom: 0,
      right: 0,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    chatArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
      minWidth: 0, // Để flex hoạt động đúng
      display: isMobile && showSidebar ? 'none' : 'flex',
    },
    chatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isTablet ? 12 : 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    chatHeaderInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatHeaderAvatar: {
      marginRight: 12,
    },
    chatHeaderText: {
      flex: 1,
    },
    chatHeaderName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    chatHeaderStatus: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    chatHeaderActions: {
      flexDirection: 'row',
    },
    messagesContainer: {
      flex: 1,
      padding: isTablet ? 20 : 12,
    },
    pinnedMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      marginBottom: 16,
    },
    pinnedIcon: {
      marginRight: 8,
    },
    pinnedText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      flex: 1,
    },
    messageBubble: {
      maxWidth: isTablet ? '70%' : '85%',
      padding: isTablet ? 12 : 10,
      borderRadius: theme.roundness,
      marginBottom: 8,
    },
    messageBubbleMe: {
      backgroundColor: theme.colors.primary,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
      backgroundColor: theme.colors.surfaceVariant,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    messageTextMe: {
      color: theme.colors.onPrimary,
    },
    messageTime: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    messageTimeMe: {
      color: theme.colors.onPrimary,
      opacity: 0.8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isTablet ? 8 : 4,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    inputIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 8 : 4,
    },
    inputField: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness * 2,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 8 : 6,
      marginHorizontal: isTablet ? 8 : 4,
      maxHeight: 100,
      fontSize: isTablet ? 14 : 13,
      color: theme.colors.onSurface,
    },
    inputActions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 8 : 4,
    },
    backButton: {
      marginRight: 8,
    },
  });

  // Create conversations from friends if no conversations exist
  const conversationsFromFriends = friends.map(friend => ({
    id: `friend-${friend.id}`,
    name: friend.name,
    lastMessage: null,
    last_message_at: null,
    unread: false,
    unread_count: 0,
    participant: friend,
    friend_id: friend.id,
    isFriend: true,
  }));

  // Combine API conversations with friends (remove duplicates)
  const allConversations = [
    ...conversations,
    ...conversationsFromFriends.filter(
      friendConv => !conversations.find(c => c.friend_id === friendConv.friend_id)
    ),
  ];

  const filteredConversations = allConversations.filter((conv) => {
    if (searchQuery) {
      return conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeTab === 'unread') {
      return conv.unread || conv.unread_count > 0;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarTitle}>
              <Text style={styles.titleText}>Đoạn chat</Text>
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon="dots-vertical"
                  iconColor={theme.colors.onSurfaceVariant}
                  size={20}
                  onPress={() => {}}
                />
                <IconButton
                  icon="pencil"
                  iconColor={theme.colors.onSurfaceVariant}
                  size={20}
                  onPress={() => {}}
                />
              </View>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Tìm kiếm trên Messenger"
                value={searchQuery}
                onChangeText={setSearchQuery}
                left={<TextInput.Icon icon="magnify" />}
                style={styles.searchInput}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>

          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <Chip
                key={tab.id}
                selected={activeTab === tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={styles.tab}
                selectedColor={theme.colors.primary}
                textStyle={{
                  color:
                    activeTab === tab.id
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                  fontWeight: activeTab === tab.id ? '600' : '400',
                }}
              >
                {tab.label}
              </Chip>
            ))}
            {activeTab === 'groups' && (
              <IconButton
                icon="dots-vertical"
                iconColor={theme.colors.onSurfaceVariant}
                size={16}
                onPress={() => {}}
              />
            )}
          </View>

          <ScrollView style={styles.conversationsList}>
            {filteredConversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={[
                  styles.conversationItem,
                  selectedConversation === conv.id && styles.conversationItemActive,
                ]}
                onPress={() => handleConversationSelect(conv.id)}
                activeOpacity={0.7}
              >
                <View style={styles.conversationAvatar}>
                  <Avatar.Text
                    size={48}
                    label={conv.name.charAt(0).toUpperCase()}
                    style={{
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                    labelStyle={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {conv.online && <View style={styles.onlineDot} />}
                  </Avatar.Text>
                </View>
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text
                      style={[
                        styles.conversationName,
                        conv.unread && styles.conversationNameUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {conv.name}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatTimestamp(conv.last_message_at || conv.timestamp)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.conversationMessage,
                      conv.unread && styles.conversationMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {conv.last_message || conv.lastMessage || 'Chưa có tin nhắn'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
          {selectedConversation && selectedConv ? (
            <>
              <View style={styles.chatHeader}>
                {isMobile && (
                  <IconButton
                    icon="arrow-left"
                    iconColor={theme.colors.onSurface}
                    size={24}
                    style={styles.backButton}
                    onPress={() => {
                      setSelectedConversation(null);
                      setShowSidebar(true);
                    }}
                  />
                )}
                <View style={styles.chatHeaderInfo}>
                  <Avatar.Text
                    size={isTablet ? 40 : 36}
                    label={selectedConv.name.charAt(0).toUpperCase()}
                    style={[
                      styles.chatHeaderAvatar,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    labelStyle={{ color: theme.colors.onSurfaceVariant }}
                  />
                  <View style={styles.chatHeaderText}>
                    <Text style={styles.chatHeaderName}>{selectedConv.name}</Text>
                    <Text style={styles.chatHeaderStatus}>
                      {selectedConv.online ? 'Đang hoạt động' : `Hoạt động ${formatTimestamp(selectedConv.last_message_at || selectedConv.timestamp)} trước`}
                    </Text>
                  </View>
                </View>
                <View style={styles.chatHeaderActions}>
                  <IconButton
                    icon="phone"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => {}}
                  />
                  <IconButton
                    icon="video"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => {}}
                  />
                  <IconButton
                    icon="information"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => {}}
                  />
                </View>
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                onContentSizeChange={() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }}
              >
                {isLoading && currentMessages.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  </View>
                ) : currentMessages.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                    </Text>
                  </View>
                ) : (
                  currentMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id || msg.sender === 'me';
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.messageBubble,
                          isMe
                            ? styles.messageBubbleMe
                            : styles.messageBubbleOther,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            isMe && styles.messageTextMe,
                          ]}
                        >
                          {msg.message || msg.text}
                        </Text>
                        <Text
                          style={[
                            styles.messageTime,
                            isMe && styles.messageTimeMe,
                          ]}
                        >
                          {formatMessageTime(msg.created_at || msg.timestamp)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcons}>
                  <IconButton
                    icon="microphone"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => {}}
                  />
                  <IconButton
                    icon="image"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => {}}
                  />
                  <IconButton
                    icon="emoticon-happy"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={20}
                    onPress={() => {}}
                  />
                </View>
                <RNTextInput
                  style={styles.inputField}
                  placeholder="Aa"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  onSubmitEditing={handleSendMessage}
                  editable={!isSending}
                />
                <View style={styles.inputActions}>
                  {messageText.trim() ? (
                    <IconButton
                      icon="send"
                      iconColor={theme.colors.primary}
                      size={20}
                      onPress={handleSendMessage}
                      disabled={isSending}
                    />
                  ) : (
                    <>
                      <IconButton
                        icon="emoticon"
                        iconColor={theme.colors.onSurfaceVariant}
                        size={20}
                        onPress={() => {}}
                      />
                      <IconButton
                        icon="thumb-up"
                        iconColor={theme.colors.onSurfaceVariant}
                        size={20}
                        onPress={() => {}}
                      />
                    </>
                  )}
                </View>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Chọn một cuộc trò chuyện để bắt đầu
              </Text>
            </View>
          )}
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
