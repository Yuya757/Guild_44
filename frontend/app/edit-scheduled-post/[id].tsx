import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
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
  Users,
} from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Define types
type PlatformType = 'instagram' | 'twitter' | string;
type StatusType = 'approved' | 'pending' | 'denied' | string;

// Contact type for facial recognition results
type ContactType = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type ScheduledPost = {
  id: string;
  image: string;
  caption: string;
  scheduledDate: string;
  scheduledTime: string;
  platform: PlatformType;
  status: StatusType;
  owner: string;
  requirePermission: boolean;
  permissionEmails: string;
  autoPost: boolean;
};

type ScheduledPosts = {
  [key: string]: ScheduledPost;
};

// Sample contacts - in a real app, these would come from the user's contacts list
const SAMPLE_CONTACTS: ContactType[] = [
  {
    id: '1',
    name: '佐藤 健太',
    email: 'kenta.sato@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: '鈴木 美咲',
    email: 'misaki.suzuki@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: '田中 大輔',
    email: 'daisuke.tanaka@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
  },
  {
    id: '4',
    name: '山田 花子',
    email: 'hanako.yamada@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
  },
];

// モック予約投稿データ
const MOCK_SCHEDULED_POSTS: ScheduledPosts = {
  '1': {
    id: '1',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    caption: '今日は友達と素敵な時間を過ごしました！',
    scheduledDate: '2023-06-15',
    scheduledTime: '18:30',
    platform: 'instagram',
    status: 'pending',
    owner: '佐藤 太郎',
    requirePermission: true,
    permissionEmails: 'friend@example.com',
    autoPost: true,
  },
  '2': {
    id: '2',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    caption: '新しいプロジェクトが始まりました！',
    scheduledDate: '2023-06-20',
    scheduledTime: '12:00',
    platform: 'twitter',
    status: 'approved',
    owner: '佐藤 太郎',
    requirePermission: false,
    permissionEmails: '',
    autoPost: true,
  },
};

// プラットフォームのオプション
const PLATFORMS: PlatformType[] = ['instagram', 'twitter'];

