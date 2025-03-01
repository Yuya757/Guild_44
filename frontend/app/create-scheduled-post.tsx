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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, Upload, Calendar, Clock, ChevronDown, Check, Instagram, Twitter, Users, Info, Send, Facebook, Snail as Snapchat } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { recognizeFacesFromImage, getSuggestedEmails, getFaceCoordinates } from '../utils/apiService';
import { Calendar as CalendarPicker } from 'react-native-calendars';

const { width } = Dimensions.get('window');

// Define types
type PlatformType = 'instagram' | 'twitter' | 'snapchat' | 'tiktok' | 'facebook';
type StepType = 1 | 2 | 3;

// Contact type for facial recognition results
type ContactType = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | any;  // requireしたモジュールも受け入れられるように型を調整
  isLocalImage?: boolean;
};

// Sample contacts - in a real app, these would come from the user's contacts list
const SAMPLE_CONTACTS: ContactType[] = [
  {
    id: '1',
    name: '佐藤 健太',
    email: 'kenta.sato@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    isLocalImage: false,
  },
  {
    id: '2',
    name: '鈴木 美咲',
    email: 'misaki.suzuki@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    isLocalImage: false,
  },
  {
    id: '3',
    name: '田中 大輔',
    email: 'daisuke.tanaka@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
    isLocalImage: false,
  },
  {
    id: '4',
    name: '山田 花子',
    email: 'hanako.yamada@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
    isLocalImage: false,
  },
];

// プラットフォームのオプション
const PLATFORMS: PlatformType[] = ['instagram', 'twitter', 'snapchat', 'tiktok', 'facebook'];

// 画像のMIMEタイプを取得する関数
const getMimeType = async (uri: string) => {
  // URIからファイル拡張子を取得
  const extension = uri.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      // 拡張子から判断できない場合はJPEGとする
      return 'image/jpeg';
  }
};

