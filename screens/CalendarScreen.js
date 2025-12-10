import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarWidget from '../components/CalendarWidget';
import TodayTasksWidget from '../components/TodayTasksWidget';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CalendarScreen({ navigation }) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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

