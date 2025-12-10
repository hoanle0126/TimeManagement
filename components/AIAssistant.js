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
  Button,
  IconButton,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';

export default function AIAssistant({
  visible,
  onClose,
  onParseComplete,
  isLoading = false,
}) {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');

  const handleParse = () => {
    if (inputText.trim()) {
      onParseComplete(inputText.trim());
      setInputText('');
    }
  };

  const exampleTexts = [
    "Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai, ưu tiên cao",
    "Hoàn thành báo cáo cuối tháng trước ngày 20, quan trọng",
    "Mua sắm đồ dùng văn phòng vào cuối tuần",
    "Review code PR #123 cho feature authentication, deadline 2 ngày nữa",
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
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
          padding: 16,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <SolarIcon name="MagicStick" size={24} color={theme.colors.primary} type="bold" />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.onSurface,
              }}>
                AI Assistant
              </Text>
            </View>
            <IconButton
              icon="close"
              iconColor={theme.colors.onSurfaceVariant}
              size={24}
              onPress={onClose}
            />
          </View>

          {/* Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.onSurface,
              marginBottom: 8,
            }}>
              Mô tả task bằng lời nói tự nhiên:
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Ví dụ: Nhớ gọi điện cho khách hàng ABC vào 3 giờ chiều mai, ưu tiên cao"
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                minHeight: 100,
              }}
              right={
                isLoading && (
                  <TextInput.Icon icon={() => <ActivityIndicator size="small" color={theme.colors.primary} />} />
                )
              }
            />
          </View>

          {/* Example Texts */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 12,
              color: theme.colors.onSurfaceVariant,
              marginBottom: 8,
            }}>
              Ví dụ:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {exampleTexts.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setInputText(example)}
                  >
                    <Chip
                      mode="outlined"
                      style={{
                        backgroundColor: theme.colors.surfaceVariant,
                      }}
                      textStyle={{
                        fontSize: 11,
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {example.length > 40 ? example.substring(0, 40) + '...' : example}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
          }}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={{ flex: 1 }}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleParse}
              disabled={!inputText.trim() || isLoading}
              style={{ flex: 1 }}
              icon="auto-fix"
            >
              Phân tích
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}


