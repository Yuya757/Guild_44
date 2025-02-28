import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Instagram, Twitter, Check, X } from 'lucide-react-native';

// モックデータ: 許可リクエスト
const MOCK_PERMISSION_REQUESTS = {
  '1': {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    caption: '新しいプロジェクトについて話し合う素晴らしいチームミーティングでした！ #チームワーク #プロジェクト',
    scheduledDate: '2025-06-20',
    scheduledTime: '18:30',
    platform: 'instagram',
    status: 'pending',
    requester: '田中 花子',
    requesterEmail: 'hanako.tanaka@example.com',
  },
  '2': {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    caption: '今日のイベントで素晴らしい人たちと出会いました。ネットワーキングの大切さを実感！ #ビジネス #ネットワーキング',
    scheduledDate: '2025-06-22',
    scheduledTime: '12:00',
    platform: 'twitter',
    status: 'pending',
    requester: '佐藤 太郎',
    requesterEmail: 'taro.sato@example.com',
  },
};

export default function PermissionRequestScreen() {
  const { id } = useLocalSearchParams();
  const request = MOCK_PERMISSION_REQUESTS[id as string];
  
  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>許可リクエスト</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>リクエストが見つかりません</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={24} color="#E1306C" />;
      case 'twitter':
        return <Twitter size={24} color="#1DA1F2" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      default:
        return platform;
    }
  };

  const handleApprove = () => {
    Alert.alert(
      '許可を承認',
      'この投稿の使用を許可しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '承認する',
          onPress: () => {
            Alert.alert('承認完了', '投稿が承認されました。リクエスト者に通知されます。');
            router.back();
          }
        }
      ]
    );
  };

  const handleDeny = () => {
    Alert.alert(
      '許可を却下',
      'この投稿の使用を却下しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '却下する',
          onPress: () => {
            Alert.alert('却下完了', '投稿が却下されました。リクエスト者に通知されます。');
            router.back();
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>許可リクエスト</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: request.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.detailsContainer}>
          <View style={styles.platformContainer}>
            {getPlatformIcon(request.platform)}
            <Text style={styles.platformText}>{getPlatformName(request.platform)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>キャプション</Text>
            <Text style={styles.captionText}>{request.caption}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>投稿予定日時</Text>
            <View style={styles.scheduleInfo}>
              <View style={styles.scheduleItem}>
                <Calendar size={16} color="#64748B" />
                <Text style={styles.scheduleText}>{request.scheduledDate}</Text>
              </View>
              <View style={styles.scheduleItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.scheduleText}>{request.scheduledTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>リクエスト者情報</Text>
            <View style={styles.requesterInfo}>
              <Text style={styles.infoLabel}>名前:</Text>
              <Text style={styles.infoValue}>{request.requester}</Text>
            </View>
            <View style={styles.requesterInfo}>
              <Text style={styles.infoLabel}>メール:</Text>
              <Text style={styles.infoValue}>{request.requesterEmail}</Text>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              この投稿を承認すると、リクエスト者はあなたの画像を上記のプラットフォームに投稿することができます。
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.denyButton}
              onPress={handleDeny}
            >
              <X size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>却下する</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>承認する</Text>
            </TouchableOpacity>
          </View>
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
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#E2E8F0',
  },
  detailsContainer: {
    padding: 20,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  platformText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 12,
  },
  captionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 24,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  scheduleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    marginLeft: 8,
  },
  requesterInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  noteContainer: {
    backgroundColor: '#FEF9C3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#854D0E',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  denyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});