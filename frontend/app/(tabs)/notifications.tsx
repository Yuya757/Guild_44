import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Clock, Instagram, Twitter, CheckCircle, XCircle, Bell } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Define types
type NotificationType = 'permission_request' | 'permission_approved' | 'permission_denied' | 'post_scheduled' | 'post_published';
type PlatformType = 'instagram' | 'twitter';

interface Notification {
  id: string;
  type: NotificationType;
  image: string;
  title: string;
  platform: PlatformType;
  date: string;
  time: string;
  timestamp: string;
  read: boolean;
}

// モックデータ: 通知
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'permission_request',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    title: '田中花子さんが写真の使用許可をリクエストしています',
    platform: 'instagram',
    date: '2025-06-20',
    time: '18:30',
    timestamp: '10分前',
    read: false,
  },
  {
    id: '2',
    type: 'permission_approved',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    title: '佐藤太郎さんがあなたの許可リクエストを承認しました',
    platform: 'twitter',
    date: '2025-06-22',
    time: '12:00',
    timestamp: '1時間前',
    read: false,
  },
  {
    id: '3',
    type: 'permission_denied',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    title: '鈴木一郎さんがあなたの許可リクエストを却下しました',
    platform: 'instagram',
    date: '2025-06-25',
    time: '09:00',
    timestamp: '3時間前',
    read: true,
  },
  {
    id: '4',
    type: 'post_scheduled',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&q=80',
    title: '予約投稿が正常にスケジュールされました',
    platform: 'twitter',
    date: '2025-06-30',
    time: '20:15',
    timestamp: '昨日',
    read: true,
  },
  {
    id: '5',
    type: 'post_published',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&q=80',
    title: 'あなたの投稿が公開されました',
    platform: 'instagram',
    date: '2025-06-15',
    time: '14:30',
    timestamp: '2日前',
    read: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={16} {...{color: "#E1306C"} as any} />;
      case 'twitter':
        return <Twitter size={16} {...{color: "#1DA1F2"} as any} />;
      default:
        return null;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'permission_request':
        return <Bell size={20} {...{color: "#3B82F6"} as any} />;
      case 'permission_approved':
        return <CheckCircle size={20} {...{color: "#10B981"} as any} />;
      case 'permission_denied':
        return <XCircle size={20} {...{color: "#EF4444"} as any} />;
      case 'post_scheduled':
        return <Calendar size={20} {...{color: "#8B5CF6"} as any} />;
      case 'post_published':
        return <Instagram size={20} {...{color: "#E1306C"} as any} />;
      default:
        return <Bell size={20} {...{color: "#3B82F6"} as any} />;
    }
  };

  const getNotificationRoute = (notification: Notification): string => {
    switch (notification.type) {
      case 'permission_request':
        return `/permission-request/${notification.id}`;
      case 'permission_approved':
      case 'permission_denied':
        return `/scheduled-posts`;
      case 'post_scheduled':
      case 'post_published':
        return `/scheduled-post-details/${notification.id}`;
      default:
        return '/';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    // Using 'as any' to bypass the router path type checking
    // A proper fix would involve defining all valid routes in your app
    router.push(getNotificationRoute(notification) as any);
  };

  const renderNotificationItem = ({ item, index }: { item: Notification, index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIconContainer}>
          {getNotificationIcon(item.type)}
        </View>
        
        <View style={styles.notificationDetails}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
          </View>
          
          <View style={styles.notificationImage}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.platformContainer}>
              {getPlatformIcon(item.platform)}
            </View>
          </View>
          
          <View style={styles.scheduleInfo}>
            <Calendar size={14} {...{color: "#64748B"} as any} />
            <Text style={styles.scheduleText}>{item.date}</Text>
            <Clock size={14} {...{color: "#64748B"} as any} style={styles.clockIcon} />
            <Text style={styles.scheduleText}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>通知</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={60} {...{color: "#CBD5E1"} as any} />
            <Text style={styles.emptyText}>通知はありません</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  readNotification: {
    backgroundColor: '#FFFFFF',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginRight: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  notificationImage: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  platformContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginLeft: 4,
  },
  clockIcon: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 16,
  },
});