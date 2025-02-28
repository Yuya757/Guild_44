import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown, Check, Info, Calendar, MapPin } from 'lucide-react-native';

// 使用目的のオプション
const USAGE_PURPOSES = [
  'マーケティング',
  'ソーシャルメディア',
  'ウェブサイト',
  '印刷物',
  'プレゼンテーション',
  '教育目的',
  '商業利用',
  'その他',
];

// 地理的範囲のオプション
const GEOGRAPHIC_SCOPES = [
  '地域限定（市/地域）',
  '国内（単一国）',
  '国際（複数国）',
  '世界規模（制限なし）',
];

// 期間のオプション
const TIME_DURATIONS = [
  '6ヶ月',
  '1年',
  '3年',
  '5年',
  '無期限',
];

// 修正オプション
const MODIFICATION_OPTIONS = [
  '基本的な色補正と照明調整',
  'トリミングとサイズ変更',
  'テキストやグラフィックの追加',
  '他の画像との組み合わせ',
  '芸術的または創造的な加工',
  '修正不可',
];

// 配布チャネル
const DISTRIBUTION_CHANNELS = [
  '会社ウェブサイト',
  'ソーシャルメディアプラットフォーム',
  '印刷物',
  'メールマーケティング',
  '第三者ウェブサイト',
  '広告プラットフォーム',
  'モバイルアプリケーション',
];

// Add these types at the top of your file (adjust based on your actual data structure)
type Modification = {
  id: string;
  text: string;
  // add other properties as needed
};

type Channel = {
  id: string;
  name: string;
  // add other properties as needed
};

type Purpose = {
  id: string;
  description: string;
  // add other properties as needed
};

type Scope = {
  id: string;
  description: string;
  // add other properties as needed
};

type Duration = {
  id: string;
  period: string;
  // add other properties as needed
};

