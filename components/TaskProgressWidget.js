import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const progressData = [
  { day: 12, change: 8, color: '#4CAF50' },
  { day: 13, change: 2, color: '#4CAF50' },
  { day: 14, change: 12, color: '#FF9800' },
  { day: 15, change: 5, color: '#4CAF50' },
  { day: 16, value: 65, change: 8, color: '#FF9800', isCurrent: true },
  { day: 17, change: 6, color: '#4CAF50' },
  { day: 18, change: 10, color: '#FF9800' },
];

export default function TaskProgressWidget() {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const maxHeight = 120;
  const maxValue = 100;

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="clipboard" size={20} color="#1A1A1A" />
          <Text style={[styles.title, isTablet && styles.titleTablet]}>Task Progress</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {progressData.map((item, index) => {
            const height = item.value 
              ? (item.value / maxValue) * maxHeight 
              : (item.change / 20) * maxHeight;
            
            return (
              <View key={index} style={styles.barContainer}>
                {item.isCurrent ? (
                  <View style={styles.currentBarWrapper}>
                    <View style={[styles.currentBar, { height: height + 20 }]}>
                      <Text style={styles.currentBarValue}>{item.value}%</Text>
                      <View style={styles.currentBarIndicator}>
                        <Text style={styles.currentBarChange}>+{item.change}%</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height, backgroundColor: item.color }]} />
                    <Text style={[styles.barChange, { color: item.color }]}>
                      +{item.change}%
                    </Text>
                  </View>
                )}
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.alert}>
        <Ionicons name="thumbs-up" size={20} color="#4CAF50" />
        <Text style={styles.alertText}>You have a good progress.</Text>
        <Ionicons name="close" size={20} color="#666" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }
    ),
  },
  containerTablet: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  titleTablet: {
    fontSize: 18,
  },
  chartContainer: {
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingBottom: 30,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '60%',
    minHeight: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  barChange: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentBarWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  currentBar: {
    width: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    marginBottom: 4,
  },
  currentBarValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentBarIndicator: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBarChange: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

