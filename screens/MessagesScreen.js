import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  TextInput,
  Avatar,
  IconButton,
  Chip,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { createShadow } from '../utils/shadow';

const getIsTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

const getIsDesktop = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024;
};

// Mock data
const mockConversations = [
  {
    id: 1,
    name: 'Lọ Vương',
    lastMessage: ':))',
    timestamp: '19 phút',
    unread: false,
    avatar: null,
  },
  {
    id: 2,
    name: 'Huy Đặng',
    lastMessage: 'rất lmew',
    timestamp: '1 giờ',
    unread: false,
    avatar: null,
  },
  {
    id: 3,
    name: 'Simp Lỏd',
    lastMessage: 'Bạn: nó đẹp hơn tự làm á:))',
    timestamp: '4 giờ',
    unread: true,
    avatar: null,
  },
  {
    id: 4,
    name: 'Châu Mẫn',
    lastMessage: 'Bạn: ukm azir thuần free, swai...',
    timestamp: '5 giờ',
    unread: false,
    avatar: null,
    online: true,
  },
  {
    id: 5,
    name: 'Le Hung',
    lastMessage: 'Bạn đã thu hồi một tin nhắn',
    timestamp: '7 giờ',
    unread: false,
    avatar: null,
  },
];

const mockMessages = [
  { id: 1, text: 'H ăn nừ', sender: 'other', timestamp: '10:30' },
  { id: 2, text: 'Nè', sender: 'other', timestamp: '10:31' },
  { id: 3, text: 'Nấu io', sender: 'other', timestamp: '10:32' },
  { id: 4, text: 'vl ko', sender: 'me', timestamp: '10:33' },
  { id: 5, text: 'ít nhất 5h30', sender: 'me', timestamp: '10:34' },
  {
    id: 6,
    text: 'T vừa mới kêu cơm xong ❤️',
    sender: 'other',
    timestamp: '10:35',
  },
  { id: 7, text: 't ăn trưa khi 2h', sender: 'me', timestamp: '10:36' },
  {
    id: 8,
    text: 'xog 4h30 đi ăn, điên à ba:))',
    sender: 'me',
    timestamp: '10:37',
  },
  { id: 9, text: 'Rk tí 6h đi ăn ko', sender: 'me', timestamp: '10:38' },
  { id: 10, text: 'Ko t nấu háy', sender: 'me', timestamp: '10:39' },
  { id: 11, text: ':))', sender: 'other', timestamp: '10:40' },
];

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'groups', label: 'Nhóm' },
];

export default function MessagesScreen() {
  const theme = useTheme();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

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

  const selectedConv = mockConversations.find((c) => c.id === selectedConversation);

  const handleConversationSelect = (id) => {
    setSelectedConversation(id);
    if (isMobile) {
      setShowSidebar(false);
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

  const filteredConversations = mockConversations.filter((conv) => {
    if (searchQuery) {
      return conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeTab === 'unread') {
      return conv.unread;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
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
                    <Text style={styles.conversationTime}>{conv.timestamp}</Text>
                  </View>
                  <Text
                    style={[
                      styles.conversationMessage,
                      conv.unread && styles.conversationMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {conv.lastMessage}
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
                      Hoạt động {selectedConv.timestamp} trước
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

              <ScrollView style={styles.messagesContainer}>
                <View style={styles.pinnedMessage}>
                  <Ionicons
                    name="pin"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.pinnedIcon}
                  />
                  <Text style={styles.pinnedText}>Kickyourassup1</Text>
                </View>

                {mockMessages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.sender === 'me'
                        ? styles.messageBubbleMe
                        : styles.messageBubbleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.sender === 'me' && styles.messageTextMe,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        msg.sender === 'me' && styles.messageTimeMe,
                      ]}
                    >
                      {msg.timestamp}
                    </Text>
                  </View>
                ))}
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
                />
                <View style={styles.inputActions}>
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
    </SafeAreaView>
  );
}
