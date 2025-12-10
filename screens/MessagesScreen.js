import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

export default function MessagesScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <View style={styles.content}>
        <Text variant="titleLarge" style={styles.text}>
          Messages Screen
        </Text>
      </View>
    </SafeAreaView>
  );
}
