import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Camera, Upload, Calendar, Clock, ChevronDown, Check, Instagram, Twitter, Users, Info, Send, Facebook, Snail as Snapchat } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Define types
type PlatformType = 'instagram' | 'twitter' | 'snapchat' | 'tiktok' | 'facebook';
type StepType = 1 | 2 | 3;

// Contact type for facial recognition results
type ContactType = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
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

// プラットフォームのオプション
const PLATFORMS: PlatformType[] = ['instagram', 'twitter', 'snapchat', 'tiktok', 'facebook'];

export default function CreateScheduledPostScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [platform, setPlatform] = useState<PlatformType | ''>('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState<boolean>(false);

  // 日付と時間の選択
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // 許可申請関連
  const [requirePermission, setRequirePermission] = useState<boolean>(true);
  const [permissionEmails, setPermissionEmails] = useState<string>('');

  // 顔認識関連
  const [recognizingFace, setRecognizingFace] = useState<boolean>(false);
  const [suggestedContacts, setSuggestedContacts] = useState<ContactType[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactType[]>([]);

  // 自動投稿設定
  const [autoPost, setAutoPost] = useState<boolean>(true);

  // When selected contacts change, update the permission emails
  useEffect(() => {
    if (selectedContacts.length > 0) {
      setPermissionEmails(selectedContacts.map(contact => contact.email).join(', '));
    }
  }, [selectedContacts]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep === 1 ? 2 : 3);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep === 3 ? 2 : 1);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } else {
      router.back();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return imageUrl !== '';
      case 2:
        return caption !== '' && platform !== '';
      case 3:
        return (
          !requirePermission || (requirePermission && permissionEmails !== '')
        );
      default:
        return false;
    }
  };

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

    // 予約投稿を作成
    Alert.alert(
      '予約投稿を作成',
      requirePermission
        ? '投稿は許可が得られた後に予約されます'
        : '投稿が予約されました',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/scheduled'),
        },
      ]
    );
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

  const selectPlatform = (selectedPlatform: PlatformType) => {
    setPlatform(selectedPlatform);
    setShowPlatformDropdown(false);
  };

  const getPlatformIcon = (platformName: PlatformType | '') => {
    switch (platformName) {
      case 'instagram':
        return <Instagram size={24} color="#E1306C" />;
      case 'twitter':
        return <Twitter size={24} color="#1DA1F2" />;
      case 'snapchat':
        return <Snapchat size={24} color="#FFFC00" />;
      case 'tiktok':
        // TikTokのアイコンはLucideにないので、テキストで代用
        return <Text style={{fontSize: 20, fontWeight: 'bold', color: '#000000'}}>TikTok</Text>;
      case 'facebook':
        return <Facebook size={24} color="#1877F2" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platformName: PlatformType | '') => {
    switch (platformName) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      case 'snapchat':
        return 'Snapchat';
      case 'tiktok':
        return 'TikTok';
      case 'facebook':
        return 'Facebook';
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, currentStep >= 1 && styles.activeStepDot]}>
        <Text
          style={[
            styles.stepNumber,
            currentStep >= 1 && styles.activeStepNumber,
          ]}
        >
          1
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, currentStep >= 2 && styles.activeStepDot]}>
        <Text
          style={[
            styles.stepNumber,
            currentStep >= 2 && styles.activeStepNumber,
          ]}
        >
          2
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, currentStep >= 3 && styles.activeStepDot]}>
        <Text
          style={[
            styles.stepNumber,
            currentStep >= 3 && styles.activeStepNumber,
          ]}
        >
          3
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>画像を選択</Text>
      <Text style={styles.stepDescription}>
        投稿したい人物の画像を選択してください
      </Text>

      {imageUrl ? (
        <Animated.View
          entering={FadeInDown}
          style={styles.imagePreviewContainer}
        >
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
        </Animated.View>
      ) : (
        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadOption} onPress={takePicture}>
            <Camera size={32} color="#3B82F6" />
            <Text style={styles.uploadOptionText}>写真を撮影</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadOption} onPress={uploadImage}>
            <Upload size={32} color="#3B82F6" />
            <Text style={styles.uploadOptionText}>画像をアップロード</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>投稿内容</Text>
      <Text style={styles.stepDescription}>
        投稿の詳細情報を入力してください
      </Text>

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
          <Animated.View entering={FadeInDown} style={styles.dropdownMenu}>
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
          </Animated.View>
        )}
      </View>

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
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>許可設定</Text>
      <Text style={styles.stepDescription}>投稿の許可設定を行ってください</Text>

      <View style={styles.section}>
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
          <Animated.View entering={FadeInUp} style={styles.permissionContainer}>
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
                  <Animated.View entering={FadeInDown} style={styles.suggestedContactsContainer}>
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
                  </Animated.View>
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
          </Animated.View>
        )}
      </View>

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

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>投稿内容の確認</Text>

        <View style={styles.summaryContent}>
          <Image source={{ uri: imageUrl }} style={styles.summaryImage} />

          <View style={styles.summaryDetails}>
            <View style={styles.summaryPlatform}>
              {getPlatformIcon(platform)}
              <Text style={styles.summaryPlatformText}>
                {getPlatformName(platform)}
              </Text>
            </View>

            <Text style={styles.summaryCaption} numberOfLines={2}>
              {caption}
            </Text>

            <View style={styles.summarySchedule}>
              <Calendar size={14} color="#64748B" />
              <Text style={styles.summaryScheduleText}>{formatDate(date)}</Text>
              <Clock size={14} color="#64748B" style={styles.clockIcon} />
              <Text style={styles.summaryScheduleText}>{formatTime(date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const toggleContactSelection = (contact: ContactType) => {
    if (selectedContacts.some(c => c.id === contact.id)) {
      // すでに選択されている場合、選択解除
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      // 選択されていない場合、選択に追加
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新規予約投稿</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !isStepValid() && styles.disabledButton]}
          onPress={nextStep}
          disabled={!isStepValid()}
        >
          {currentStep === 3 ? (
            <View style={styles.submitButtonContent}>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.nextButtonText}>予約投稿を作成</Text>
            </View>
          ) : (
            <Text style={styles.nextButtonText}>次へ</Text>
          )}
        </TouchableOpacity>
      </View>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepDot: {
    backgroundColor: '#3B82F6',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748B',
    marginBottom: 24,
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
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadOption: {
    flex: 1,
    height: 160,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
    marginTop: 12,
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
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'flex-start',
  },
  noteIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#B91C1C',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
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
    fontWeight: '400',
    color: '#0F172A',
    marginLeft: 12,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
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
    fontWeight: '400',
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
    fontWeight: '400',
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
    fontWeight: '400',
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
    fontWeight: '400',
    color: '#64748B',
    marginTop: 8,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  summaryDetails: {
    flex: 1,
    marginLeft: 16,
  },
  summaryPlatform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryPlatformText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 8,
  },
  summaryCaption: {
    fontSize: 14,
    fontWeight: '400',
    color: '#334155',
    marginBottom: 8,
  },
  summarySchedule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryScheduleText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginLeft: 4,
  },
  clockIcon: {
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  nextButton: {
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
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '400',
    color: '#64748B',
  },
});