export default function CreateScheduledPostScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [platform, setPlatform] = useState<PlatformType | ''>('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState<boolean>(false);

  // 日付と時間の選択
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes());

  // 許可申請関連
  const [requirePermission, setRequirePermission] = useState<boolean>(true);
  const [permissionEmails, setPermissionEmails] = useState<string>('');

  // 顔認識関連
  const [recognizingFace, setRecognizingFace] = useState<boolean>(false);
  const [suggestedContacts, setSuggestedContacts] = useState<ContactType[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactType[]>([]);

  // 自動投稿設定
  const [autoPost, setAutoPost] = useState<boolean>(true);

  // ルートパラメータを取得
  const params = useLocalSearchParams();
  const recognizedFacesParam = params.recognizedFaces as string | undefined;

  // 顔認識関連のステート追加
  const [processingImage, setProcessingImage] = useState<boolean>(false);
  const [faceCoordinates, setFaceCoordinates] = useState<any[]>([]);
  const [detectionsVisible, setDetectionsVisible] = useState<boolean>(true);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  // For facial recognition
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedContacts, setRecognizedContacts] = useState<ContactType[]>([]);

  // When selected contacts change, update the permission emails
  useEffect(() => {
    if (selectedContacts.length > 0) {
      setPermissionEmails(selectedContacts.map(contact => contact.email).join(', '));
    }
  }, [selectedContacts]);

  // 顔認識処理を行う関数を修正
  const performFacialRecognition = async (imageUri: string) => {
    if (!imageUri) {
      Alert.alert('画像を選択してください');
      return;
    }
    
    try {
      setIsLoading(true);
      setRecognizingFace(true);
      setProcessingImage(true);
      
      // ファイル情報の取得
      console.log('Checking file at URI:', imageUri);
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists || fileInfo.isDirectory === true) {
        console.error('File does not exist or is a directory:', imageUri);
        throw new Error('指定されたファイルが存在しないか、ディレクトリです');
      }
      
      console.log('File exists, size:', fileInfo.size);
      
      // MIMEタイプを取得
      const mimeType = await getMimeType(imageUri);
      console.log('MIME type:', mimeType);
      
      // 画像をBase64に変換
      console.log('Reading file as base64...');
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64Image) {
        throw new Error('画像の読み込みに失敗しました');
      }
      
      console.log('Base64 image length:', base64Image.length);
      
      // 顔認識APIを呼び出し
      console.log('Calling face recognition API...');
      const response = await recognizeFacesFromImage(`data:${mimeType};base64,${base64Image}`);
      setRecognitionResult(response);
      
      if (response.status === 'success' && response.faces.length > 0) {
        console.log('Faces detected:', response.faces.length);
        // メールアドレスの提案を取得
        const emails = getSuggestedEmails(response.faces);
        
        // 検出された顔の情報から連絡先データを作成
        const contacts = emails.map((email, index) => {
          // メールアドレスに基づいて適切なアバター画像を選択
          let avatarUri;
          let isLocalImage = false;
          
          // ローカルの画像ファイルを使用
          if (email.includes('reina') || email.includes('sumi')) {
            // 鷲見玲奈用の画像
            avatarUri = require('../assets/images/sumi_reina.jpg');
            isLocalImage = true;
          } else if (email.includes('hikakin') || email.includes('kai')) {
            // ヒカキン用の画像
            avatarUri = require('../assets/images/hikakin.jpg');
            isLocalImage = true;
          } else {
            // デフォルトでは元の画像を使用
            avatarUri = imageUri;
            isLocalImage = false;
          }
          
          return {
            id: `face-${index}`,
            name: email.includes('reina') ? '鷲見玲奈' : 
                 email.includes('hikakin') ? 'ヒカキン' : 
                 `検出された人物 ${index + 1}`,
            email: email,
            avatarUrl: avatarUri,
            isLocalImage: isLocalImage
          };
        });
        
        setSuggestedContacts(contacts);
        
        // 顔の座標を取得
        const coordinates = getFaceCoordinates(response.faces);
        setFaceCoordinates(coordinates);
        
        Alert.alert(
          '顔認識完了',
          `画像から${contacts.length}人の連絡先が見つかりました。`
        );

        setRecognizedContacts(contacts);
        setSelectedContacts(contacts.slice(0, 2)); // Automatically select the first two contacts
      } else {
        console.log('No faces detected or API returned error');
        Alert.alert(
          '顔認識結果',
          '画像から顔を検出できませんでした。別の画像を試してください。'
        );

        setRecognizedContacts(SAMPLE_CONTACTS);
        setSelectedContacts([]);
        setFaceCoordinates([]);
      }
      
    } catch (error) {
      console.error('Face recognition error:', error);
      if (error instanceof Error) {
        Alert.alert(
          'エラー',
          `顔認識処理中にエラーが発生しました: ${error.message}`
        );
      } else {
        Alert.alert(
          'エラー',
          '顔認識処理中に不明なエラーが発生しました。再度お試しください。'
        );
      }

      setRecognizedContacts(SAMPLE_CONTACTS);
      setSelectedContacts([]);
      setFaceCoordinates([]);
    } finally {
      setRecognizingFace(false);
      setProcessingImage(false);
      setIsLoading(false);
    }
  };

  // 写真撮影関数を修正
  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('カメラのアクセス許可が必要です');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setImageUrl(selectedUri);
      
      // 顔認識を実行
      await performFacialRecognition(selectedUri);
    }
  };

  // 画像アップロード関数を修正
  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setImageUrl(selectedUri);
      
      // 顔認識を実行
      await performFacialRecognition(selectedUri);
    }
  };

  // 顔の枠を描画
  const renderFaceBoxes = () => {
    if (!faceCoordinates.length || !detectionsVisible) return null;
    
    return faceCoordinates.map((face, index) => (
      <View
        key={`face-${index}`}
        style={{
          position: 'absolute',
          left: `${face.Left * 100}%`,
          top: `${face.Top * 100}%`,
          width: `${face.Width * 100}%`,
          height: `${face.Height * 100}%`,
          borderWidth: 2,
          borderColor: '#10B981',
          borderRadius: 4,
        }}
      />
    ));
  };

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

  const selectPlatform = (selectedPlatform: PlatformType) => {
    setPlatform(selectedPlatform);
    setShowPlatformDropdown(false);
  };

  const getPlatformIcon = (platformName: PlatformType | '') => {
    switch (platformName) {
      case 'instagram':
        return <Instagram size={24} {...{color: "#E1306C"} as any} />;
      case 'twitter':
        return <Twitter size={24} {...{color: "#1DA1F2"} as any} />;
      case 'snapchat':
        return <Snapchat size={24} {...{color: "#FFFC00"} as any} />;
      case 'tiktok':
        // TikTokのアイコンはLucideにないので、テキストで代用
        return <Text style={{fontSize: 20, fontWeight: 'bold', color: '#000000'}}>TikTok</Text>;
      case 'facebook':
        return <Facebook size={24} {...{color: "#1877F2"} as any} />;
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

  // Handle date and time changes
  const handleDateChange = () => {
    // Show the calendar picker
    setShowDatePicker(true);
  };

  const onDateSelected = (day: any) => {
    setShowDatePicker(false);
    // Create a new date with the selected day but preserve current time
    const newDate = new Date(date);
    const selectedDate = new Date(day.dateString);
    newDate.setFullYear(selectedDate.getFullYear());
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate());
    setDate(newDate);
  };

  const handleTimeChange = () => {
    // Show the time picker
    setShowTimePicker(true);
  };

  const onTimeSelected = () => {
    setShowTimePicker(false);
    // Create a new date with the selected time but preserve current date
    const newDate = new Date(date);
    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);
    setDate(newDate);
  };

  // 時間ピッカー用の時間と分の配列を生成
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatTime = (date: Date) => {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
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
          {renderFaceBoxes()}
          
          {processingImage && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.processingText}>顔を認識中...</Text>
            </View>
          )}
          
          <View style={styles.editOverlay}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setImageUrl('')}
            >
              <Text style={styles.editButtonText}>変更</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadOption} onPress={takePicture}>
            <Camera size={32} {...{color: "#3B82F6"} as any} />
            <Text style={styles.uploadOptionText}>写真を撮影</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadOption} onPress={uploadImage}>
            <Upload size={32} {...{color: "#3B82F6"} as any} />
            <Text style={styles.uploadOptionText}>画像をアップロード</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>投稿の詳細を設定</Text>
      
      {/* Platform selection */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>プラットフォーム</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowPlatformDropdown(!showPlatformDropdown)}
        >
          <View style={styles.selectedOptionContainer}>
            {platform ? (
              <View style={styles.platformIconWrapper}>
                {getPlatformIcon(platform)}
              </View>
            ) : null}
            <Text style={styles.selectedOption}>
              {platform ? getPlatformName(platform) : 'プラットフォームを選択'}
            </Text>
          </View>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>
        
        {showPlatformDropdown && (
          <View style={styles.dropdownMenu}>
            {PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform}
                style={styles.dropdownItem}
                onPress={() => {
                  selectPlatform(platform);
                  setShowPlatformDropdown(false);
                }}
              >
                <View style={styles.platformIconWrapper}>
                  {getPlatformIcon(platform)}
                </View>
                <Text style={styles.dropdownItemText}>{getPlatformName(platform)}</Text>
                {platform === platform && (
                  <Check size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      {/* Date and time selection */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>投稿日時</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={handleDateChange}
          >
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.dateTimeButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={handleTimeChange}
          >
            <Clock size={20} color="#3B82F6" />
            <Text style={styles.dateTimeButtonText}>{formatTime(date)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Modal for Date Selection */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Text style={styles.modalTitle}>日付を選択</Text>
            
            <CalendarPicker
              onDayPress={onDateSelected}
              markedDates={{
                [date.toISOString().split('T')[0]]: { selected: true, selectedColor: '#3B82F6' }
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#64748B',
                selectedDayBackgroundColor: '#3B82F6',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#3B82F6',
                dayTextColor: '#1E293B',
                textDisabledColor: '#CBD5E1',
                dotColor: '#3B82F6',
                selectedDotColor: '#ffffff',
                arrowColor: '#3B82F6',
                monthTextColor: '#1E293B',
              }}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.closeButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Time Picker */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.calendarContainer}>
              <Text style={styles.modalTitle}>時間を選択</Text>
              
              <View style={styles.timePickerContainer}>
                <ScrollView style={styles.timePickerScroll}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={`hour-${hour}`}
                      style={[
                        styles.timePickerItem,
                        selectedHour === hour && styles.selectedTimePickerItem
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.timePickerText,
                        selectedHour === hour && styles.selectedTimePickerText
                      ]}>
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <Text style={styles.timePickerSeparator}>:</Text>
                
                <ScrollView style={styles.timePickerScroll}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={`minute-${minute}`}
                      style={[
                        styles.timePickerItem,
                        selectedMinute === minute && styles.selectedTimePickerItem
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.timePickerText,
                        selectedMinute === minute && styles.selectedTimePickerText
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.timePickerButtonContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.closeButtonText}>キャンセル</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.okButton}
                  onPress={onTimeSelected}
                >
                  <Text style={styles.okButtonText}>設定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Rest of form content */}
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
          <Animated.View entering={FadeInUp} style={styles.permissionContainer}>
            <View style={styles.permissionHeader}>
              <Users size={20} {...{color: "#3B82F6"} as any} />
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
                            contact.isLocalImage ? (
                              <Image 
                                source={contact.avatarUrl} 
                                style={styles.contactAvatar}
                                defaultSource={require('../assets/images/favicon.png')} // フォールバック画像
                              />
                            ) : (
                              <Image 
                                source={{ uri: contact.avatarUrl }} 
                                style={styles.contactAvatar}
                                defaultSource={require('../assets/images/favicon.png')} // フォールバック画像
                              />
                            )
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
                          <Check size={20} {...{color: "#3B82F6"} as any} />
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
              <Calendar size={14} {...{color: "#64748B"} as any} />
              <Text style={styles.summaryScheduleText}>{formatDate(date)}</Text>
              <Clock size={14} {...{color: "#64748B"} as any} style={styles.clockIcon} />
              <Text style={styles.summaryScheduleText}>{formatTime(date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>共有設定</Text>
      <Text style={styles.stepDescription}>投稿を共有するユーザーを選択してください</Text>

      {/* Contact selection section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>共有先</Text>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => Alert.alert(
              '顔認識について',
              '写真内の顔を自動検出して、システムに登録されたユーザーを提案します。'
            )}
          >
            <Info size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.contactsList}
          contentContainerStyle={styles.contactsListContent}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>顔認識処理中...</Text>
            </View>
          ) : recognizedContacts.length > 0 ? (
            recognizedContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  selectedContacts.includes(contact) && styles.selectedContactItem
                ]}
                onPress={() => toggleContactSelection(contact)}
              >
                <View style={styles.contactDetails}>
                  {contact.avatarUrl ? (
                    <Image
                      source={contact.isLocalImage ? contact.avatarUrl : { uri: contact.avatarUrl }}
                      style={styles.contactAvatar}
                    />
                  ) : (
                    <View style={styles.contactAvatarPlaceholder}>
                      <Text style={styles.contactAvatarPlaceholderText}>
                        {contact.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactEmail}>{contact.email}</Text>
                  </View>
                </View>
                
                {selectedContacts.includes(contact) && (
                  <Check size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContacts}>
              <Users size={48} color="#94A3B8" />
              <Text style={styles.emptyContactsTitle}>共有先が見つかりません</Text>
              <Text style={styles.emptyContactsDescription}>
                顔認識に失敗したか、写真に人物が写っていない可能性があります。
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
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

  useEffect(() => {
    // アプリ起動時にアセットを事前読み込み
    const preloadAssets = async () => {
      try {
        // ローカルの画像を事前読み込み
        await Asset.loadAsync([
          require('../assets/images/sumi_reina.jpg'),
          require('../assets/images/hikakin.jpg')
        ]);
        console.log('Assets preloaded successfully');
      } catch (error) {
        console.error('Error preloading assets:', error);
      }
    };
    
    preloadAssets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
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
              <Send size={20} {...{color: "#FFFFFF"} as any} />
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
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  editButtonText: {
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
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    flex: 1,
  },
  dateTimeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
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
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#1E293B',
    fontWeight: '500',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  selectedOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIconWrapper: {
    marginRight: 8,
  },
  selectedOption: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0F172A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  contactsList: {
    flex: 1,
  },
  contactsListContent: {
    padding: 16,
  },
  emptyContacts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyContactsDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 8,
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatarPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  timePickerScroll: {
    height: 200,
    width: 60,
  },
  timePickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimePickerItem: {
    backgroundColor: '#E0F2FE',
  },
  timePickerText: {
    fontSize: 20,
    color: '#64748B',
  },
  selectedTimePickerText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  timePickerSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#64748B',
  },
  timePickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  okButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
});