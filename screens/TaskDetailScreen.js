import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskProgressWidget from '../components/TaskProgressWidget';
import TaskTimelineWidget from '../components/TaskTimelineWidget';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function TaskDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const taskName = route?.params?.taskName || 'Delivery App UI Kit';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    placeholder: {
      width: 24,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: isTablet ? 20 : 16,
      paddingBottom: 100,
      gap: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onSurface}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          {taskName}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TaskProgressWidget />
        <TaskTimelineWidget />
      </ScrollView>
    </SafeAreaView>
  );
}
