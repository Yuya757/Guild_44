import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Instagram, Twitter, CreditCard as Edit, Trash2, Facebook, Snail as Snapchat } from 'lucide-react-native';
import { formatScheduledDate } from '../utils/formatScheduledDate';
import { getStatusStyles } from '../utils/getStatusStyles';
import { getPlatformColor } from '../utils/getPlatformColor';
import { FadeInRight } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

// Define types for scheduled posts
interface ScheduledPost {
  id: string;
  image: string;
  caption: string;
  scheduledDate: string;
  scheduledTime: string;
  platform: 'instagram' | 'twitter' | 'snapchat' | 'facebook' | 'tiktok';
  status: 'approved' | 'pending' | 'denied';
  owner: string;
}

// モックデータ: 予約投稿
const MOCK_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    caption: '新しいプロジェクトについて話し合う素晴らしいチームミーティングでした！ #チームワーク #プロジェクト',
    scheduledDate: '2025-06-20',
    scheduledTime: '18:30',
    platform: 'instagram',
    status: 'approved',
    owner: '田中 花子',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    caption: '今日のイベントで素晴らしい人たちと出会いました。ネットワーキングの大切さを実感！ #ビジネス #ネットワーキング',
    scheduledDate: '2025-06-22',
    scheduledTime: '12:00',
    platform: 'twitter',
    status: 'pending',
    owner: '佐藤 太郎',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    caption: '新しいオフィスでの初日！これからよろしくお願いします。 #新しい始まり #キャリア',
    scheduledDate: '2025-06-25',
    scheduledTime: '09:00',
    platform: 'instagram',
    status: 'approved',
    owner: '鈴木 一郎',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&q=80',
    caption: '週末のチームビルディング活動が楽しかった！素晴らしいチームに感謝。 #チームビルディング #週末',
    scheduledDate: '2025-06-30',
    scheduledTime: '20:15',
    platform: 'twitter',
    status: 'pending',
    owner: '山田 優子',
  },
];

export default function ScheduledPostsScreen() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(MOCK_SCHEDULED_POSTS);
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'denied'>('all');

  const filteredPosts = scheduledPosts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.status === activeTab;
  });

  const getPlatformIcon = (platform: ScheduledPost['platform']) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={20} {...{color: "#E1306C"} as any} />;
      case 'twitter':
        return <Twitter size={20} {...{color: "#1DA1F2"} as any} />;
      case 'snapchat':
        return <Snapchat size={20} {...{color: "#FFFC00"} as any} />;
      case 'facebook':
        return <Facebook size={20} {...{color: "#1877F2"} as any} />;
      case 'tiktok':
        // TikTokのアイコンはLucideにないので、テキストで代用
        return <Text style={{fontSize: 14, fontWeight: 'bold', color: '#000000'}}>TT</Text>;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: ScheduledPost['platform']) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      case 'snapchat':
        return 'Snapchat';
      case 'facebook':
        return 'Facebook';
      case 'tiktok':
        return 'TikTok';
      default:
        return platform;
    }
  };

  const getStatusColor = (status: ScheduledPost['status']) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'denied':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: ScheduledPost['status']) => {
    switch (status) {
      case 'approved':
        return '承認済';
      case 'pending':
        return '承認待ち';
      case 'denied':
        return '却下';
      default:
        return status;
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    // 編集画面に遷移
    router.push(`/edit-scheduled-post/${post.id}`);
  };

  const handleDeletePost = (post: ScheduledPost) => {
    Alert.alert(
      '投稿を削除',
      'この予約投稿を削除してもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '削除',
          onPress: () => {
            // 投稿を削除
            const updatedPosts = scheduledPosts.filter(p => p.id !== post.id);
            setScheduledPosts(updatedPosts);
            Alert.alert('削除完了', '予約投稿が削除されました');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handlePostPress = (postId: string) => {
    // 詳細画面に遷移
    router.push(`/scheduled-post-details/${postId}`);
  };

  const renderPostItem = ({ item }: { item: ScheduledPost }) => {
    const formattedDate = formatScheduledDate(item.scheduledDate, item.scheduledTime);
    const { backgroundColor, statusText, statusColor } = getStatusStyles(item.status);

    return (
      <Animated.View 
        entering={FadeInRight.delay(100 * parseInt(item.id))}
        style={styles.postCard}
      >
        <TouchableOpacity 
          style={styles.postItem}
          onPress={() => handlePostPress(item.id)}
        >
          <Image source={{ uri: item.image }} style={styles.postImage} />
          <View style={styles.postDetails}>
            <View style={styles.postHeader}>
              <Text style={styles.postTitle} numberOfLines={2}>{item.caption}</Text>
              <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(item.platform) + '20' }]}>
                {getPlatformIcon(item.platform)}
              </View>
            </View>
            
            <View style={styles.postMetadata}>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
              
              <View style={styles.dateContainer}>
                <Calendar size={14} {...{color: "#64748B"} as any} />
                <Text style={styles.dateText}>{formattedDate.split(' ')[0]}</Text>
                <Clock size={14} {...{color: "#64748B"} as any} style={styles.clockIcon} />
                <Text style={styles.dateText}>{formattedDate.split(' ')[1]}</Text>
              </View>
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditPost(item)}
              >
                <Edit size={18} {...{color: "#3B82F6"} as any} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeletePost(item)}
              >
                <Trash2 size={18} {...{color: "#EF4444"} as any} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>予約投稿</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}
          >
            すべて
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.activeTabText,
            ]}
          >
            承認待ち
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'approved' && styles.activeTabText,
            ]}
          >
            承認済
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>予約投稿がありません</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-scheduled-post')}
      >
        <Text style={styles.createButtonText}>新規予約投稿を作成</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  postsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postImage: {
    width: 120,
    height: 120,
    backgroundColor: '#E2E8F0',
  },
  postDetails: {
    flex: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginLeft: 4,
  },
  clockIcon: {
    marginLeft: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});