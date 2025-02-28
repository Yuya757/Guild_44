import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, HelpCircle, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { recognizeFacesFromImage } from '../utils/apiService';
import { testScenarios, mockRecognizeFaces } from '../utils/mockApiResponse';

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

type TestScenario = {
  id: string;
  title: string;
  description: string;
  expected: string;
};

export default function AdvancedTestScreen() {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [useRealApi, setUseRealApi] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  // カメラを起動
  const takePhoto = async () => {
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
      setImageUri(result.assets[0].uri);
      setTestResults(null);
    }
  };

  // 写真を選択
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setTestResults(null);
    }
  };

  // テスト実行
  const runTest = async () => {
    if (!selectedScenario) {
      Alert.alert('テストシナリオを選択してください');
      return;
    }

    if (useRealApi && !imageUri) {
      Alert.alert('実際のAPIをテストするには画像が必要です');
      return;
    }

    try {
      setIsProcessing(true);
      let response;

      if (useRealApi) {
        // 実際のAPIを使用
        // MIMEタイプを取得
        const mimeType = await getMimeType(imageUri!);
        
        const base64Image = await FileSystem.readAsStringAsync(imageUri!, {
          encoding: FileSystem.EncodingType.Base64,
        });
        response = await recognizeFacesFromImage(`data:${mimeType};base64,${base64Image}`);
      } else {
        // モックAPIを使用
        switch (selectedScenario.id) {
          case 'mock-success':
            response = await mockRecognizeFaces('success');
            break;
          case 'mock-no-match':
            response = await mockRecognizeFaces('no-match');
            break;
          case 'mock-error':
            try {
              response = await mockRecognizeFaces('error');
            } catch (error) {
              throw error;
            }
            break;
          default:
            response = await mockRecognizeFaces('success');
        }
      }

      setTestResults(response);
      
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({
        status: 'error',
        message: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString(),
        faces: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>詳細テスト</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>テスト設定</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>実際のAPIを使用</Text>
            <Switch
              value={useRealApi}
              onValueChange={setUseRealApi}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={useRealApi ? '#10B981' : '#94A3B8'}
            />
          </View>

          {useRealApi && (
            <View style={styles.imageSection}>
              <Text style={styles.subsectionTitle}>テスト画像</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                  <Text style={styles.buttonText}>画像を選択</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={takePhoto}>
                  <Camera size={20} {...{color: "#FFFFFF"} as any} />
                  <Text style={styles.buttonText}>写真を撮影</Text>
                </TouchableOpacity>
              </View>
              
              {imageUri && (
                <View style={styles.imagePreview}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          )}
          
          <Text style={styles.subsectionTitle}>テストシナリオ</Text>
          
          {testScenarios.map(scenario => (
            <TouchableOpacity
              key={scenario.id}
              style={[
                styles.scenarioCard,
                selectedScenario?.id === scenario.id && styles.selectedScenario,
                (!useRealApi && scenario.id === 'real-api') && styles.disabledScenario,
                (useRealApi && scenario.id !== 'real-api') && styles.disabledScenario
              ]}
              onPress={() => {
                if ((useRealApi && scenario.id === 'real-api') || 
                    (!useRealApi && scenario.id !== 'real-api')) {
                  setSelectedScenario(scenario);
                } else {
                  Alert.alert(
                    'シナリオを選択できません',
                    useRealApi 
                      ? 'APIモードでは「実際のAPIでテスト」のみ選択可能です。'
                      : 'モックモードでは「実際のAPIでテスト」以外を選択してください。'
                  );
                }
              }}
              disabled={(useRealApi && scenario.id !== 'real-api') || (!useRealApi && scenario.id === 'real-api')}
            >
              <Text style={[
                styles.scenarioTitle,
                selectedScenario?.id === scenario.id && styles.selectedScenarioTitle,
                ((useRealApi && scenario.id !== 'real-api') || (!useRealApi && scenario.id === 'real-api')) && styles.disabledScenarioTitle
              ]}>
                {scenario.title}
              </Text>
              <Text style={[
                styles.scenarioDescription,
                ((useRealApi && scenario.id !== 'real-api') || (!useRealApi && scenario.id === 'real-api')) && styles.disabledScenarioText
              ]}>
                {scenario.description}
              </Text>
              <View style={styles.expectedContainer}>
                <HelpCircle size={16} {...{color: "#64748B"} as any} />
                <Text style={[
                  styles.expectedText,
                  ((useRealApi && scenario.id !== 'real-api') || (!useRealApi && scenario.id === 'real-api')) && styles.disabledScenarioText
                ]}>
                  期待される結果: {scenario.expected}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[
              styles.runButton,
              (!selectedScenario || isProcessing || (useRealApi && !imageUri)) && styles.disabledButton
            ]}
            onPress={runTest}
            disabled={!selectedScenario || isProcessing || (useRealApi && !imageUri)}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.runButtonText}>テスト実行</Text>
            )}
          </TouchableOpacity>
        </View>

        {testResults && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>テスト結果</Text>
            <View style={[
              styles.resultCard,
              { backgroundColor: testResults.status === 'success' ? '#ECFDF5' : '#FEF2F2' }
            ]}>
              <Text style={styles.resultStatusText}>
                ステータス: {testResults.status === 'success' ? '成功' : 'エラー'}
              </Text>
              <Text style={styles.resultMessageText}>
                {testResults.message}
              </Text>
              
              {testResults.faces && testResults.faces.length > 0 && (
                <View style={styles.facesContainer}>
                  <Text style={styles.facesTitle}>検出された顔: {testResults.faces.length}人</Text>
                  
                  {testResults.faces.map((face: any, index: number) => (
                    <View key={face.face_id} style={styles.faceCard}>
                      <Text style={styles.faceTitle}>顔 #{index + 1}</Text>
                      <Text style={styles.faceDetail}>FaceID: {face.face_id}</Text>
                      <Text style={styles.faceDetail}>類似度: {face.similarity}%</Text>
                      
                      {face.member_info && Object.keys(face.member_info).map(key => {
                        if (key === 'BoundingBox') return null;
                        const value = face.member_info[key].S || face.member_info[key].N || JSON.stringify(face.member_info[key]);
                        return (
                          <Text key={key} style={styles.faceDetail}>
                            {key}: {value}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={styles.timestampText}>
                タイムスタンプ: {testResults.timestamp}
              </Text>
            </View>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#0F172A',
  },
  imageSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreview: {
    marginTop: 16,
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scenarioCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  selectedScenario: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  disabledScenario: {
    opacity: 0.5,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  selectedScenarioTitle: {
    color: '#3B82F6',
  },
  disabledScenarioTitle: {
    color: '#94A3B8',
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  disabledScenarioText: {
    color: '#94A3B8',
  },
  expectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
  },
  expectedText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
  },
  runButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  resultSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
  },
  resultStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultMessageText: {
    fontSize: 14,
    marginBottom: 12,
  },
  facesContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  facesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  faceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  faceDetail: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
}); 