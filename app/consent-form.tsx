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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown, Check, Info, Calendar, MapPin } from 'lucide-react-native';

// Usage purpose options
const USAGE_PURPOSES = [
  'Marketing',
  'Social Media',
  'Website',
  'Print Publication',
  'Presentation',
  'Educational',
  'Commercial',
  'Other',
];

// Geographic scope options
const GEOGRAPHIC_SCOPES = [
  'Local (City/Region)',
  'National (Single Country)',
  'International (Multiple Countries)',
  'Worldwide (No Restrictions)',
];

// Time duration options
const TIME_DURATIONS = [
  '6 months',
  '1 year',
  '3 years',
  '5 years',
  'Perpetual',
];

// Modification options
const MODIFICATION_OPTIONS = [
  'Basic color correction and lighting adjustments',
  'Cropping and resizing',
  'Addition of text or graphics',
  'Combination with other images',
  'Artistic or creative manipulations',
  'No modifications allowed',
];

// Distribution channels
const DISTRIBUTION_CHANNELS = [
  'Company website',
  'Social media platforms',
  'Print materials',
  'Email marketing',
  'Third-party websites',
  'Advertising platforms',
  'Mobile applications',
];

export default function ConsentFormScreen() {
  const [step, setStep] = useState(1);
  
  // Step 1: Subject Information
  const [subjectName, setSubjectName] = useState('');
  const [subjectEmail, setSubjectEmail] = useState('');
  const [subjectPhone, setSubjectPhone] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  
  // Step 2: Usage Details
  const [usagePurpose, setUsagePurpose] = useState('');
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [usageDescription, setUsageDescription] = useState('');
  const [geographicScope, setGeographicScope] = useState('');
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const [timeDuration, setTimeDuration] = useState('');
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  
  // Step 3: Permissions and Consent
  const [selectedModifications, setSelectedModifications] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataProtectionAccepted, setDataProtectionAccepted] = useState(false);
  const [revocationUnderstood, setRevocationUnderstood] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit the form
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

  const toggleModification = (modification) => {
    if (selectedModifications.includes(modification)) {
      setSelectedModifications(
        selectedModifications.filter((item) => item !== modification)
      );
    } else {
      setSelectedModifications([...selectedModifications, modification]);
    }
  };

  const toggleChannel = (channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(
        selectedChannels.filter((item) => item !== channel)
      );
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const selectPurpose = (purpose) => {
    setUsagePurpose(purpose);
    setShowPurposeDropdown(false);
  };

  const selectScope = (scope) => {
    setGeographicScope(scope);
    setShowScopeDropdown(false);
  };

  const selectDuration = (duration) => {
    setTimeDuration(duration);
    setShowDurationDropdown(false);
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
      <Text style={styles.stepTitle}>Subject Information</Text>
      <Text style={styles.stepDescription}>
        Provide details about the person in the image
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#94A3B8"
          value={subjectName}
          onChangeText={setSubjectName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="john.doe@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          value={subjectEmail}
          onChangeText={setSubjectEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="+1 (555) 123-4567"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={subjectPhone}
          onChangeText={setSubjectPhone}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Is the subject a minor (under 18)?</Text>
        <Switch
          value={isMinor}
          onValueChange={setIsMinor}
          trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
          thumbColor={isMinor ? '#3B82F6' : '#F1F5F9'}
        />
      </View>

      {isMinor && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionSubtitle}>Guardian Information</Text>
          <Text style={styles.helperText}>
            For minors, consent must be provided by a parent or legal guardian
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Guardian's Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jane Doe"
              placeholderTextColor="#94A3B8"
              value={guardianName}
              onChangeText={setGuardianName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Guardian's Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="jane.doe@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={guardianEmail}
              onChangeText={setGuardianEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Guardian's Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={guardianPhone}
              onChangeText={setGuardianPhone}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Relationship to Minor</Text>
            <TextInput
              style={styles.input}
              placeholder="Parent, Legal Guardian, etc."
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
      <Text style={styles.stepTitle}>Usage Details</Text>
      <Text style={styles.stepDescription}>
        Specify how the image will be used
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Usage Purpose</Text>
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
            {usagePurpose || 'Select purpose'}
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
        <Text style={styles.inputLabel}>Detailed Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe specifically how the image will be used..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={usageDescription}
          onChangeText={setUsageDescription}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Geographic Scope</Text>
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
            {geographicScope || 'Select geographic scope'}
          </Text>
          <MapPin size={20} color="#64748B" />
        </TouchableOpacity>
        {showScopeDropdown && (
          <View style={styles.dropdownMenu}>
            {GEOGRAPHIC_SCOPES.map((scope) => (
              <TouchableOpacity
                key={scope}
                style={styles.dropdownItem}
                onPress={() => selectScope(scope)}
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
        <Text style={styles.inputLabel}>Time Duration</Text>
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
            {timeDuration || 'Select time duration'}
          </Text>
          <Calendar size={20} color="#64748B" />
        </TouchableOpacity>
        {showDurationDropdown && (
          <View style={styles.dropdownMenu}>
            {TIME_DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={styles.dropdownItem}
                onPress={() => selectDuration(duration)}
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
      <Text style={styles.stepTitle}>Permissions and Consent</Text>
      <Text style={styles.stepDescription}>
        Specify allowed modifications and distribution channels
      </Text>

      <View style={styles.checkboxContainer}>
        <Text style={styles.inputLabel}>Allowed Modifications</Text>
        {MODIFICATION_OPTIONS.map((modification) => (
          <TouchableOpacity
            key={modification}
            style={styles.checkbox}
            onPress={() => toggleModification(modification)}
          >
            <View
              style={[
                styles.checkboxBox,
                selectedModifications.includes(modification) && styles.checkboxChecked,
              ]}
            >
              {selectedModifications.includes(modification) && (
                <Check size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{modification}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.checkboxContainer}>
        <Text style={styles.inputLabel}>Distribution Channels</Text>
        {DISTRIBUTION_CHANNELS.map((channel) => (
          <TouchableOpacity
            key={channel}
            style={styles.checkbox}
            onPress={() => toggleChannel(channel)}
          >
            <View
              style={[
                styles.checkboxBox,
                selectedChannels.includes(channel) && styles.checkboxChecked,
              ]}
            >
              {selectedChannels.includes(channel) && (
                <Check size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{channel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.consentSummary}>
        <Text style={styles.summaryTitle}>Consent Summary</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Subject:</Text>
          <Text style={styles.summaryValue}>{subjectName}</Text>
        </View>
        
        {isMinor && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Guardian:</Text>
            <Text style={styles.summaryValue}>{guardianName}</Text>
          </View>
        )}
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Purpose:</Text>
          <Text style={styles.summaryValue}>{usagePurpose}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Scope:</Text>
          <Text style={styles.summaryValue}>{geographicScope}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duration:</Text>
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
            I agree to the terms and conditions regarding image usage permissions
            as outlined in this form and the full policy document.
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
            I understand that my personal information will be processed in accordance
            with the privacy policy and data protection regulations.
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
            I understand that I can revoke this consent at any time by submitting
            a formal revocation request, subject to the limitations outlined in the policy.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Info size={20} color="#1E40AF" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          By submitting this form, you are providing legally binding consent for the
          specified image usage. A copy of this consent form will be emailed to all parties.
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
        <Text style={styles.headerTitle}>Image Consent Form</Text>
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
              {step === 3 ? 'Submit Consent' : 'Next'}
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