import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  Upload,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  Instagram,
  Twitter,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// モックデータ: 予約投稿
const MOCK_SCHEDULED_POSTS = {
  '1': {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    caption:
      '新しいプロジェクトについて話し合う素晴らしいチームミーティングでした！ #チームワーク #プロジェクト',
    scheduledDate: '2025-06-20',
    scheduledTime: '18:30',
    platform: 'instagram',
    status: 'approved',
    owner: '田中 花子',
    requirePermission: true,
    permissionEmails: 'manager@example.com',
    autoPost: true,
  },
  '2': {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    caption:
      '今日のイベントで素晴らしい人たちと出会いました。ネットワーキングの大切さを実感！ #ビジネス #ネットワーキング',
    scheduledDate: '2025-06-22',
    scheduledTime: '12:00',
    platform: 'twitter',
    status: 'pending',
    owner: '佐藤 太郎',
    requirePermission: true,
    permissionEmails: 'team@example.com',
    autoPost: false,
  },
};

// プラットフォームのオプション
const PLATFORMS = ['instagram', 'twitter'];

export default function EditScheduledPostScreen() {
  const { id } = useLocalSearchParams();
  const postData = MOCK_SCHEDULED_POSTS[id as string];

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  // 日付と時間の選択
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 許可申請関連
  const [requirePermission, setRequirePermission] = useState(true);
  const [permissionEmails, setPermissionEmails] = useState('');

  // 自動投稿設定
  const [autoPost, setAutoPost] = useState(true);

  useEffect(() => {
    if (postData) {
      setImageUrl(postData.image);
      setCaption(postData.caption);
      setPlatform(postData.platform);

      // 日付と時間を設定
      const dateObj = new Date();
      const [year, month, day] = postData.scheduledDate.split('-').map(Number);
      const [hours, minutes] = postData.scheduledTime.split(':').map(Number);
      dateObj.setFullYear(year, month - 1, day);
      dateObj.setHours(hours, minutes);
      setDate(dateObj);

      setRequirePermission(postData.requirePermission);
      setPermissionEmails(postData.permissionEmails);
      setAutoPost(postData.autoPost);
    }
  }, [postData]);

  if (!postData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>予約投稿の編集</Text>
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

  const handleSubmit = () => {
    // 入力検証
    if (!imageUrl) {
      Alert.alert('エラー', '画像を選択してください');
      return;
    }

    if (!caption) {
      Alert.alert('エラー', 'キャプションを入力してください');
      return;
    }

    if (!platform) {
      Alert.alert('エラー', 'プラットフォームを選択してください');
      return;
    }

    if (requirePermission && !permissionEmails) {
      Alert.alert(
        'エラー',
        '許可を求める相手のメールアドレスを入力してください'
      );
      return;
    }

    // 予約投稿を更新
    Alert.alert('予約投稿を更新', '予約投稿が更新されました', [
      {
        text: 'OK',
        onPress: () => router.replace('/scheduled-posts'),
      },
    ]);
  };

  const takePicture = () => {
    // 実際のアプリではカメラAPIを使用
    // ここではサンプル画像を設定
    setImageUrl(
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80'
    );
    Alert.alert('写真を撮影しました', '人物の写真が正常に撮影されました。');
  };

  const uploadImage = () => {
    // 実際のアプリではファイル選択APIを使用
    // ここではサンプル画像を設定
    setImageUrl(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80'
    );
    Alert.alert(
      '画像をアップロードしました',
      '人物の写真が正常にアップロードされました。'
    );
  };

  const selectPlatform = (selectedPlatform) => {
    setPlatform(selectedPlatform);
    setShowPlatformDropdown(false);
  };

  const getPlatformIcon = (platformName) => {
    switch (platformName) {
      case 'instagram':
        return <Instagram size={20} color="#E1306C" />;
      case 'twitter':
        return <Twitter size={20} color="#1DA1F2" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platformName) => {
    switch (platformName) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      default:
        return platformName;
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentTime);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>予約投稿の編集</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 画像アップロードセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>画像</Text>

          {imageUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setImageUrl('')}
              >
                <Text style={styles.changeImageText}>画像を変更</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={takePicture}
              >
                <Camera size={24} color="#3B82F6" />
                <Text style={styles.uploadOptionText}>写真を撮影</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={uploadImage}
              >
                <Upload size={24} color="#3B82F6" />
                <Text style={styles.uploadOptionText}>画像をアップロード</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
