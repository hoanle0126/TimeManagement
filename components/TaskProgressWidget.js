import React from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';

const progressData = [
  { day: 12, change: 8, color: 'success' },
  { day: 13, change: 2, color: 'success' },
  { day: 14, change: 12, color: 'warning' },
  { day: 15, change: 5, color: 'success' },
  { day: 16, value: 65, change: 8, color: 'warning', isCurrent: true },
  { day: 17, change: 6, color: 'success' },
  { day: 18, change: 10, color: 'warning' },
];

export default function TaskProgressWidget() {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const maxHeight = 120;
  const maxValue = 100;

  const getColor = (colorType) => {
    switch (colorType) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 1.33,
    },
    cardContent: {
      padding: isTablet ? 20 : 16,
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
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
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
      borderRadius: theme.roundness,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 8,
      marginBottom: 4,
    },
    currentBarValue: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    currentBarIndicator: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    currentBarChange: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    dayLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    alert: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      padding: 16,
      gap: 12,
    },
    alertText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
  });

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 3,
  });

  return (
    <View style={styles.container}>
      <Card style={[styles.card, cardShadow]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SolarIcon name="Clipboard" size={20} color={theme.colors.onSurface} type="outline" />
              <Text style={styles.title}>Task Progress</Text>
            </View>
            <TouchableOpacity
              onPress={() => {}}
              style={{ padding: 4 }}
            >
              <SolarIcon name="MenuDots" size={20} color={theme.colors.onSurfaceVariant} type="outline" />
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {progressData.map((item, index) => {
                const height = item.value 
                  ? (item.value / maxValue) * maxHeight 
                  : (item.change / 20) * maxHeight;
                const color = getColor(item.color);
                
                return (
                  <View key={index} style={styles.barContainer}>
                    {item.isCurrent ? (
                      <View style={styles.currentBarWrapper}>
                        <View style={[
                          styles.currentBar, 
                          { 
                            height: height + 20,
                            backgroundColor: theme.colors.inverseSurface,
                          }
                        ]}>
                          <Text style={[
                            styles.currentBarValue,
                            { color: theme.colors.inverseOnSurface },
                          ]}>
                            {item.value}%
                          </Text>
                          <View style={[
                            styles.currentBarIndicator,
                            { backgroundColor: theme.colors.warning },
                          ]}>
                            <Text style={[
                              styles.currentBarChange,
                              { color: theme.colors.onWarning || theme.colors.onSurface },
                            ]}>
                              +{item.change}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.barWrapper}>
                        <View style={[styles.bar, { height, backgroundColor: color }]} />
                        <Text style={[styles.barChange, { color }]}>
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
            <SolarIcon name="Like" size={20} color={theme.colors.success} type="bold" />
            <Text style={styles.alertText}>You have a good progress.</Text>
            <TouchableOpacity
              onPress={() => {}}
              style={{ padding: 4 }}
            >
              <SolarIcon name="CloseCircle" size={20} color={theme.colors.onSurfaceVariant} type="outline" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
