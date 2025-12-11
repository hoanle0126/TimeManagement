import React, { useState } from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarWidget from '../components/CalendarWidget';
import CalendarSidebar from '../components/CalendarSidebar';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CalendarScreen({ navigation }) {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Tháng 2 năm 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 1)); // Ngày 1 tháng 2

  return (
    <SafeAreaView 
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }} 
      edges={['top']}
    >
      <Header />
      <View style={{
        flex: 1,
        flexDirection: 'row',
      }}>
        <View style={{
          backgroundColor: theme.colors.surface,
        }}>
          <CalendarSidebar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>
        <View style={{
          flex: 1,
          padding: isTablet ? 20 : 16,
        }}>
          <CalendarWidget 
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