export default function ConsentFormScreen() {
  const [step, setStep] = useState(1);
  
  // ステップ1: 被写体情報
  const [subjectName, setSubjectName] = useState('');
  const [subjectEmail, setSubjectEmail] = useState('');
  const [subjectPhone, setSubjectPhone] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  
  // ステップ2: 使用詳細
  const [usagePurpose, setUsagePurpose] = useState('');
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [usageDescription, setUsageDescription] = useState('');
  const [geographicScope, setGeographicScope] = useState('');
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const [timeDuration, setTimeDuration] = useState('');
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  
  // ステップ3: 許可と同意
  const [selectedModifications, setSelectedModifications] = useState<Modification[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataProtectionAccepted, setDataProtectionAccepted] = useState(false);
  const [revocationUnderstood, setRevocationUnderstood] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // フォームを送信
      router.replace('/consent-submitted');
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
        if (isMinor) {
          return (
            subjectName.trim() !== '' &&
            subjectEmail.trim() !== '' &&
            guardianName.trim() !== '' &&
            guardianEmail.trim() !== '' &&
            guardianRelationship.trim() !== ''
          );
        }
        return subjectName.trim() !== '' && subjectEmail.trim() !== '';
      case 2:
        return (
          usagePurpose.trim() !== '' &&
          usageDescription.trim() !== '' &&
          geographicScope.trim() !== '' &&
          timeDuration.trim() !== ''
        );
      case 3:
        return (
          selectedModifications.length > 0 &&
          selectedChannels.length > 0 &&
          termsAccepted &&
          dataProtectionAccepted &&
          revocationUnderstood
        );
      default:
        return false;
    }
  };

  const toggleModification = (modification: Modification) => {
    if (selectedModifications.includes(modification)) {
      setSelectedModifications(
        selectedModifications.filter((item) => item !== modification)
      );
    } else {
      setSelectedModifications([...selectedModifications, modification]);
    }
  };

  const toggleChannel = (channel: Channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(
        selectedChannels.filter((item) => item !== channel)
      );
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const selectPurpose = (purpose: Purpose) => {
    setUsagePurpose(purpose.description);
    setShowPurposeDropdown(false);
  };

  const selectScope = (scope: Scope) => {
    setGeographicScope(scope.description);
    setShowScopeDropdown(false);
  };

  const selectDuration = (duration: Duration) => {
    setTimeDuration(duration.period);
    setShowDurationDropdown(false);
  };

  const handleIdentityCheck = () => {
    Alert.alert(
      '本人確認',
      '本人確認のため、以下の選択肢から選んでください',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '私ではありません',
          onPress: () => reportNotMe()
        },
        {
          text: '私です',
          onPress: () => confirmIdentity()
        }
      ]
    );
  };

  const reportNotMe = () => {
    Alert.alert(
      '報告を送信しました',
      '「私ではない」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  const confirmIdentity = () => {
    Alert.alert(
      '本人確認完了',
      '本人確認が完了しました。フォームの入力を続けてください。',
      [{ text: 'OK' }]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View
        style={[
          styles.stepDot,
          step >= 1 && styles.activeStepDot,
        ]}
      >
        <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>
          1
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View
        style={[
          styles.stepDot,
          step >= 2 && styles.activeStepDot,
        ]}
      >
        <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>
          2
        </Text>
      </View>
      <View style={styles.stepLine} />
      <View
        style={[
          styles.stepDot,
          step >= 3 && styles.activeStepDot,
        ]}
      >
        <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>
          3
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>被写体情報</Text>
      <Text style={styles.stepDescription}>
        画像に写っている人物の詳細を提供してください
      </Text>

      <View style={styles.identityCheckContainer}>
        <Text style={styles.identityCheckText}>
          あなたが写真に写っている本人である場合は、本人確認を行ってください
        </Text>
        <TouchableOpacity 
          style={styles.identityCheckButton}
          onPress={handleIdentityCheck}
        >
          <Text style={styles.identityCheckButtonText}>本人確認を行う</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}> 氏名</Text>
        <TextInput
          style={styles.input}
          placeholder="山田 太郎"
          placeholderTextColor="#94A3B8"
          value={subjectName}
          onChangeText={setSubjectName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>メールアドレス</Text>
        <TextInput
          style={styles.input}
          placeholder="taro.yamada@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          value={subjectEmail}
          onChangeText={setSubjectEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>電話番号（任意）</Text>
        <TextInput
          style={styles.input}
          placeholder="090-1234-5678"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={subjectPhone}
          onChangeText={setSubjectPhone}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>被写体は未成年者（18歳未満）ですか？</Text>
        <Switch
          value={isMinor}
          onValueChange={setIsMinor}
          trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
          thumbColor={isMinor ? '#3B82F6' : '#F1F5F9'}
        />
      </View>

      {isMinor && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionSubtitle}>保護者情報</Text>
          <Text style={styles.helperText}>
            未成年者の場合、親または法定後見人による同意が必要です
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>保護者氏名</Text>
            <TextInput
              style={styles.input}
              placeholder="山田 花子"
              placeholderTextColor="#94A3B8"
              value={guardianName}
              onChangeText={setGuardianName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>保護者メールアドレス</Text>
            <TextInput
              style={styles.input}
              placeholder="hanako.yamada@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={guardianEmail}
              onChangeText={setGuardianEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>保護者電話番号</Text>
            <TextInput
              style={styles.input}
              placeholder="090-9876-5432"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={guardianPhone}
              onChangeText={setGuardianPhone}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>未成年者との関係</Text>
            <TextInput
              style={styles.input}
              placeholder="親、法定後見人など"
              placeholderTextColor="#94A3B8"
              value={guardianRelationship}
              onChangeText={setGuardianRelationship}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>使用詳細</Text>
      <Text style={styles.stepDescription}>
        画像がどのように使用されるかを指定してください
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>使用目的</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setShowPurposeDropdown(!showPurposeDropdown);
            setShowScopeDropdown(false);
            setShowDurationDropdown(false);
          }}
        >
          <Text
            style={
              usagePurpose ? styles.dropdownButtonText : styles.dropdownPlaceholder
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
                onPress={() => selectPurpose({ id: purpose, description: purpose })}
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
        <Text style={styles.inputLabel}>詳細説明</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="画像がどのように使用されるか具体的に説明してください..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={usageDescription}
          onChangeText={setUsageDescription}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>地理的範囲</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setShowScopeDropdown(!showScopeDropdown);
            setShowPurposeDropdown(false);
            setShowDurationDropdown(false);
          }}
        >
          <Text
            style={
              geographicScope ? styles.dropdownButtonText : styles.dropdownPlaceholder
            }
          >
            {geographicScope || '地理的範囲を選択'}
          </Text>
          <MapPin size={20} color="#64748B" />
        </TouchableOpacity>
        {showScopeDropdown && (
          <View style={styles.dropdownMenu}>
            {GEOGRAPHIC_SCOPES.map((scope) => (
              <TouchableOpacity
                key={scope}
                style={styles.dropdownItem}
                onPress={() => selectScope({ id: scope, description: scope })}
              >
                <Text style={styles.dropdownItemText}>{scope}</Text>
                {scope === geographicScope && (
                  <Check size={16} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>使用期間</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setShowDurationDropdown(!showDurationDropdown);
            setShowPurposeDropdown(false);
            setShowScopeDropdown(false);
          }}
        >
          <Text
            style={
              timeDuration ? styles.dropdownButtonText : styles.dropdownPlaceholder
            }
          >
            {timeDuration || '期間を選択'}
          </Text>
          <Calendar size={20} color="#64748B" />
        </TouchableOpacity>
        {showDurationDropdown && (
          <View style={styles.dropdownMenu}>
            {TIME_DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={styles.dropdownItem}
                onPress={() => selectDuration({ id: duration, period: duration })}
              >
                <Text style={styles.dropdownItemText}>{duration}</Text>
                {duration === timeDuration && (
                  <Check size={16} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>許可と同意</Text>
      <Text style={styles.stepDescription}>
        許可する修正と配布チャネルを指定してください
      </Text>

      <View style={styles.checkboxContainer}>
        <Text style={styles.inputLabel}>許可する修正</Text>
        {MODIFICATION_OPTIONS.map((modification) => (
          <TouchableOpacity
            key={modification}
            style={styles.checkbox}
            onPress={() => toggleModification({ id: modification, text: modification })}
          >
            <View
              style={[
                styles.checkboxBox,
                selectedModifications.some((item) => item.id === modification) && styles.checkboxChecked,
              ]}
            >
              {selectedModifications.some((item) => item.id === modification) && (
                <Check size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{modification}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.checkboxContainer}>
        <Text style={styles.inputLabel}>配布チャネル</Text>
        {DISTRIBUTION_CHANNELS.map((channel) => (
          <TouchableOpacity
            key={channel}
            style={styles.checkbox}
            onPress={() => toggleChannel({ id: channel, name: channel })}
          >
            <View
              style={[
                styles.checkboxBox,
                selectedChannels.some((item) => item.id === channel) && styles.checkboxChecked,
              ]}
            >
              {selectedChannels.some((item) => item.id === channel) && (
                <Check size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{channel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.consentSummary}>
        <Text style={styles.summaryTitle}>同意内容の要約</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>被写体:</Text>
          <Text style={styles.summaryValue}>{subjectName}</Text>
        </View>
        
        {isMinor && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>保護者:</Text>
            <Text style={styles.summaryValue}>{guardianName}</Text>
          </View>
        )}
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>目的:</Text>
          <Text style={styles.summaryValue}>{usagePurpose}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>範囲:</Text>
          <Text style={styles.summaryValue}>{geographicScope}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>期間:</Text>
          <Text style={styles.summaryValue}>{timeDuration}</Text>
        </View>
      </View>

      <View style={styles.agreementSection}>
        <TouchableOpacity
          style={styles.agreementCheckbox}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View
            style={[
              styles.checkboxBox,
              termsAccepted && styles.checkboxChecked,
            ]}
          >
            {termsAccepted && <Check size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.agreementText}>
            このフォームと完全なポリシー文書に概説されている画像使用許可に関する利用規約に同意します。
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementCheckbox}
          onPress={() => setDataProtectionAccepted(!dataProtectionAccepted)}
        >
          <View
            style={[
              styles.checkboxBox,
              dataProtectionAccepted && styles.checkboxChecked,
            ]}
          >
            {dataProtectionAccepted && <Check size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.agreementText}>
            プライバシーポリシーとデータ保護規制に従って個人情報が処理されることを理解しています。
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.agreementCheckbox}
          onPress={() => setRevocationUnderstood(!revocationUnderstood)}
        >
          <View
            style={[
              styles.checkboxBox,
              revocationUnderstood && styles.checkboxChecked,
            ]}
          >
            {revocationUnderstood && <Check size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.agreementText}>
            ポリシーに概説されている制限に従って、正式な取り消し要求を提出することでいつでもこの同意を取り消すことができることを理解しています。
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Info size={20} color="#1E40AF" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          このフォームを送信することで、指定された画像使用に対して法的拘束力のある同意を提供することになります。この同意書のコピーはすべての関係者にメールで送信されます。
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>画像同意書フォーム</Text>
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
            style={[
              styles.nextButton,
              !isStepValid() && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={styles.nextButtonText}>
              {step === 3 ? '同意を送信' : '次へ'}
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
  identityCheckContainer: {
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  identityCheckText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#854D0E',
    marginBottom: 12,
  },
  identityCheckButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  identityCheckButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
    flex: 1,
  },
  guardianSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
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
  checkboxContainer: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkboxBox: {
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
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 22,
  },
  consentSummary: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    width: 120,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  agreementSection: {
    marginBottom: 24,
  },
  agreementCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
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
});