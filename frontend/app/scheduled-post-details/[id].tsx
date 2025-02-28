import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Instagram, Twitter, Facebook, Snail as Snapchat, Edit2, Trash2, Share2, Users, CheckCircle, XCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// モックデータ: 予約投稿
const MOCK_SCHEDULED_POSTS: { [key: string]: any } = {
  '1': {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    caption: '新しいプロジェクトについて話し合う素晴らしいチームミーティングでした！ #チームワーク #プロジェクト',
    scheduledDate: '2025-06-20',
    scheduledTime: '18:30',
    platform: 'instagram',
    status: 'approved',
    owner: '田中 花子',
    permissions: [
      { email: 'hanako.tanaka@example.com', status: 'approved', name: '田中 花子' },
      { email: 'taro.sato@example.com', status: 'approved', name: '佐藤 太郎' }
    ],
    autoPost: true,
    createdAt: '2025-06-15 10:30'
  },
  '2': {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    caption: '今日のイベントで素晴らしい人たちと出会いました。ネットワーキングの大切さを実感！ #ビジネス #ネットワーキング',
    scheduledDate: '2025-06-22',
    scheduledTime: '12:00',
    platform: 'tiktok',
    status: 'pending',
    owner: '佐藤 太郎',
    permissions: [
      { email: 'ichiro.suzuki@example.com', status: 'pending', name: '鈴木 一郎' },
      { email: 'yuko.yamada@example.com', status: 'approved', name: '山田 優子' }
    ],
    autoPost: false,
    createdAt: '2025-06-16 14:45'
  },
  '3': {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    caption: '新しいオフィスでの初日！これからよろしくお願いします。 #新しい始まり #キャリア',
    scheduledDate: '2025-06-25',
    scheduledTime: '09:00',
    platform: 'facebook',
    status: 'approved',
    owner: '鈴木 一郎',
    permissions: [
      { email: 'makoto.takahashi@example.com', status: 'approved', name: '高橋 誠' }
    ],
    autoPost: true,
    createdAt: '2025-06-17 09:15'
  },
  '4': {
    id: '4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&q=80',
    caption: '週末のチームビルディング活動が楽しかった！素晴らしいチームに感謝。 #チームビルディング #週末',
    scheduledDate: '2025-06-30',
    scheduledTime: '20:15',
    platform: 'snapchat',
    status: 'pending',
    owner: '山田 優子',
    permissions: [
      { email: 'misaki.ito@example.com', status: 'pending', name: '伊藤 美咲' },
      { email: 'kenji.nakamura@example.com', status: 'denied', name: '中村 健二' }
    ],
    autoPost: true,
    createdAt: '2025-06-18 16:30'
  }
};

