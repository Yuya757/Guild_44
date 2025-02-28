import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Download, Share2, MessageCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';

// Define base request interface and specific status interfaces
interface BaseRequest {
  id: string;
  image: string;
  title: string;
  owner: string;
  ownerEmail: string;
  status: 'approved' | 'pending' | 'denied';
  date: string;
  projectName: string;
  usagePurpose: string;
  usageDescription: string;
  usageDuration: string;
}

interface ApprovedRequest extends BaseRequest {
  status: 'approved';
  approvalDate: string;
  notes: string;
}

interface PendingRequest extends BaseRequest {
  status: 'pending';
}

interface DeniedRequest extends BaseRequest {
  status: 'denied';
  denialReason: string;
  denialDate: string;
}

type Request = ApprovedRequest | PendingRequest | DeniedRequest;

// 人物写真のモックデータ
const MOCK_REQUESTS: Record<string, Request> = {
  '1': {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    title: '社員プロフィール写真',
    owner: '田中 花子',
    ownerEmail: 'hanako.tanaka@example.com',
    status: 'approved',
    date: '2023-10-15',
    projectName: '夏季マーケティングキャンペーン',
    usagePurpose: 'ウェブサイト',
    usageDescription: 'この画像は、新しいアウトドアアドベンチャーパッケージを宣伝するために、ウェブサイトのホームページのヒーローバナーとして使用されます。',
    usageDuration: '6ヶ月',
    approvalDate: '2023-10-18',
    notes: 'ウェブサイトのフッターに写真家のクレジットを記載してください。',
  },
  '2': {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    title: 'マーケティング素材',
    owner: '佐藤 太郎',
    ownerEmail: 'taro.sato@example.com',
    status: 'pending',
    date: '2023-10-18',
    projectName: 'アーバンリビングブログ',
    usagePurpose: 'ブログ記事',
    usageDescription: 'この画像は、都市建築と都市計画に関するブログ記事のイラストとして使用されます。',
    usageDuration: '1年',
  },
  '3': {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    title: 'イベント写真',
    owner: '鈴木 一郎',
    ownerEmail: 'ichiro.suzuki@example.com',
    status: 'denied',
    date: '2023-10-10',
    projectName: '旅行パンフレット',
    usagePurpose: '印刷物',
    usageDescription: 'この画像は、ビーチリゾートを紹介する旅行パンフレットに使用される予定でした。',
    usageDuration: '3ヶ月',
    denialReason: 'この画像は既に別の会社に独占的にライセンスされています。',
    denialDate: '2023-10-12',
  },
};

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  
  // IDに基づいてリクエストの詳細を取得
  const request = MOCK_REQUESTS[id as keyof typeof MOCK_REQUESTS];
  
  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>申請詳細</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>申請が見つかりません</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        return '審査中';
      case 'denied':
        return '却下';
      default:
        return status;
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
          onPress: () => reportNotMe()
        },
        {
          text: '不適切な内容',
          onPress: () => reportInappropriate()
        }
      ]
    );
  };

  const reportNotMe = () => {
    Alert.alert(
      '報告を送信しました',
      '「自分ではない」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  const reportInappropriate = () => {
    Alert.alert(
      '報告を送信しました',
      '「不適切な内容」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>申請詳細</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: request.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportImage}
          >
            <AlertTriangle size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{request.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + '20' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(request.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} color="#64748B" />
              <Text style={styles.infoText}>申請日: {request.date}</Text>
            </View>
            {request.status === 'approved' && (
              <View style={styles.infoItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.infoText}>承認日: {(request as ApprovedRequest).approvalDate}</Text>
              </View>
            )}
            {request.status === 'denied' && (
              <View style={styles.infoItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.infoText}>却下日: {(request as DeniedRequest).denialDate}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>所有者情報</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>名前</Text>
              <Text style={styles.sectionItemText}>{request.owner}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>メールアドレス</Text>
              <Text style={styles.sectionItemText}>{request.ownerEmail}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>使用詳細</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>プロジェクト/キャンペーン</Text>
              <Text style={styles.sectionItemText}>{request.projectName}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>使用目的 </Text>
              <Text style={styles.sectionItemText}>{request.usagePurpose}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>説明</Text>
              <Text style={styles.sectionItemText}>{request.usageDescription}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>使用期間</Text>
              <Text style={styles.sectionItemText}>{request.usageDuration}</Text>
            </View>
          </View>

          {request.status === 'approved' && (request as ApprovedRequest).notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>所有者からのメモ</Text> <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{(request as ApprovedRequest).notes}</Text>
              </View>
            </View>
          )}

          {request.status === 'denied' && (request as DeniedRequest).denialReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>却下理由</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{(request as DeniedRequest).denialReason}</Text>
              </View>
            </View>
          )}

          {request.status === 'pending' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>メッセージを送信</Text>
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="メッセージや追加情報を入力してください..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton}>
                  <MessageCircle size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {request.status === 'approved' && (
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>画像をダウンロード</Text>
            </TouchableOpacity>
          )}

          {request.status === 'denied' && (
            <TouchableOpacity
              style={styles.newRequestButton}
              onPress={() => router.push('/new-request')}
            >
              <Text style={styles.newRequestButtonText}>新しい申請を作成</Text>
            </TouchableOpacity>
          )}
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
  },
  reportButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 6,
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
  sectionContent: {
    marginBottom: 12,
  },
  sectionItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  sectionItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 24,
  },
  notesContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 24,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  newRequestButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newRequestButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});