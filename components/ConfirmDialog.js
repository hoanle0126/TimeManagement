import React from 'react';
import { Dialog, Portal, Paragraph, Button, useTheme } from 'react-native-paper';

export default function ConfirmDialog({
  visible,
  onDismiss,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'info', // 'info', 'success', 'error', 'warning'
  showCancel = false,
}) {
  const theme = useTheme();

  const getConfirmColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning || '#FF9800';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss || onCancel}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness * 2,
        }}
      >
        <Dialog.Title style={{ color: theme.colors.onSurface }}>
          {title}
        </Dialog.Title>
        <Dialog.Content>
          <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
            {message}
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          {showCancel && (
            <Button
              onPress={onCancel || onDismiss}
              textColor={theme.colors.onSurfaceVariant}
            >
              {cancelText}
            </Button>
          )}
          <Button
            onPress={onConfirm || onDismiss}
            textColor={getConfirmColor()}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}





