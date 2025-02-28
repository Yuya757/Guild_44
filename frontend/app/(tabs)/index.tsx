import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Filter, TriangleAlert as AlertTriangle, Calendar, Clock, Instagram, Twitter, Facebook, Snail as Snapchat } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Define types for your data
type StatusType = 'approved' | 'pending' | 'denied' | string;

type RequestItem = {
  id: string;
  image: string;
  title: string;
  owner: string;
  purpose?: string;
  date: string;
  status: StatusType;
  platform?: string;
  isMyRequest: boolean;
  deadline: string;
};

type ScheduledPostItem = {
  id: string;
  image: string;
  caption: string;
  scheduledDate: string;
  scheduledTime: string;
  platform: string;
  status: StatusType;
};

// 人物写真のモックデータ
const MOCK_REQUESTS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    title: '友達との旅行写真',
    owner: '田中 花子',
    status: 'approved',
    date: '2025-06-15',
    platform: 'instagram',
    isMyRequest: false,
    deadline: '2025-07-15'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    title: '誕生日パーティー',
    owner: '佐藤 太郎',
    status: 'pending',
    date: '2025-06-18',
    platform: 'twitter',
    isMyRequest: false,
    deadline: '2025-07-18'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    title: '同窓会グループ写真',
    owner: '鈴木 一郎',
    status: 'denied',
    date: '2025-06-10',
    platform: 'facebook',
    isMyRequest: true,
    deadline: '2025-07-10'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&q=80',
    title: '家族写真',
    owner: '山田 優子',
    status: 'approved',
    date: '2025-06-05',
    platform: 'snapchat',
    isMyRequest: true,
    deadline: '2025-07-05'
  },
];

// 予約投稿のモックデータ
const MOCK_SCHEDULED_POSTS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    caption: '素敵な思い出の旅行！友達と最高の時間を過ごしました #旅行 #友情',
    scheduledDate: '2025-06-20',
    scheduledTime: '18:30',
    platform: 'instagram',
    status: 'approved',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    caption: '今日は誕生日パーティーで友達がサプライズしてくれました！ #誕生日 #サプライズ',
    scheduledDate: '2025-06-22',
    scheduledTime: '12:00',
    platform: 'tiktok',
    status: 'pending',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    caption: '同窓会で懐かしい友達と再会！みんな元気そうで良かった #同窓会 #旧友',
    scheduledDate: '2025-06-25',
    scheduledTime: '09:00',
    platform: 'facebook',
    status: 'approved',
  },
];

