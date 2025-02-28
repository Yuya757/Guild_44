import { SetStateAction, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  Upload,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react-native';

// 使用目的のオプション
const USAGE_PURPOSES = [
  'マーケティング',
  'ソーシャルメディア',
  'ウェブサイト',
  '印刷物',
  'プレゼンテーション',
  'その他',
];

export default function NewRequestScreen() {
  const [step, setStep] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [usagePurpose, setUsagePurpose] = useState('');
  const [usageDescription, setUsageDescription] = useState('');
  const [usageDuration, setUsageDuration] = useState('');
  const [projectName, setProjectName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // フォームを送信
      router.replace('/request-submitted');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return imageUrl.trim() !== '';
      case 2:
        return ownerName.trim() !== '' && ownerEmail.trim() !== '';
      case 3:
        return (
          usagePurpose.trim() !== '' &&
          usageDescription.trim() !== '' &&
          usageDuration.trim() !== '' &&
          projectName.trim() !== '' &&
          termsAccepted
        );
      default:
        return false;
    }
  };

  const selectPurpose = (purpose: SetStateAction<string>) => {
    setUsagePurpose(purpose);
    setShowPurposeDropdown(false);
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]}>
        <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>
          1
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]}>
        <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>
          2
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step >= 3 && styles.activeStepDot]}>
        <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>
          3
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>人物画像をアップロード</Text>
      <Text style={styles.stepDescription}>
        許可を申請したい人物の画像を提供してください
      </Text>

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
          <TouchableOpacity style={styles.uploadOption} onPress={takePicture}>
            <Camera size={24} color="#3B82F6" />
            <Text style={styles.uploadOptionText}>写真を撮影</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadOption} onPress={uploadImage}>
            <Upload size={24} color="#3B82F6" />
            <Text style={styles.uploadOptionText}>画像をアップロード</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.orText}>または</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>画像URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor="#94A3B8"
          value={imageUrl}
          onChangeText={setImageUrl}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>所有者情報</Text>
      <Text style={styles.stepDescription}>
        画像所有者の連絡先情報を入力してください
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>所有者名</Text>
        <TextInput
          style={styles.input}
          placeholder="田中 太郎"
          placeholderTextColor="#94A3B8"
          value={ownerName}
          onChangeText={setOwnerName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>所有者メールアドレス</Text>
        <TextInput
          style={styles.input}
          placeholder="taro.tanaka@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          value={ownerEmail}
          onChangeText={setOwnerEmail}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>使用詳細</Text>
      <Text style={styles.stepDescription}>
        画像の使用方法を指定してください
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>プロジェクト/キャンペーン名</Text>
        <TextInput
          style={styles.input}
          placeholder="夏季マーケティングキャンペーン"
          placeholderTextColor="#94A3B8"
          value={projectName}
          onChangeText={setProjectName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>使用目的</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowPurposeDropdown(!showPurposeDropdown)}
        >
          <Text
            style={
              usagePurpose
                ? styles.dropdownButtonText
                : styles.dropdownPlaceholder
            }
          >
            {usagePurpose || '目的を選択'}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>
        {showPurposeDropdown && (
          <View style={styles.dropdownMenu}>
            {USAGE_PURPOSES.map((purpose) => (
              <TouchableOpacity
                key={purpose}
                style={styles.dropdownItem}
                onPress={() => selectPurpose(purpose)}
              >
                <Text style={styles.dropdownItemText}>{purpose}</Text>
                {purpose === usagePurpose && (
                  <Check size={16} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>使用内容の説明</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="この画像をどのように使用する予定か説明してください..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={usageDescription}
          onChangeText={setUsageDescription}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>使用期間</Text>
        <View style={styles.durationInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="例: 6ヶ月、1年"
            placeholderTextColor="#94A3B8"
            value={usageDuration}
            onChangeText={setUsageDuration}
          />
          <Calendar size={20} color="#64748B" style={styles.durationIcon} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View
          style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
        >
          {termsAccepted && <Check size={12} color="#FFFFFF" />}
        </View>
        <Text style={styles.termsText}>
          画像使用許可に関する利用規約に同意します
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新規使用許可申請</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, !isStepValid() && styles.disabledButton]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={styles.nextButtonText}>
              {step === 3 ? '申請を送信' : '次へ'}
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
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
    fontFamily: 'Inter-SemiBold',
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
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  uploadOption: {
    flex: 1,
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginTop: 8,
  },
  orText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
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
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  textArea: {
    minHeight: 100,
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
  dropdownButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
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
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  durationIcon: {
    marginLeft: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 24,
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
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  noteContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#B91C1C',
    lineHeight: 20,
  },
});