export default function EditScheduledPostScreen() {
  const { id } = useLocalSearchParams();
  const postData = MOCK_SCHEDULED_POSTS[id as string];

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  // 日付と時間の選択
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 許可申請関連
  const [requirePermission, setRequirePermission] = useState(true);
  const [permissionEmails, setPermissionEmails] = useState('');

  // 顔認識関連
  const [recognizingFace, setRecognizingFace] = useState(false);
  const [suggestedContacts, setSuggestedContacts] = useState<ContactType[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactType[]>([]);

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

  // When selected contacts change, update the permission emails
  useEffect(() => {
    if (selectedContacts.length > 0) {
      setPermissionEmails(selectedContacts.map(contact => contact.email).join(', '));
    }
  }, [selectedContacts]);

  if (!postData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>予約投稿の編集</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 20, color: '#666' }}>投稿が見つかりません</Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#007AFF', 
              paddingVertical: 12, 
              paddingHorizontal: 20, 
              borderRadius: 8 
            }} 
            onPress={() => router.back()}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>戻る</Text>
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

  // 顔認識処理を行う関数
  const performFacialRecognition = (imageUri: string) => {
    // 実際のアプリでは、AIやML APIを使用して顔認識を行う
    // ここではモック処理としてタイマーとサンプルデータを使用
    setRecognizingFace(true);
    
    // 顔認識の処理時間をシミュレート（2秒）
    setTimeout(() => {
      // ランダムにサンプルコンタクトから2-3人を選択
      const numContacts = Math.floor(Math.random() * 2) + 2; // 2〜3人
      const shuffled = [...SAMPLE_CONTACTS].sort(() => 0.5 - Math.random());
      const recognized = shuffled.slice(0, numContacts);
      
      setSuggestedContacts(recognized);
      setRecognizingFace(false);
      
      Alert.alert(
        '顔認識完了',
        `画像から${recognized.length}人の連絡先が見つかりました。`
      );
    }, 2000);
  };

  const takePicture = () => {
    // 実際のアプリではカメラAPIを使用
    // ここではサンプル画像を設定
    const imageUri = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80';
    setImageUrl(imageUri);
    
    // 顔認識を実行
    performFacialRecognition(imageUri);
    
    Alert.alert('写真を撮影しました', '人物の写真が正常に撮影されました。顔認識を実行中...');
  };

  const uploadImage = () => {
    // 実際のアプリではファイル選択APIを使用
    // ここではサンプル画像を設定
    const imageUri = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80';
    setImageUrl(imageUri);
    
    // 顔認識を実行
    performFacialRecognition(imageUri);
    
    Alert.alert(
      '画像をアップロードしました',
      '人物の写真が正常にアップロードされました。顔認識を実行中...'
    );
  };

  const toggleContactSelection = (contact: ContactType) => {
    if (selectedContacts.some(c => c.id === contact.id)) {
      // すでに選択されている場合、選択解除
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      // 選択されていない場合、選択に追加
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const selectPlatform = (selectedPlatform: PlatformType) => {
    setPlatform(selectedPlatform);
    setShowPlatformDropdown(false);
  };

  const getPlatformIcon = (platformName: PlatformType) => {
    switch (platformName) {
      case 'instagram':
        return <Instagram size={20} color="#E1306C" />;
      case 'twitter':
        return <Twitter size={20} color="#1DA1F2" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platformName: PlatformType) => {
    switch (platformName) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      default:
        return platformName;
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentTime);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
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

        {/* キャプション入力セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>キャプション</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="投稿のキャプションを入力してください..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={caption}
            onChangeText={setCaption}
          />
        </View>

        {/* プラットフォーム選択セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プラットフォーム</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPlatformDropdown(!showPlatformDropdown)}
          >
            <View style={styles.platformSelector}>
              {platform ? (
                <>
                  {getPlatformIcon(platform)}
                  <Text style={styles.dropdownButtonText}>
                    {getPlatformName(platform)}
                  </Text>
                </>
              ) : (
                <Text style={styles.dropdownPlaceholder}>
                  プラットフォームを選択
                </Text>
              )}
            </View>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showPlatformDropdown && (
            <View style={styles.dropdownMenu}>
              {PLATFORMS.map((platformOption) => (
                <TouchableOpacity
                  key={platformOption}
                  style={styles.dropdownItem}
                  onPress={() => selectPlatform(platformOption)}
                >
                  <View style={styles.platformOption}>
                    {getPlatformIcon(platformOption)}
                    <Text style={styles.dropdownItemText}>
                      {getPlatformName(platformOption)}
                    </Text>
                  </View>
                  {platformOption === platform && (
                    <Check size={16} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 日付と時間の選択セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>投稿日時</Text>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#64748B" />
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color="#64748B" />
              <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* 許可設定セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>許可設定</Text>
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>投稿前に許可を求める</Text>
              <Text style={styles.switchDescription}>
                写真に写っている人に投稿の許可を求めます
              </Text>
            </View>
            <Switch
              value={requirePermission}
              onValueChange={setRequirePermission}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={requirePermission ? '#3B82F6' : '#F1F5F9'}
            />
          </View>

          {requirePermission && (
            <View style={styles.permissionContainer}>
              <View style={styles.permissionHeader}>
                <Users size={20} color="#3B82F6" />
                <Text style={styles.permissionTitle}>許可を求める相手</Text>
              </View>

              {recognizingFace ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>顔認識処理中...</Text>
                </View>
              ) : (
                <>
                  {suggestedContacts.length > 0 && (
                    <View style={styles.suggestedContactsContainer}>
                      <Text style={styles.suggestedContactsTitle}>画像から検出された連絡先:</Text>
                      
                      {suggestedContacts.map((contact) => (
                        <TouchableOpacity
                          key={contact.id}
                          style={[
                            styles.contactItem,
                            selectedContacts.some(c => c.id === contact.id) && styles.selectedContactItem
                          ]}
                          onPress={() => toggleContactSelection(contact)}
                        >
                          <View style={styles.contactInfo}>
                            {contact.avatarUrl ? (
                              <Image source={{ uri: contact.avatarUrl }} style={styles.contactAvatar} />
                            ) : (
                              <View style={styles.contactAvatarPlaceholder}>
                                <Text style={styles.contactAvatarText}>
                                  {contact.name.substring(0, 1)}
                                </Text>
                              </View>
                            )}
                            <View>
                              <Text style={styles.contactName}>{contact.name}</Text>
                              <Text style={styles.contactEmail}>{contact.email}</Text>
                            </View>
                          </View>
                          
                          {selectedContacts.some(c => c.id === contact.id) && (
                            <Check size={20} color="#3B82F6" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={styles.inputLabel}>メールアドレス</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="例: friend@example.com, family@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    value={permissionEmails}
                    onChangeText={setPermissionEmails}
                  />
                  <Text style={styles.helperText}>
                    複数のメールアドレスはカンマで区切ってください
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* 自動投稿設定セクション */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>許可後に自動投稿する</Text>
              <Text style={styles.switchDescription}>
                許可が得られた後に自動的に投稿します
              </Text>
            </View>
            <Switch
              value={autoPost}
              onValueChange={setAutoPost}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={autoPost ? '#3B82F6' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* 送信ボタン */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>投稿を更新</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Add styles
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  uploadOption: {
    width: 120,
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  platformSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 12,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 0.48,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  permissionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 12,
  },
  suggestedContactsContainer: {
    marginBottom: 20,
  },
  suggestedContactsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
  },
  selectedContactItem: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  contactEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  buttonContainer: {
    padding: 20,
  },
  submitButton: {
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
