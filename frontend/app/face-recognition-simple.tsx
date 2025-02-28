import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Check, 
  AlertOctagon, 
  Mail,
  Beaker
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { recognizeFacesFromImage, getSuggestedEmails, getFaceCoordinates } from '../utils/apiService';
import { Asset } from 'expo-asset';

// テスト用のモックレスポンス
const MOCK_SUCCESS_RESPONSE = {
  status: 'success',
  message: 'Face(s) recognized successfully',
  timestamp: new Date().toISOString(),
  faces: [
    {
      face_id: 'mock-face-1',
      similarity: 98.5,
      member_info: {
        FaceId: 'mock-face-1',
        Email: 'test.user1@example.com',
        Name: 'Test User 1',
        Department: 'Engineering',
        BoundingBox: {
          Width: 0.2,
          Height: 0.3,
          Left: 0.4,
          Top: 0.2
        }
      }
    },
    {
      face_id: 'mock-face-2',
      similarity: 95.2,
      member_info: {
        FaceId: 'mock-face-2',
        Email: 'test.user2@example.com',
        Name: 'Test User 2',
        Department: 'Marketing',
        BoundingBox: {
          Width: 0.2,
          Height: 0.3,
          Left: 0.7,
          Top: 0.2
        }
      }
    }
  ]
};

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

export default function FaceRecognitionSimpleScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [suggestedEmails, setSuggestedEmails] = useState<string[]>([]);
  const [faceCoordinates, setFaceCoordinates] = useState<any[]>([]);
  const [detectionsVisible, setDetectionsVisible] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [apiDebugMode, setApiDebugMode] = useState(false);
  
  // 写真を選択
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setRecognitionResult(null);
      setSuggestedEmails([]);
      setFaceCoordinates([]);
      
      // 画像が選択されたら自動的に顔認識を実行
      processImage(result.assets[0].uri);
    }
  };

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
      setRecognitionResult(null);
      setSuggestedEmails([]);
      setFaceCoordinates([]);
      
      // 写真を撮影したら自動的に顔認識を実行
      processImage(result.assets[0].uri);
    }
  };

  // テスト画像を使用
  const useTestImage = async () => {
    try {
      setIsProcessing(true);
      
      // テスト画像のパスを指定（JPEGフォーマットを使用）
      const asset = Asset.fromModule(require('../assets/images/test-image.jpeg'));
      await asset.downloadAsync();
      
      if (asset.localUri) {
        setImageUri(asset.localUri);
        setRecognitionResult(null);
        setSuggestedEmails([]);
        setFaceCoordinates([]);
        
        // テスト画像をロードしたら自動的に顔認識を実行
        processImage(asset.localUri);
      } else {
        throw new Error('テスト画像の読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Test image error:', error);
      Alert.alert(
        'エラー',
        'テスト画像の読み込みに失敗しました。以下を確認してください：\n\n1. assets/images/test-image.jpegが存在すること\n2. 画像形式がJPEGであること'
      );
      setIsProcessing(false);
    }
  };

  // 画像を処理して最適化する関数
  const optimizeImage = async (uri: string) => {
    try {
      // 画像をリサイズして品質を下げる
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // 幅800pxにリサイズ（高さは自動計算）
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70%品質のJPEG
      );
      
      return manipResult.uri;
    } catch (error) {
      console.error('Image optimization error:', error);
      return uri; // 最適化に失敗した場合は元の画像を返す
    }
  };

  // 顔認識処理
  const processImage = async (uri: string) => {
    if (!uri) {
      Alert.alert('画像を選択してください');
      return;
    }
    
    try {
      setIsProcessing(true);
      setDebugInfo('');
      
      let response;
      
      if (useMockData) {
        // モックデータを使用
        await new Promise(resolve => setTimeout(resolve, 1500)); // 処理時間をシミュレート
        response = MOCK_SUCCESS_RESPONSE;
      } else {
        // 実際のAPI呼び出し
        // 画像を最適化
        const optimizedUri = await optimizeImage(uri);
        
        // MIMEタイプを取得
        const mimeType = await getMimeType(optimizedUri);
        
        // 画像をBase64に変換
        const base64Image = await FileSystem.readAsStringAsync(optimizedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // デバッグ情報を追加
        const imageSizeKB = (base64Image.length * 0.75 / 1024).toFixed(2);
        setDebugInfo(`画像サイズ: ${imageSizeKB} KB\nMIMEタイプ: ${mimeType}`);
        
        if (apiDebugMode) {
          // APIデバッグモードの場合、Base64データの一部を表示
          const base64Prefix = base64Image.substring(0, 50);
          const base64Suffix = base64Image.substring(base64Image.length - 20);
          setDebugInfo(prev => `${prev}\n\nBase64プレフィックス: ${base64Prefix}...\nBase64サフィックス: ...${base64Suffix}`);
        }
        
        // 顔認識APIを呼び出し
        const dataToSend = `data:${mimeType};base64,${base64Image}`;
        response = await recognizeFacesFromImage(dataToSend);
      }
      
      setRecognitionResult(response);
      
      if (response.status === 'success' && response.faces.length > 0) {
        // メールアドレスの提案を取得
        const emails = getSuggestedEmails(response.faces);
        setSuggestedEmails(emails);
        
        // 顔の座標を取得
        const coordinates = getFaceCoordinates(response.faces);
        setFaceCoordinates(coordinates);
      } else if (!useMockData) {
        // APIで顔が検出されなかった場合、ユーザーに通知
        Alert.alert(
          '顔が検出されませんでした',
          '画像に顔が写っていないか、検出できない状態です。別の画像を試すか、モックデータを使用してテストしてください。',
          [
            { text: 'キャンセル', style: 'cancel' },
            {
              text: 'モックデータを使用',
              onPress: () => {
                setUseMockData(true);
                processImage(uri);
              }
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('Face recognition error:', error);
      // エラー内容をデバッグ情報に追加
      setDebugInfo(prev => prev + `\n\nエラー詳細: ${error instanceof Error ? error.message : String(error)}`);
      
      Alert.alert(
        'エラー',
        '顔認識処理中にエラーが発生しました。モックデータを使用しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'モックデータを使用',
            onPress: () => {
              setUseMockData(true);
              processImage(uri);
            }
          }
        ]
      );
    } finally {
      setIsProcessing(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>顔認識テスト</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>テスト方法</Text>
          <Text style={styles.instructionText}>
            1. 写真を撮影するか選択してください{'\n'}
            2. 自動的に顔認識を行います{'\n'}
            3. 検出された顔とメールアドレスが表示されます
          </Text>
          
          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.mockDataText}>モックデータを使用:</Text>
              <Switch
                value={useMockData}
                onValueChange={setUseMockData}
                trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                thumbColor={useMockData ? '#10B981' : '#F1F5F9'}
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text style={styles.mockDataText}>APIデバッグモード:</Text>
              <Switch
                value={apiDebugMode}
                onValueChange={setApiDebugMode}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={apiDebugMode ? '#3B82F6' : '#F1F5F9'}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
              {renderFaceBoxes()}
              
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="large" />
                  <Text style={styles.processingText}>顔を認識中...</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => {
                  setImageUri(null);
                  setRecognitionResult(null);
                  setSuggestedEmails([]);
                  setFaceCoordinates([]);
                }}
              >
                <Text style={styles.changeImageText}>写真を変更</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={takePhoto}
              >
                <Camera size={32} {...{color: "#3B82F6"} as any} />
                <Text style={styles.uploadOptionText}>写真を撮影</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={pickImage}
              >
                <Upload size={32} {...{color: "#3B82F6"} as any} />
                <Text style={styles.uploadOptionText}>画像を選択</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadOption, styles.testOption]}
                onPress={useTestImage}
              >
                <Beaker size={32} {...{color: "#10B981"} as any} />
                <Text style={[styles.uploadOptionText, {color: "#10B981"}]}>テスト画像を使用（JPEG）</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {faceCoordinates.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Check size={24} {...{color: "#10B981"} as any} />
              <Text style={styles.resultTitle}>
                {faceCoordinates.length}人の顔を検出しました
                {useMockData && <Text style={{ fontSize: 12, fontWeight: '500', color: '#64748B', fontStyle: 'italic' }}>（モック）</Text>}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setDetectionsVisible(!detectionsVisible)}
            >
              <Text style={styles.toggleButtonText}>
                {detectionsVisible ? '顔の枠を非表示' : '顔の枠を表示'}
              </Text>
            </TouchableOpacity>
            
            {suggestedEmails.length > 0 && (
              <View style={styles.emailSection}>
                <View style={styles.emailHeader}>
                  <Mail size={20} {...{color: "#3B82F6"} as any} />
                  <Text style={styles.emailHeaderText}>検出されたメールアドレス</Text>
                </View>
                
                {suggestedEmails.map((email, index) => (
                  <View key={`email-${index}`} style={styles.emailItem}>
                    <Text style={styles.emailText}>{email}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {recognitionResult && (
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => 
                  Alert.alert(
                    '詳細情報',
                    `検出顔数: ${faceCoordinates.length}\n` +
                    `メールアドレス: ${suggestedEmails.length > 0 ? suggestedEmails.join(', ') : 'なし'}\n` +
                    `ステータス: ${recognitionResult.status}\n` +
                    `メッセージ: ${recognitionResult.message}` +
                    (useMockData ? '\n\n※注意: これはモックデータです' : '')
                  )
                }
              >
                <Text style={styles.detailsButtonText}>詳細を表示</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {recognitionResult && recognitionResult.faces.length === 0 && (
          <View style={styles.errorResultSection}>
            <View style={styles.resultHeader}>
              <AlertOctagon size={24} {...{color: "#EF4444"} as any} />
              <Text style={styles.errorResultTitle}>
                顔が検出されませんでした
              </Text>
            </View>
            <Text style={styles.errorResultText}>
              別の写真で試してみてください。顔がはっきり映っている写真が最適です。
            </Text>
            <TouchableOpacity
              style={styles.mockDataButton}
              onPress={() => {
                setUseMockData(true);
                if (imageUri) {
                  processImage(imageUri);
                }
              }}
            >
              <Text style={styles.mockDataButtonText}>モックデータでテスト</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* APIトラブルシューティングセクション */}
        {!useMockData && (
          <View style={styles.troubleshootingSection}>
            <Text style={styles.troubleshootingTitle}>APIエラー対策</Text>
            <Text style={styles.troubleshootingText}>
              400エラーが発生した場合、以下の対策を試してください:
            </Text>
            
            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>1. 画像サイズを縮小</Text>
              <TouchableOpacity
                style={styles.troubleshootingButton}
                onPress={async () => {
                  if (!imageUri) return;
                  const optimizedUri = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ resize: { width: 500 } }],
                    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
                  );
                  setImageUri(optimizedUri.uri);
                  Alert.alert('画像を縮小しました', '画像サイズを縮小しました。再度テストしてください。');
                }}
              >
                <Text style={styles.troubleshootingButtonText}>画像を縮小して再試行</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>2. フォーマットをJPEGに変換</Text>
              <TouchableOpacity
                style={styles.troubleshootingButton}
                onPress={async () => {
                  if (!imageUri) return;
                  const jpegUri = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [],
                    { format: ImageManipulator.SaveFormat.JPEG }
                  );
                  setImageUri(jpegUri.uri);
                  Alert.alert('JPEGに変換しました', 'フォーマットをJPEGに変換しました。再度テストしてください。');
                }}
              >
                <Text style={styles.troubleshootingButtonText}>JPEGに変換して再試行</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>3. モックデータを使用する</Text>
              <TouchableOpacity
                style={styles.troubleshootingButton}
                onPress={() => {
                  setUseMockData(true);
                  if (imageUri) {
                    processImage(imageUri);
                  }
                }}
              >
                <Text style={styles.troubleshootingButtonText}>モックデータに切り替え</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* デバッグ情報表示 */}
        {debugInfo ? (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>デバッグ情報:</Text>
            <Text style={styles.debugText}>{debugInfo}</Text>
          </View>
        ) : null}
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
    marginBottom: 16,
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
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mockDataText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  imageSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    flexWrap: 'wrap',
  },
  uploadOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    margin: 6,
  },
  testOption: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  uploadOptionText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  resultSection: {
    marginBottom: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  toggleButton: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    color: '#047857',
    fontWeight: '500',
  },
  emailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  emailItem: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#2563EB',
  },
  detailsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  detailsButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  errorResultSection: {
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
  },
  errorResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  errorResultText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#B91C1C',
    marginBottom: 16,
  },
  mockDataButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  mockDataButtonText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  debugSection: {
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1E40AF',
    lineHeight: 18,
  },
  troubleshootingSection: {
    marginBottom: 16,
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
  },
  troubleshootingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 8,
  },
  troubleshootingText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 16,
  },
  tipContainer: {
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 8,
  },
  troubleshootingButton: {
    backgroundColor: '#FDE68A',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  troubleshootingButtonText: {
    color: '#92400E',
    fontWeight: '500',
  },
}); 