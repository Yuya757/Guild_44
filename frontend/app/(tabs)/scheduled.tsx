import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Clock, Instagram, Twitter, Edit2, Trash2, Plus, Filter, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Define types
type PlatformType = 'instagram' | 'twitter';
type StatusType = 'approved' | 'pending' | 'denied';

interface ScheduledPost {
  id: string;
  image: string;
  caption: string;
  scheduledDate: string;
  scheduledTime: string;
  platform: PlatformType;
  status: StatusType;
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
  const [activeTab, setActiveTab] = useState<'all' | StatusType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = scheduledPosts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.status === activeTab;
  });

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={20} {...{color: "#E1306C"} as any} />;
      case 'twitter':
        return <Twitter size={20} {...{color: "#1DA1F2"} as any} />;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: PlatformType) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      default:
        return platform;
    }
  };

  const getStatusColor = (status: StatusType) => {
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

  const getStatusText = (status: StatusType) => {
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
            const updatedPosts = scheduledPosts.filter(p => p.id !== post.id);
            setScheduledPosts(updatedPosts);
            Alert.alert('削除完了', '予約投稿が削除されました');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderPostItem = ({ item, index }: { item: ScheduledPost, index: number }) => (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify()} 
      exiting={FadeOutLeft}
      style={styles.postItem}
    >
      <View style={styles.postImageContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        <View style={styles.platformBadge}>
          {getPlatformIcon(item.platform)}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.postContent}>
        <Text style={styles.postCaption} numberOfLines={2}>{item.caption}</Text>
        
        <View style={styles.postFooter}>
          <View style={styles.scheduleInfo}>
            <Calendar size={14} {...{color: "#64748B"} as any} />
            <Text style={styles.scheduleText}>{item.scheduledDate}</Text>
            <Clock size={14} {...{color: "#64748B"} as any} style={styles.clockIcon} />
            <Text style={styles.scheduleText}>{item.scheduledTime}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditPost(item)}
            >
              <Edit2 size={16} {...{color: "#3B82F6"} as any} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeletePost(item)}
            >
              <Trash2 size={16} {...{color: "#EF4444"} as any} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => router.push(`/scheduled-post-details/${item.id}`)}
      >
        <ChevronRight size={20} {...{color: "#94A3B8"} as any} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予約投稿</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} {...{color: "#64748B"} as any} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <Animated.View 
          entering={FadeInRight.springify()}
          exiting={FadeOutLeft}
          style={styles.tabContainer}
        >
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
        </Animated.View>
      )}

      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>予約投稿がありません</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/create-scheduled-post')}
            >
              <Text style={styles.emptyButtonText}>新規投稿を作成</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-scheduled-post')}
      >
        <Plus size={20} {...{color: "#FFFFFF"} as any} />
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
    justifyContent: 'space-between',
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    padding: 16,
    paddingBottom: 100,
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  postImage: {
    width: 100,
    height: 100,
    backgroundColor: '#E2E8F0',
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  postContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  postCaption: {
    fontSize: 14,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  detailsButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});