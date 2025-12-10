import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  useTheme,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/slices/authSlice';

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  React.useEffect(() => {
    // Clear error khi component mount
    dispatch(clearError());
  }, [dispatch]);

  React.useEffect(() => {
    // Hiển thị lỗi nếu có
    if (error) {
      if (typeof error === 'object' && error.errors && Object.keys(error.errors).length > 0) {
        const errorMessages = Object.values(error.errors).flat().join('\n');
        setDialogTitle('Đăng ký thất bại');
        setDialogMessage(errorMessages);
      } else {
        const errorMessage = typeof error === 'object' ? error.message : error;
        setDialogTitle('Đăng ký thất bại');
        setDialogMessage(errorMessage || 'Vui lòng thử lại');
      }
      setDialogVisible(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirmation.trim()) {
      setDialogTitle('Lỗi');
      setDialogMessage('Vui lòng nhập đầy đủ thông tin');
      setDialogVisible(true);
      return;
    }

    if (password.length < 6) {
      setDialogTitle('Lỗi');
      setDialogMessage('Mật khẩu phải có ít nhất 6 ký tự');
      setDialogVisible(true);
      return;
    }

    if (password !== passwordConfirmation) {
      setDialogTitle('Lỗi');
      setDialogMessage('Mật khẩu xác nhận không khớp');
      setDialogVisible(true);
      return;
    }

    await dispatch(register({
      name: name.trim(),
      email: email.trim(),
      password,
      passwordConfirmation,
    }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
    },
    logoIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    footerLink: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="checkmark" size={32} color={theme.colors.onPrimary} />
              </View>
              <Text style={styles.logoText}>FLOW</Text>
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              Tạo tài khoản mới
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Đăng ký để bắt đầu
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Họ và tên"
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoCapitalize="words"
              left={<TextInput.Icon icon="account" />}
              style={styles.inputContainer}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
              style={styles.inputContainer}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye' : 'eye-off'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.inputContainer}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              label="Xác nhận mật khẩu"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              mode="outlined"
              secureTextEntry={!showPasswordConfirmation}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPasswordConfirmation ? 'eye' : 'eye-off'}
                  onPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                />
              }
              style={styles.inputContainer}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={{ marginTop: 8, borderRadius: theme.roundness }}
              contentStyle={{ paddingVertical: 8 }}
            >
              Đăng ký
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Login')}
              >
                Đăng nhập ngay
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
