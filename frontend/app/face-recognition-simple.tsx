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
  Beaker,
  Image as ImageIcon,
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
  const [stampedImage, setStampedImage] = useState<string | null>(null);
  
  // Available stamp options
  const [selectedStamp, setSelectedStamp] = useState<number>(0);
  const stamps = [
    require('../assets/stamps/star.png'),
    require('../assets/stamps/heart.png'),
    require('../assets/stamps/smile.png'),
    require('../assets/stamps/crown.png'),
  ];
  
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
      setImageUri(uri);
      setSuggestedEmails([]);
      setFaceCoordinates([]);
      setStampedImage(null);
      
      // ファイル情報の取得
      console.log('Checking file at URI:', uri);
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists || !fileInfo.isDirectory === false) {
        console.error('File does not exist or is a directory:', uri);
        throw new Error('指定されたファイルが存在しないか、ディレクトリです');
      }
      
      console.log('File exists, size:', fileInfo.size);
      
      // 画像サイズの確認 - 10MB以上の場合は警告
      if (fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
        Alert.alert(
          '画像サイズが大きすぎます',
          '10MB以下の画像を選択してください。大きな画像はAPIエラーの原因となる可能性があります。'
        );
        setIsProcessing(false);
        return;
      }
      
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
      const result = await recognizeFacesFromImage(`data:${mimeType};base64,${base64Image}`);
      setRecognitionResult(result);
      
      if (result.status === 'success' && result.faces.length > 0) {
        console.log('Faces detected:', result.faces.length);
        // メールアドレスの提案を取得
        const emails = getSuggestedEmails(result.faces);
        setSuggestedEmails(emails);
        
        // 顔の座標を取得
        const coordinates = getFaceCoordinates(result.faces);
        setFaceCoordinates(coordinates);
        
        // Apply stamps to the detected faces
        await applyStampsToFaces(uri, coordinates);
        
        // Show success feedback
        Alert.alert(
          '顔認識完了', 
          `${coordinates.length}人の顔を検出しました。${emails.length}人のメールアドレスが見つかりました。`
        );
      } else {
        console.log('No faces detected or API returned error');
        Alert.alert(
          '顔認識失敗', 
          '画像から顔を検出できませんでした。別の画像を試してください。'
        );
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

  // 顔の上にスタンプを適用する関数
  const applyStampsToFaces = async (imageUri: string, faceCoordinates: any[]) => {
    try {
      // Note: In a real implementation, you would use a library like react-native-image-editor
      // or send the image to a server for processing.
      
      // For this prototype, we'll simulate the stamping by showing the original image
      // with overlay stamps in the UI
      setStampedImage(imageUri);
      
      // In a real implementation, this function would:
      // 1. Load the original image
      // 2. For each face coordinate, overlay a stamp image
      // 3. Save the modified image and return its URI
      
    } catch (error) {
      console.error('Error applying stamps:', error);
    }
  };
  
  // Toggle between stamped and original image
  const toggleStampedImage = () => {
    setDetectionsVisible(!detectionsVisible);
  };
  
  // Change the selected stamp
  const nextStamp = () => {
    setSelectedStamp((prev) => (prev + 1) % stamps.length);
  };
  
  // 顔の枠を描画
  const renderFaceBoxes = () => {
    if (!detectionsVisible || !imageUri || faceCoordinates.length === 0) {
      return null;
    }
    
    return faceCoordinates.map((face, index) => {
      // Calculate the position and size as numbers between 0-1
      const left = face.boundingBox.left;
      const top = face.boundingBox.top;
      const width = face.boundingBox.width;
      const height = face.boundingBox.height;
      
      return (
        <View
          key={`face-${index}`}
          style={[
            styles.faceOverlay,
            {
              left: `${left * 100}%`,
              top: `${top * 100}%`,
              width: `${width * 100}%`,
              height: `${height * 100}%`,
            } as any
          ]}
        >
          {/* Display stamp instead of box for the detected face */}
          <Image
            source={stamps[selectedStamp]}
            style={styles.stampImage}
            resizeMode="contain"
          />
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>顔認識</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mainContent}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: stampedImage || imageUri }}
                style={styles.selectedImage}
                resizeMode="contain"
              />
              {renderFaceBoxes()}
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Camera size={48} color="#94A3B8" />
              <Text style={styles.placeholderText}>
                カメラで撮影するか、画像をアップロードしてください
              </Text>
            </View>
          )}
          
          {/* コントロールパネル */}
          {imageUri && (
            <View style={styles.controlPanel}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleStampedImage}
              >
                <ImageIcon size={24} color="#3B82F6" />
                <Text style={styles.controlButtonText}>
                  {detectionsVisible ? 'スタンプを非表示' : 'スタンプを表示'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={nextStamp}
              >
                <Image
                  source={stamps[selectedStamp]}
                  style={styles.stampPreview}
                />
                <Text style={styles.controlButtonText}>
                  スタンプ変更
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* 結果表示 */}
          {suggestedEmails.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                検出された連絡先 ({suggestedEmails.length})
              </Text>
              {suggestedEmails.map((email, index) => (
                <View key={`email-${index}`} style={styles.emailItem}>
                  <Mail size={16} color="#3B82F6" />
                  <Text style={styles.emailText}>{email}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* 画像選択・撮影ボタン */}
      <View style={styles.buttonContainer}>
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>顔認識処理中...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={pickImage}
            >
              <Upload size={20} color="#3B82F6" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                画像を選択
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={takePhoto}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                カメラで撮影
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {imageUri && suggestedEmails.length > 0 && (
        <View style={styles.doneButtonContainer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={returnResults}
          >
            <Text style={styles.doneButtonText}>認識結果を使用</Text>
          </TouchableOpacity>
        </View>
      )}
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
  mainContent: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  controlButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  stampPreview: {
    width: 24,
    height: 24,
  },
  faceOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampImage: {
    width: '100%',
    height: '100%',
  },
  resultsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  emailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#3B82F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  doneButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  doneButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});