import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
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
  const [alertVisible, setAlertVisible] = useState(true);
  const isTablet = getIsTablet();

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="clipboard" size={20} color="#1A1A1A" />
          <Text style={[styles.title, isTablet && styles.titleTablet]}>Today Tasks</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All &gt;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tasksList}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskDetail', { taskName: task.title })}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
            
            <View style={styles.taskFooter}>
              <View style={styles.membersContainer}>
                {[1, 2, 3, 4].slice(0, task.members).map((i) => (
                  <View key={i} style={[styles.memberAvatar, i > 0 && styles.memberAvatarOverlap]} />
                ))}
                <Text style={styles.moreMembers}>+{task.moreMembers}</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{task.progress}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {alertVisible && (
        <View style={styles.alert}>
          <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          <Text style={styles.alertText}>
            You have 5 tasks today. Keep it up! 👍
          </Text>
          <TouchableOpacity onPress={() => setAlertVisible(false)}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 16,
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
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberAvatarOverlap: {
    marginLeft: -8,
  },
  moreMembers: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 40,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  titleTablet: {
    fontSize: 18,
  },
});

