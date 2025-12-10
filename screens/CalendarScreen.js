import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarWidget from '../components/CalendarWidget';
import TodayTasksWidget from '../components/TodayTasksWidget';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CalendarScreen({ navigation }) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalendarWidget />
        <TodayTasksWidget navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}