export default function HomeScreen() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [scheduledPosts, setScheduledPosts] = useState(MOCK_SCHEDULED_POSTS);

  const getPlatformIcon = (platform: any) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={16} {...{color: "#E1306C"} as any} />;
      case 'twitter':
        return <Twitter size={16} {...{color: "#1DA1F2"} as any} />;
      case 'facebook':
        return <Facebook size={16} {...{color: "#1877F2"} as any} />;
      case 'snapchat':
        return <Snapchat size={16} {...{color: "#FFFC00"} as any} />;
      case 'tiktok':
        // TikTokのアイコンはLucideにないので、テキストで代用
        return <Text style={{fontSize: 12, fontWeight: 'bold', color: '#000000'}}>TT</Text>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: any) => {
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

  const getStatusText = (status: StatusType): string => {
    switch (status) {
      case 'approved':
        return '承認済';
      case 'pending':
        return '審査中';
      case 'denied':
        return '却下';
      default:
        return status;
    }
  };

  const handleReportImage = (item: RequestItem) => {
    Alert.alert(
      '写真の報告',
      'この写真に関する問題を報告しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '自分ではない',
          onPress: () => reportNotMe(item)
        },
        {
          text: '不適切な内容',
          onPress: () => reportInappropriate(item)
        }
      ]
    );
  };

  const reportNotMe = (item: RequestItem) => {
    Alert.alert(
      '報告を送信しました',
      '「自分ではない」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  const reportInappropriate = (item: RequestItem) => {
    Alert.alert(
      '報告を送信しました',
      '「不適切な内容」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  const renderRequestItem = ({ item, index }: { item: RequestItem; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      style={styles.requestItem}
    >
      <TouchableOpacity
        style={styles.requestItemContent}
        onPress={() => router.push(`/request-details/${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.requestImage}
          />
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => handleReportImage(item)}
          >
            <AlertTriangle size={16} {...{color: "#FFFFFF"} as any} />
          </TouchableOpacity>
          <View style={styles.platformBadge}>
            {getPlatformIcon(item.platform)}
          </View>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.requestTypeContainer}>
            <Text style={[styles.requestType, { color: item.isMyRequest ? '#3B82F6' : '#10B981' }]}>
              {item.isMyRequest ? '自分の申請' : '承認依頼'}
            </Text>
          </View>
          <Text style={styles.requestOwner} numberOfLines={1}>
            {item.owner}
          </Text>
          <View style={styles.requestMeta}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            <Text style={styles.requestDate}>{item.date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderScheduledPostItem = ({ item, index }: { item: ScheduledPostItem; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      style={styles.scheduledPostItem}
    >
      <TouchableOpacity
        style={styles.scheduledPostContent}
        onPress={() => router.push(`/scheduled-post-details/${item.id}`)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.scheduledPostImage}
        />
        <View style={styles.scheduledPostOverlay}>
          <View style={styles.scheduledPostPlatform}>
            {getPlatformIcon(item.platform)}
          </View>
          <View style={[styles.scheduledPostStatus, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.scheduledPostStatusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <View style={styles.scheduledPostInfo}>
          <Text style={styles.scheduledPostCaption} numberOfLines={2}>
            {item.caption}
          </Text>
          <View style={styles.scheduledPostMeta}>
            <View style={styles.scheduledPostDate}>
              <Calendar size={12} {...{color: "#64748B"} as any} />
              <Text style={styles.scheduledPostDateText}>{item.scheduledDate}</Text>
            </View>
            <View style={styles.scheduledPostTime}>
              <Clock size={12} {...{color: "#64748B"} as any} />
              <Text style={styles.scheduledPostTimeText}>{item.scheduledTime}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ホーム</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} {...{color: "#64748B"} as any} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => router.push('/create-scheduled-post')}
        >
          <Plus size={20} {...{color: "#FFFFFF"} as any} />
          <Text style={styles.requestButtonText}>新規予約投稿を作成</Text>
        </TouchableOpacity>

        <View style={styles.scheduledContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>予約投稿</Text>
            <TouchableOpacity onPress={() => router.push('/scheduled')}>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={scheduledPosts}
            renderItem={renderScheduledPostItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scheduledPostsList}
            ListEmptyComponent={
              <View style={styles.emptyScheduledContainer}>
                <Text style={styles.emptyText}>予約投稿がありません</Text>
              </View>
            }
          />
        </View>

        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近の申請</Text>
            <TouchableOpacity onPress={() => router.push('/permission-requests' as any)}>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={requests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.requestsList}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  scheduledContainer: {
    marginBottom: 24,
  },
  scheduledPostsList: {
    paddingRight: 20,
  },
  scheduledPostItem: {
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduledPostContent: {
    flex: 1,
  },
  scheduledPostImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E2E8F0',
  },
  scheduledPostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  scheduledPostPlatform: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduledPostStatus: {
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
  scheduledPostStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  scheduledPostInfo: {
    padding: 12,
  },
  scheduledPostCaption: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  scheduledPostMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduledPostDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduledPostDateText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginLeft: 4,
  },
  scheduledPostTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduledPostTimeText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginLeft: 4,
  },
  emptyScheduledContainer: {
    width: width * 0.7,
    height: 150,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  recentContainer: {
    flex: 1,
    marginBottom: 40,
  },
  requestsList: {
    paddingBottom: 20,
  },
  requestItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestItemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  requestImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  reportButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  requestOwner: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  requestDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    marginLeft: 'auto',
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 12,
    fontWeight: '500',
  },
});