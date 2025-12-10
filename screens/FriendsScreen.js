import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Avatar,
  IconButton,
  Button,
  useTheme,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { createShadow } from '../utils/shadow';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Mock data - sẽ thay bằng API call sau
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

const filterTabs = [
  { id: 'all', label: 'Tất cả bạn bè' },
  { id: 'university', label: 'Đại học' },
  { id: 'city', label: 'Tỉnh/Thành phố hiện tại' },
  { id: 'hometown', label: 'Quê quán' },
  { id: 'following', label: 'Đang theo dõi' },
];

export default function FriendsScreen() {
  const theme = useTheme();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

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
  const padding = isTablet ? 40 : 32;
  const gap = 12;
  const cardWidth = (width - padding - (gap * (columns - 1))) / columns;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    headerSection: {
      padding: isTablet ? 20 : 16,
      paddingBottom: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: isTablet ? 32 : 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    actionButton: {
      flex: 1,
      minWidth: 120,
    },
    filterSection: {
      paddingHorizontal: isTablet ? 20 : 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    filterScroll: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      marginRight: 8,
    },
    contentSection: {
      padding: isTablet ? 20 : 16,
    },
    friendsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
    },
    friendCard: {
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
    },
    friendHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    friendAvatar: {
      marginRight: 12,
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    mutualFriends: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    friendMenu: {
      marginTop: -4,
    },
  });

  const filteredFriends = mockFriends.filter((friend) => {
    if (searchQuery) {
      return friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Bạn bè</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              mode="outlined"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChangeText={setSearchQuery}
              left={<TextInput.Icon icon="magnify" />}
              style={styles.searchInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.actionButton}
              textColor={theme.colors.primary}
              icon="account-plus"
            >
              Lời mời kết bạn
            </Button>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.actionButton}
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

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterTabs.map((tab) => (
              <Chip
                key={tab.id}
                selected={activeFilter === tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={styles.filterChip}
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
        <View style={styles.contentSection}>
          <View style={styles.friendsGrid}>
            {filteredFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendCard}
                activeOpacity={0.7}
              >
                <View style={styles.friendHeader}>
                  <Avatar.Text
                    size={48}
                    label={friend.name.charAt(0).toUpperCase()}
                    style={[
                      styles.friendAvatar,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    labelStyle={{ color: theme.colors.onSurfaceVariant }}
                  />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName} numberOfLines={1}>
                      {friend.name}
                    </Text>
                    <Text style={styles.mutualFriends}>
                      {friend.mutualFriends} bạn chung
                    </Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    iconColor={theme.colors.onSurfaceVariant}
                    size={16}
                    style={styles.friendMenu}
                    onPress={() => {}}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
