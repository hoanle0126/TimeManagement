import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Card, Text, IconButton, ProgressBar, Avatar, useTheme, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const getIsTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

const tasks = [
  {
    id: 1,
    title: 'Delivery App Kit',
    description: 'We got a project to make a delivery ui kit called Foodnow...',
    members: 4,
    moreMembers: 2,
    progress: 65,
  },
  {
    id: 2,
    title: 'Dribbble Shot',
    description: 'Make a dribbble shot with a project management theme...',
    members: 4,
    moreMembers: 1,
    progress: 80,
  },
];

export default function TodayTasksWidget({ navigation }) {
  const theme = useTheme();
  const [alertVisible, setAlertVisible] = useState(true);
  const isTablet = getIsTablet();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 1.33,
      ...(Platform.OS === 'web' 
        ? { boxShadow: `0 2px 8px ${theme.colors.shadow}1A` }
        : {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }
      ),
    },
    cardContent: {
      padding: isTablet ? 20 : 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
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
    seeAll: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    tasksList: {
      gap: 12,
    },
    taskCard: {
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness,
      marginBottom: 8,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    taskDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      lineHeight: 20,
    },
    taskFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    membersContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -8,
    },
    memberAvatar: {
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    memberAvatarOverlap: {
      marginLeft: -8,
    },
    moreMembers: {
      marginLeft: 4,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      marginLeft: 12,
    },
    progressBar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
      minWidth: 40,
    },
    alert: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inverseSurface,
      borderRadius: theme.roundness,
      padding: 16,
      marginTop: 12,
      gap: 12,
    },
    alertText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.inverseOnSurface,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.card} onPress={() => {}}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="clipboard" size={20} color={theme.colors.onSurface} />
              <Text style={styles.title}>Today Tasks</Text>
            </View>
            <Text style={styles.seeAll} onPress={() => {}}>See All &gt;</Text>
          </View>

          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <Card
                key={task.id}
                style={styles.taskCard}
                onPress={() => navigation?.navigate('TaskDetail', { taskName: task.title })}
                mode="outlined"
                outlineColor={theme.colors.outline}
              >
                <Card.Content>
                  <Text variant="titleMedium" style={styles.taskTitle}>
                    {task.title}
                  </Text>
                  <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                  
                  <View style={styles.taskFooter}>
                    <View style={styles.membersContainer}>
                      {[1, 2, 3, 4].slice(0, task.members).map((i) => (
                        <Avatar.Text
                          key={i}
                          size={28}
                          label={String(i)}
                          style={[
                            styles.memberAvatar,
                            i > 0 && styles.memberAvatarOverlap,
                            { backgroundColor: theme.colors.surfaceVariant },
                          ]}
                          labelStyle={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
                        />
                      ))}
                      <Text style={styles.moreMembers}>+{task.moreMembers}</Text>
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={task.progress / 100}
                        color={theme.colors.primary}
                        style={styles.progressBar}
                      />
                      <Text style={styles.progressText}>{task.progress}%</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>

          {alertVisible && (
            <View style={styles.alert}>
              <Ionicons name="chatbubble" size={20} color={theme.colors.inverseOnSurface} />
              <Text style={styles.alertText}>
                You have 5 tasks today. Keep it up! 👍
              </Text>
              <IconButton
                icon="close"
                iconColor={theme.colors.inverseOnSurface}
                size={20}
                onPress={() => setAlertVisible(false)}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}
