import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, Share } from 'react-native';
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
  deadline: string;
  isMyRequest: boolean;
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
    title: '友達との旅行写真',
    owner: '田中 花子',
    ownerEmail: 'hanako.tanaka@example.com',
    status: 'approved',
    date: '2025-06-15',
    projectName: '個人アルバム',
    usagePurpose: 'SNS投稿',
    usageDescription: 'この写真を友達と一緒にInstagramに投稿したいです。',
    usageDuration: '無期限',
    approvalDate: '2025-06-18',
    notes: 'ありがとう！大切な思い出の写真です。',
    deadline: '2025-07-15',
    isMyRequest: false,
  },
  '2': {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    title: '誕生日パーティー',
    owner: '佐藤 太郎',
    ownerEmail: 'taro.sato@example.com',
    status: 'pending',
    date: '2025-06-18',
    projectName: '誕生日の記念',
    usagePurpose: 'SNS投稿',
    usageDescription: '友達の誕生日パーティーの様子をSNSで共有したいです。',
    usageDuration: '無期限',
    deadline: '2025-07-18',
    isMyRequest: false,
  },
  '3': {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    title: '同窓会グループ写真',
    owner: '鈴木 一郎',
    ownerEmail: 'ichiro.suzuki@example.com',
    status: 'denied',
    date: '2025-06-10',
    projectName: '同窓会記念',
    usagePurpose: 'SNS投稿',
    usageDescription: '同窓会で撮影したグループ写真をSNSで共有したかったです。',
    usageDuration: '無期限',
    denialReason: 'すみませんが、この写真は他の参加者からの許可が得られていないため、共有できません。',
    denialDate: '2025-06-12',
    deadline: '2025-07-10',
    isMyRequest: true,
  },
  '4': {
    id: '4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&q=80',
    title: '家族写真',
    owner: '山田 優子',
    ownerEmail: 'yuko.yamada@example.com',
    status: 'approved',
    date: '2025-06-05',
    projectName: '家族アルバム',
    usagePurpose: '個人利用',
    usageDescription: '家族の記念写真として保存し、共有したいです。',
    usageDuration: '無期限',
    approvalDate: '2025-06-08',
    notes: '素敵な家族写真をありがとう！',
    deadline: '2025-07-05',
    isMyRequest: true,
  },
};

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [localRequest, setLocalRequest] = useState<Request | null>(null);
  
  // IDに基づいてリクエストの詳細を取得
  const requestFromMock = MOCK_REQUESTS[id as keyof typeof MOCK_REQUESTS];
  
  // localRequestが初期化されていない場合は、モックデータから設定
  if (!localRequest && requestFromMock) {
    setLocalRequest(requestFromMock);
  }
  
  // localRequestが存在しない場合は、モックデータも存在しないため、「見つかりません」を表示
  if (!localRequest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
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

  // 共有機能
  const handleShare = async () => {
    try {
      await Share.share({
        message: `申請詳細: ${localRequest.title} - ${localRequest.owner}からの申請です。`,
      });
    } catch (error) {
      Alert.alert('共有エラー', '共有中にエラーが発生しました。');
    }
  };

  // 期限切れかどうかをチェック
  const isDeadlinePassed = () => {
    const today = new Date();
    const deadline = new Date(localRequest.deadline);
    return today > deadline;
  };

  // ステータス変更が可能かどうか
  const canChangeStatus = () => {
    return !isDeadlinePassed() && localRequest.status !== 'approved';
  };

  // ステータスを変更する
  const handleChangeStatus = (newStatus: 'approved' | 'denied') => {
    if (!canChangeStatus()) {
      Alert.alert(
        'ステータス変更不可',
        '期限が過ぎているため、ステータスを変更できません。',
        [{ text: 'OK' }]
      );
      return;
    }

    // 確認ダイアログを表示
    Alert.alert(
      'ステータス変更',
      `申請を${newStatus === 'approved' ? '承認' : '却下'}しますか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '変更する',
          onPress: () => {
            // ステータスに応じて必要なプロパティを追加
            const today = new Date().toISOString().split('T')[0];
            let updatedRequest: Request;
            
            if (newStatus === 'approved') {
              updatedRequest = {
                ...localRequest,
                status: 'approved',
                approvalDate: today,
                notes: ''
              } as ApprovedRequest;
            } else {
              updatedRequest = {
                ...localRequest,
                status: 'denied',
                denialDate: today,
                denialReason: '申請が却下されました。'
              } as DeniedRequest;
            }
            
            setLocalRequest(updatedRequest);
            
            Alert.alert(
              'ステータス変更完了',
              `申請を${newStatus === 'approved' ? '承認' : '却下'}しました。`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>申請詳細</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={20} {...{color: "#FFFFFF"} as any} />
          <Text style={styles.shareButtonText}>共有</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: localRequest.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportImage}
          >
            <AlertTriangle size={20} {...{color: "#FFFFFF"} as any} />
          </TouchableOpacity>
          
          {/* 写真編集ボタン */}
          <TouchableOpacity 
            style={styles.editPhotoButton}
            onPress={() => router.push({
              pathname: '/photo-editor',
              params: { imageUri: localRequest.image }
            })}
          >
            <Text style={styles.editPhotoButtonText}>顔を隠す</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{localRequest.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(localRequest.status) + '20' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(localRequest.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(localRequest.status) },
                ]}
              >
                {getStatusText(localRequest.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} {...{color: "#64748B"} as any} />
              <Text style={styles.infoText}>申請日: {localRequest.date}</Text>
            </View>
            {localRequest.status === 'approved' && (
              <View style={styles.infoItem}>
                <Clock size={16} {...{color: "#64748B"} as any} />
                <Text style={styles.infoText}>承認日: {(localRequest as ApprovedRequest).approvalDate}</Text>
              </View>
            )}
            {localRequest.status === 'denied' && (
              <View style={styles.infoItem}>
                <Clock size={16} {...{color: "#64748B"} as any} />
                <Text style={styles.infoText}>却下日: {(localRequest as DeniedRequest).denialDate}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Calendar size={16} {...{color: "#64748B"} as any} />
              <Text style={styles.infoText}>期限: {localRequest.deadline}</Text>
            </View>
          </View>

          {/* ステータス変更ボタン（期限内のみ表示） */}
          {canChangeStatus() && !localRequest.isMyRequest && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.denyButton]}
                onPress={() => handleChangeStatus('denied')}
              >
                <Text style={styles.actionButtonText}>却下する</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleChangeStatus('approved')}
              >
                <Text style={styles.actionButtonText}>承認する</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>所有者情報</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>名前</Text>
              <Text style={styles.sectionItemText}>{localRequest.owner}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>メールアドレス</Text>
              <Text style={styles.sectionItemText}>{localRequest.ownerEmail}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>使用詳細</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>プロジェクト/キャンペーン</Text>
              <Text style={styles.sectionItemText}>{localRequest.projectName}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>使用目的 </Text>
              <Text style={styles.sectionItemText}>{localRequest.usagePurpose}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>説明</Text>
              <Text style={styles.sectionItemText}>{localRequest.usageDescription}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>使用期間</Text>
              <Text style={styles.sectionItemText}>{localRequest.usageDuration}</Text>
            </View>
          </View>

          {localRequest.status === 'approved' && (localRequest as ApprovedRequest).notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>所有者からのメモ</Text> <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{(localRequest as ApprovedRequest).notes}</Text>
              </View>
            </View>
          )}

          {localRequest.status === 'denied' && (localRequest as DeniedRequest).denialReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>却下理由</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{(localRequest as DeniedRequest).denialReason}</Text>
              </View>
            </View>
          )}

          {localRequest.status === 'pending' && (
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
                  <MessageCircle size={20} {...{color: "#FFFFFF"} as any} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {localRequest.status === 'approved' && (
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} {...{color: "#FFFFFF"} as any} />
              <Text style={styles.downloadButtonText}>画像をダウンロード</Text>
            </TouchableOpacity>
          )}

          {localRequest.status === 'denied' && (
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
    fontWeight: '600',
    color: '#0F172A',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    width: 70,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '400',
    color: '#64748B',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionContent: {
    marginBottom: 12,
  },
  sectionItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  sectionItemText: {
    fontSize: 16,
    fontWeight: '400',
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
    fontWeight: '400',
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
    fontWeight: '400',
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
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  denyButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editPhotoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});