import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { ArrowLeft, Camera, Check, AlertOctagon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { recognizeFacesFromImage, getSuggestedEmails, getFaceCoordinates } from '../utils/apiService';

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

export default function FaceRecognitionTestScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    details: string;
  } | null>(null);

  // 写真を選択
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setTestResults(null); // リセット
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
      setTestResults(null); // リセット
    }
  };

  // テスト実行
  const runTest = async () => {
    if (!imageUri) {
      Alert.alert('画像を選択してください');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // MIMEタイプを取得
      const mimeType = await getMimeType(imageUri);
      
      // 画像をBase64に変換
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // 顔認識APIを呼び出し
      const response = await recognizeFacesFromImage(`data:${mimeType};base64,${base64Image}`);
      
      // 結果をフォーマット
      let details = '';
      
      if (response.status === 'success' && response.faces.length > 0) {
        // メールアドレスの提案
        const emails = getSuggestedEmails(response.faces);
        
        // 顔の座標
        const coordinates = getFaceCoordinates(response.faces);
        
        details = `検出された顔: ${response.faces.length}人\n\n`;
        
        if (emails.length > 0) {
          details += `検出されたメールアドレス:\n${emails.join('\n')}\n\n`;
        }
        
        details += `詳細情報:\n`;
        response.faces.forEach((face, index) => {
          details += `\n顔 #${index + 1}:\n`;
          details += `- FaceID: ${face.face_id}\n`;
          details += `- 類似度: ${face.similarity}%\n`;
          
          if (face.member_info) {
            Object.keys(face.member_info).forEach(key => {
              if (key !== 'BoundingBox') {
                const value = face.member_info[key].S || face.member_info[key].N || JSON.stringify(face.member_info[key]);
                details += `- ${key}: ${value}\n`;
              }
            });
          }
        });
        
        setTestResults({
          success: true,
          message: '顔認識テスト成功',
          details,
        });
      } else {
        setTestResults({
          success: false,
          message: '顔が検出されませんでした',
          details: `ステータス: ${response.status}\nメッセージ: ${response.message}`,
        });
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({
        success: false,
        message: 'テスト中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー',
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
        <Text style={styles.headerTitle}>顔認識テスト</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ステップ 1: 画像を選択</Text>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={pickImage}
            >
              <Text style={styles.imageButtonText}>画像を選択</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={takePhoto}
            >
              <Camera size={20} {...{color: "#FFFFFF"} as any} />
              <Text style={styles.imageButtonText}>写真を撮影</Text>
            </TouchableOpacity>
          </View>
          
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ステップ 2: 顔認識をテスト</Text>
          <TouchableOpacity
            style={[
              styles.testButton,
              (!imageUri || isProcessing) && styles.disabledButton
            ]}
            onPress={runTest}
            disabled={!imageUri || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Check size={20} {...{color: "#FFFFFF"} as any} />
            )}
            <Text style={styles.testButtonText}>
              {isProcessing ? '処理中...' : 'テスト実行'}
            </Text>
          </TouchableOpacity>
        </View>

        {testResults && (
          <View style={[
            styles.resultSection,
            testResults.success ? styles.successResult : styles.errorResult
          ]}>
            <View style={styles.resultHeader}>
              {testResults.success ? (
                <Check size={24} {...{color: "#10B981"} as any} />
              ) : (
                <AlertOctagon size={24} {...{color: "#EF4444"} as any} />
              )}
              <Text style={[
                styles.resultTitle,
                testResults.success ? styles.successText : styles.errorText
              ]}>
                {testResults.message}
              </Text>
            </View>
            <Text style={styles.resultDetails}>
              {testResults.details}
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
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginTop: 16,
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  resultSection: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  successResult: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  errorResult: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  successText: {
    color: '#10B981',
  },
  errorText: {
    color: '#EF4444',
  },
  resultDetails: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
}); 