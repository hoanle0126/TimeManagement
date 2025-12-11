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
  ActivityIndicator,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    // Clear error khi component mount
    dispatch(clearError());
  }, [dispatch]);

  React.useEffect(() => {
    // Hiển thị lỗi nếu có
    if (error) {
      setDialogTitle('Đăng nhập thất bại');
      setDialogMessage(error || 'Vui lòng thử lại');
      setDialogVisible(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setDialogTitle('Lỗi');
      setDialogMessage('Vui lòng nhập đầy đủ thông tin');
      setDialogVisible(true);
      return;
    }

    await dispatch(login({ email: email.trim(), password }));
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
      marginBottom: 48,
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
              Chào mừng trở lại!
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Đăng nhập để tiếp tục
            </Text>
          </View>

          <View style={styles.form}>
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

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={{ marginTop: 8, borderRadius: theme.roundness }}
              contentStyle={{ paddingVertical: 8 }}
            >
              Đăng nhập
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Đăng ký ngay
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
