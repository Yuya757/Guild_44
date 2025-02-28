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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
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
import { recognizeFacesFromImage, getSuggestedEmails, getFaceCoordinates } from '../utils/apiService';
import { Asset } from 'expo-asset';

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
  // ルートパラメータを取得
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string;
  const initialImageUri = params.imageUri as string;
  
  const [imageUri, setImageUri] = useState<string | null>(initialImageUri || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [suggestedEmails, setSuggestedEmails] = useState<string[]>([]);
  const [faceCoordinates, setFaceCoordinates] = useState<any[]>([]);
  const [detectionsVisible, setDetectionsVisible] = useState(true);
  
  // 初期画像がある場合は自動的に処理
  useEffect(() => {
    if (initialImageUri) {
      processImage(initialImageUri);
    }
  }, [initialImageUri]);
  
  // 結果を前の画面に返す
  const returnResults = () => {
    if (!returnTo) {
      router.back();
      return;
    }
    
    // 検出された顔の情報から連絡先データを作成
    const contacts = suggestedEmails.map((email, index) => ({
      id: `face-${index}`,
      name: `検出された人物 ${index + 1}`,
      email: email,
      avatarUrl: imageUri
    }));
    
    // 前の画面に戻る
    router.push({
      pathname: returnTo as any,
      params: {
        recognizedFaces: JSON.stringify(contacts)
      }
    });
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
      setRecognitionResult(null);
      setSuggestedEmails([]);
      setFaceCoordinates([]);
      
      try {
        await processImage(result.assets[0].uri); // await を追加
      } catch (error) {
        console.error('Error processing image:', error);
        Alert.alert('エラー', '画像の処理中にエラーが発生しました。');
      }
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
      console.log('Using ImagePicker instead of test image due to asset issues');
      
      // 画像ピッカーを起動して、ユーザーに画像を選択してもらう
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        console.log('Selected image URI:', selectedUri);
        
        setImageUri(selectedUri);
        setRecognitionResult(null);
        setSuggestedEmails([]);
        setFaceCoordinates([]);
        
        try {
          await processImage(selectedUri);
        } catch (processError) {
          console.error('Error processing image:', processError);
          Alert.alert(
            'エラー',
            '画像の処理中にエラーが発生しました。再試行してください。'
          );
        }
      } else {
        console.log('Image selection cancelled');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'エラー',
        '画像の選択中にエラーが発生しました。再試行してください。'
      );
      setIsProcessing(false);
    }
  };

  const processImage = async (uri: string) => {
    if (!uri) {
      Alert.alert('画像を選択してください');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // ファイル情報の取得
      console.log('Checking file at URI:', uri);
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists || !fileInfo.isDirectory === false) {
        console.error('File does not exist or is a directory:', uri);
        throw new Error('指定されたファイルが存在しないか、ディレクトリです');
      }
      
      console.log('File exists, size:', fileInfo.size);
      
      // MIMEタイプを取得
      const mimeType = await getMimeType(uri);
      console.log('MIME type:', mimeType);
      
      // 画像をBase64に変換
      console.log('Reading file as base64...');
      const base64Image = await FileSystem.readAsStringAsync(uri, {
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
        setSuggestedEmails(emails);
        
        // 顔の座標を取得
        const coordinates = getFaceCoordinates(response.faces);
        setFaceCoordinates(coordinates);
      } else {
        console.log('No faces detected or API returned error');
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
                <Text style={[styles.uploadOptionText, {color: "#10B981"}]}>ギャラリーから選択</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {suggestedEmails.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Check size={24} {...{color: "#10B981"} as any} />
              <Text style={styles.resultTitle}>
                {suggestedEmails.length}人の顔を検出しました
              </Text>
            </View>
            
            {/* <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setDetectionsVisible(!detectionsVisible)}
            >
              <Text style={styles.toggleButtonText}>
                {detectionsVisible ? '顔の枠を非表示' : '顔の枠を表示'}
              </Text>
            </TouchableOpacity> */}
            
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
                    `メッセージ: ${recognitionResult.message}`
                  )
                }
              >
                <Text style={styles.detailsButtonText}>詳細を表示</Text>
              </TouchableOpacity>
            )}
            
            {returnTo && (
              <TouchableOpacity
                style={styles.returnButton}
                onPress={returnResults}
              >
                <Text style={styles.returnButtonText}>結果を使用して戻る</Text>
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
  },
  returnButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  returnButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
});