export default function ScheduledPostDetailsScreen() {
  const { id } = useLocalSearchParams();
  const post = MOCK_SCHEDULED_POSTS[id as string];
  
  const [showPermissions, setShowPermissions] = useState(false);
  
  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>投稿詳細</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>投稿が見つかりません</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={24} {...{color: "#E1306C"} as any} />;
      case 'twitter':
        return <Twitter size={24} {...{color: "#1DA1F2"} as any} />;
      case 'facebook':
        return <Facebook size={24} {...{color: "#1877F2"} as any} />;
      case 'snapchat':
        return <Snapchat size={24} {...{color: "#FFFC00"} as any} />;
      case 'tiktok':
        // TikTokのアイコンはLucideにないので、テキストで代用
        return <Text style={{fontSize: 20, fontWeight: 'bold', color: '#000000'}}>TikTok</Text>;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'snapchat':
        return 'Snapchat';
      case 'tiktok':
        return 'TikTok';
      default:
        return platform;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} {...{color: "#10B981"} as any} />;
      case 'pending':
        return <Clock size={16} {...{color: "#F59E0B"} as any} />;
      case 'denied':
        return <XCircle size={16} {...{color: "#EF4444"} as any} />;
      default:
        return null;
    }
  };

  const handleEditPost = () => {
    router.push(`/edit-scheduled-post/${post.id}`);
  };

  const handleDeletePost = () => {
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
            router.replace('/scheduled');
            Alert.alert('削除完了', '予約投稿が削除されました');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleSharePost = async () => {
    try {
      await Share.share({
        message: `${post.caption}\n\n${post.scheduledDate} ${post.scheduledTime}に${getPlatformName(post.platform)}に投稿予定`,
      });
    } catch (error) {
      Alert.alert('エラー', '共有できませんでした');
    }
  };

  const handleSendReminder = () => {
    const pendingPermissions = post.permissions.filter((p: any) => p.status === 'pending');
    if (pendingPermissions.length > 0) {
      Alert.alert(
        'リマインダーを送信',
        '承認待ちの人にリマインダーを送信しますか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel'
          },
          {
            text: '送信',
            onPress: () => {
              Alert.alert('送信完了', 'リマインダーが送信されました');
            }
          }
        ]
      );
    } else {
      Alert.alert('通知', '承認待ちの人はいません');
    }
  };

  const handleReportImage = () => {
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
          onPress: () => Alert.alert('報告を送信しました', '「自分ではない」という報告を受け付けました。確認後、対応いたします。')
        },
        {
          text: '不適切な内容',
          onPress: () => Alert.alert('報告を送信しました', '「不適切な内容」という報告を受け付けました。確認後、対応いたします。')
        }
      ]
    );
  };

  const canPost = post.status === 'approved' || (post.permissions.every((p: any) => p.status === 'approved') && post.status !== 'denied');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>投稿詳細</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleSharePost}>
          <Share2 size={20} {...{color: "#3B82F6"} as any} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={styles.image} />
          
          <View style={styles.platformBadge}>
            {getPlatformIcon(post.platform)}
          </View>
          
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportImage}
          >
            <AlertTriangle size={20} {...{color: "#FFFFFF"} as any} />
          </TouchableOpacity>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(post.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(post.status) }]}>
              {getStatusText(post.status)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Animated.View 
            entering={FadeIn}
            style={styles.section}
          >
            <Text style={styles.caption}>{post.caption}</Text>
            
            <View style={styles.scheduleInfo}>
              <View style={styles.scheduleItem}>
                <Calendar size={16} {...{color: "#64748B"} as any} />
                <Text style={styles.scheduleText}>{post.scheduledDate}</Text>
              </View>
              <View style={styles.scheduleItem}>
                <Clock size={16} {...{color: "#64748B"} as any} />
                <Text style={styles.scheduleText}>{post.scheduledTime}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>許可状況</Text>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setShowPermissions(!showPermissions)}
              >
                <Text style={styles.toggleButtonText}>
                  {showPermissions ? '閉じる' : '詳細を表示'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showPermissions ? (
              <View style={styles.permissionsList}>
                {post.permissions.map((permission: any, index: number) => (
                  <Animated.View 
                    key={permission.email}
                    entering={FadeInDown.delay(index * 100)}
                    style={styles.permissionItem}
                  >
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionName}>{permission.name}</Text>
                      <Text style={styles.permissionEmail}>{permission.email}</Text>
                    </View>
                    <View style={styles.permissionStatus}>
                      {getStatusIcon(permission.status)}
                      <Text style={[
                        styles.permissionStatusText,
                        { color: getStatusColor(permission.status) }
                      ]}>
                        {getStatusText(permission.status)}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
                
                {post.permissions.some((p: any) => p.status === 'pending') && (
                  <TouchableOpacity 
                    style={styles.reminderButton}
                    onPress={handleSendReminder}
                  >
                    <Text style={styles.reminderButtonText}>リマインダーを送信</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.permissionSummary}>
                <View style={styles.permissionCount}>
                  <View style={[styles.countBadge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.countText}>
                      {post.permissions.filter((p: any) => p.status === 'approved').length}
                    </Text>
                  </View>
                  <Text style={styles.countLabel}>承認済</Text>
                </View>
                
                <View style={styles.permissionCount}>
                  <View style={[styles.countBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.countText}>
                      {post.permissions.filter((p: any) => p.status === 'pending').length}
                    </Text>
                  </View>
                  <Text style={styles.countLabel}>承認待ち</Text>
                </View>
                
                <View style={styles.permissionCount}>
                  <View style={[styles.countBadge, { backgroundColor: '#EF4444' }]}>
                    <Text style={styles.countText}>
                      {post.permissions.filter((p: any) => p.status === 'denied').length}
                    </Text>
                  </View>
                  <Text style={styles.countLabel}>却下</Text>
                </View>
              </View>
            )}
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>投稿設定</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>プラットフォーム</Text>
              <View style={styles.settingValue}>
                {getPlatformIcon(post.platform)}
                <Text style={styles.settingText}>{getPlatformName(post.platform)}</Text>
              </View>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>自動投稿</Text>
              <Text style={styles.settingText}>{post.autoPost ? '有効' : '無効'}</Text>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>作成日時</Text>
              <Text style={styles.settingText}>{post.createdAt}</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300)}
            style={styles.actionButtons}
          >
            {canPost && (
              <TouchableOpacity
                style={styles.postNowButton}
                onPress={() => Alert.alert('確認', '今すぐ投稿しますか？', [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '投稿する', onPress: () => Alert.alert('投稿完了', '投稿が完了しました') }
                ])}
              >
                <Text style={styles.postNowButtonText}>今すぐ投稿</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditPost}
              >
                <Edit2 size={20} {...{color: "#3B82F6"} as any} />
                <Text style={styles.editButtonText}>編集</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeletePost}
              >
                <Trash2 size={20} {...{color: "#EF4444"} as any} />
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A'
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0'
  },
  platformBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  reportButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  detailsContainer: {
    padding: 20
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  caption: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 16
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A'
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 20
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6'
  },
  permissionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8
  },
  permissionCount: {
    alignItems: 'center'
  },
  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B'
  },
  permissionsList: {
    marginTop: 8
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  permissionInfo: {
    flex: 1
  },
  permissionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2
  },
  permissionEmail: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B'
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8
  },
  permissionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  reminderButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 16
  },
  reminderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B'
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 8
  },
  actionButtons: {
    marginTop: 8
  },
  postNowButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  postNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0F172A',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});