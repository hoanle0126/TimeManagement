import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Avatar,
  Chip,
  IconButton,
  Button,
  useTheme,
  Divider,
} from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';

export default function UserSelector({
  visible,
  onClose,
  selectedUsers = [],
  friends = [],
  onSelectUsers,
  title = 'Chọn người tham gia',
  allowEmail = true,
}) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(
    selectedUsers.map(u => u.id || u.user_id).filter(Boolean)
  );
  const [selectedEmails, setSelectedEmails] = useState(
    selectedUsers.filter(u => !u.id && !u.user_id && u.email).map(u => u.email)
  );

  const filteredFriends = friends.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUser = (user) => {
    const userId = user.id;
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      if (!selectedEmails.includes(trimmedEmail)) {
        setSelectedEmails([...selectedEmails, trimmedEmail]);
        setEmailInput('');
      }
    }
  };

  const handleRemoveEmail = (email) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email));
  };

  const handleConfirm = () => {
    const selected = [
      ...friends.filter(f => selectedUserIds.includes(f.id)).map(f => ({
        user_id: f.id,
        name: f.name,
        email: f.email,
      })),
      ...selectedEmails.map(email => ({ email })),
    ];
    onSelectUsers(selected);
    onClose();
  };

  const handleCancel = () => {
    setSelectedUserIds(selectedUsers.map(u => u.id || u.user_id).filter(Boolean));
    setSelectedEmails(selectedUsers.filter(u => !u.id && !u.user_id && u.email).map(u => u.email));
    onClose();
  };

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 4,
    opacity: 0.2,
    radius: 12,
    elevation: 8,
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.roundness * 2,
          borderTopRightRadius: theme.roundness * 2,
          maxHeight: '80%',
          ...cardShadow,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.onSurface,
            }}>
              {title}
            </Text>
            <IconButton
              icon="close"
              iconColor={theme.colors.onSurfaceVariant}
              size={24}
              onPress={handleCancel}
            />
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Search */}
            <View style={{ padding: 16, paddingBottom: 8 }}>
              <TextInput
                mode="outlined"
                placeholder="Tìm kiếm bạn bè..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                left={<TextInput.Icon icon="magnify" />}
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              />
            </View>

            {/* Friends List */}
            {filteredFriends.length > 0 && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 12,
                }}>
                  Bạn bè ({filteredFriends.length})
                </Text>
                <View style={{ gap: 8 }}>
                  {filteredFriends.map((friend) => {
                    const isSelected = selectedUserIds.includes(friend.id);
                    return (
                      <TouchableOpacity
                        key={friend.id}
                        onPress={() => handleToggleUser(friend)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          backgroundColor: isSelected
                            ? theme.colors.primaryContainer
                            : theme.colors.surfaceVariant,
                          borderRadius: theme.roundness,
                          gap: 12,
                        }}
                      >
                        <Avatar.Text
                          size={40}
                          label={friend.name?.charAt(0).toUpperCase() || 'U'}
                          style={{
                            backgroundColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.primaryContainer,
                          }}
                          labelStyle={{
                            color: isSelected
                              ? theme.colors.onPrimary
                              : theme.colors.onPrimaryContainer,
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: theme.colors.onSurface,
                          }}>
                            {friend.name}
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: theme.colors.onSurfaceVariant,
                          }}>
                            {friend.email}
                          </Text>
                        </View>
                        {isSelected && (
                          <SolarIcon
                            name="CheckCircle"
                            size={24}
                            color={theme.colors.primary}
                            type="bold"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Email Input */}
            {allowEmail && (
              <>
                <Divider style={{ marginVertical: 8 }} />
                <View style={{ padding: 16, paddingTop: 8 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 12,
                  }}>
                    Thêm bằng email
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      mode="outlined"
                      placeholder="Nhập email..."
                      value={emailInput}
                      onChangeText={setEmailInput}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.surfaceVariant,
                      }}
                      right={
                        emailInput.trim() && (
                          <TextInput.Icon
                            icon="plus-circle"
                            onPress={handleAddEmail}
                            iconColor={theme.colors.primary}
                          />
                        )
                      }
                    />
                  </View>
                  {selectedEmails.length > 0 && (
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 12,
                    }}>
                      {selectedEmails.map((email) => (
                        <Chip
                          key={email}
                          mode="flat"
                          onClose={() => handleRemoveEmail(email)}
                          style={{
                            backgroundColor: theme.colors.secondaryContainer,
                          }}
                          textStyle={{
                            color: theme.colors.onSecondaryContainer,
                            fontSize: 12,
                          }}
                        >
                          {email}
                        </Chip>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Selected Summary */}
            {(selectedUserIds.length > 0 || selectedEmails.length > 0) && (
              <View style={{
                padding: 16,
                backgroundColor: theme.colors.primaryContainer + '20',
                margin: 16,
                borderRadius: theme.roundness,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 4,
                }}>
                  Đã chọn: {selectedUserIds.length + selectedEmails.length} người
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
          }}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={{ flex: 1 }}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={{ flex: 1 }}
            >
              Xác nhận
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

