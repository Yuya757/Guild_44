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
  Modal,
  Clipboard,
  SafeAreaView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Check, 
  AlertOctagon, 
  Mail,
  Beaker,
  Code,
  Copy,
  X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { recognizeFacesFromImage, getSuggestedEmails, getFaceCoordinates } from '../utils/apiService';
import { Asset } from 'expo-asset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

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
        Email: {S: 'test.user1@example.com'},
        Name: {S: 'Test User 1'},
        Department: {S: 'Engineering'},
        BoundingBox: {
          M: {
            Width: {N: '0.2'},
            Height: {N: '0.3'},
            Left: {N: '0.4'},
            Top: {N: '0.2'}
          }
        }
      }
    },
    {
      face_id: 'mock-face-2',
      similarity: 95.2,
      member_info: {
        FaceId: 'mock-face-2',
        Email: {S: 'test.user2@example.com'},
        Name: {S: 'Test User 2'},
        Department: {S: 'Marketing'},
        BoundingBox: {
          M: {
            Width: {N: '0.2'},
            Height: {N: '0.3'},
            Left: {N: '0.7'},
            Top: {N: '0.2'}
          }
        }
      }
    }
  ]
};

// モックデータのパターン
const MOCK_NO_FACE_RESPONSE = {
  status: 'success',
  message: 'No faces recognized',
  timestamp: new Date().toISOString(),
  faces: []
};

const MOCK_ERROR_RESPONSE = {
  status: 'error',
  message: 'An error occurred during face recognition',
  timestamp: new Date().toISOString(),
  faces: []
};

// 利用可能なモックデータパターン
const MOCK_PATTERNS = [
  { id: 'success', name: '成功（顔2つ）', data: MOCK_SUCCESS_RESPONSE },
  { id: 'noface', name: '成功（顔なし）', data: MOCK_NO_FACE_RESPONSE },
  { id: 'error', name: 'エラー', data: MOCK_ERROR_RESPONSE }
];

/**
 * AWS Rekognitionの精度向上のための実装提案
 * 
 * 1. 閾値(threshold)の最適化
 *    - 現在の閾値（80.0）は調整可能。低すぎると誤検出が増え、高すぎると検出漏れが増加
 *    - 70.0〜90.0の範囲で段階的にテストすることを推奨
 * 
 * 2. 画像前処理の強化
 *    - グレースケール変換による色情報の正規化
 *    - ヒストグラム平坦化によるコントラスト強調
 *    - ガウシアンブラーによるノイズ除去
 * 
 * 3. 複数の検出結果の統合
 *    - 異なる閾値で複数回検出を行い、結果を統合
 *    - 低閾値での検出結果をフィルタリングして精度向上
 * 
 * 4. Rekognition APIのパラメータ最適化
 *    - FaceMatchThreshold: 類似度の閾値
 *    - MaxFaces: 検出する最大顔数（デフォルト=1）を適切に設定
 *    - QualityFilter: 品質フィルターを調整(NONE/LOW/MEDIUM/HIGH)
 * 
 * 5. コレクションの更新と拡充
 *    - 同一人物の複数アングル・異なる表情・照明条件での登録
 *    - 定期的なコレクションの更新（新しい写真の追加）
 */

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
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [suggestedEmails, setSuggestedEmails] = useState<string[]>([]);
  const [faceCoordinates, setFaceCoordinates] = useState<any[]>([]);
  const [detectionsVisible, setDetectionsVisible] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [apiDebugMode, setApiDebugMode] = useState(false);
  const [selectedMockPattern, setSelectedMockPattern] = useState('success');
  const [developerMode, setDeveloperMode] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('');
  const [requestData, setRequestData] = useState<any>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [threshold, setThreshold] = useState(80);
  const [maxFaces, setMaxFaces] = useState(5);
  const [qualityFilter, setQualityFilter] = useState<string>('AUTO');
  
  // モックデータの取得
  const getMockResponse = () => {
    const pattern = MOCK_PATTERNS.find(p => p.id === selectedMockPattern);
    return pattern ? pattern.data : MOCK_SUCCESS_RESPONSE;
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

  // モックデータで表示
  const showWithMockData = async () => {
    try {
      setIsProcessing(true);
      setUseMockData(true);
      
      // モックレスポンスの表示のみを行う場合はimageUriがなくても処理できるようにする
      if (!imageUri) {
        // テスト画像があればそれを使用
        try {
          const asset = Asset.fromModule(require('../assets/images/test-image.jpeg'));
          await asset.downloadAsync();
          if (asset.localUri) {
            setImageUri(asset.localUri);
          }
        } catch (error) {
          console.log('テスト画像の読み込みに失敗しましたが、モックデータの表示は継続します');
        }
      }
      
      // 処理時間をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 選択されたモックパターンを取得
      const mockResponse = getMockResponse();
      setRecognitionResult(mockResponse);
      
      if (mockResponse.status === 'success' && mockResponse.faces.length > 0) {
        const emails = getSuggestedEmails(mockResponse.faces);
        setSuggestedEmails(emails);
        
        const coordinates = getFaceCoordinates(mockResponse.faces);
        setFaceCoordinates(coordinates);
      } else {
        setSuggestedEmails([]);
        setFaceCoordinates([]);
      }
      
      setDebugInfo('モックデータを使用: ' + selectedMockPattern);
      
    } catch (error) {
      console.error('Mock data error:', error);
      setDebugInfo('モックデータ表示エラー: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  // APIリクエストとレスポンスをクリップボードにコピー
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('コピー完了', 'データをクリップボードにコピーしました');
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
      setRawApiResponse(null);
      setApiStatus('');
      
      let response;
      
      if (useMockData) {
        // モックデータを使用
        await new Promise(resolve => setTimeout(resolve, 1500)); // 処理時間をシミュレート
        response = getMockResponse();
        setRawApiResponse(response);
        setApiStatus('模擬レスポンス (モックデータ)');
        setRequestData(null);
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
        
        // リクエストデータを保存（開発者モード用）
        if (developerMode) {
          const requestInfo = {
            url: 'https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': '***API_KEY***' // セキュリティのため実際のキーは表示しない
            },
            body: {
              image_base64str: 'BASE64_DATA_OMITTED', // 長すぎるので省略
              threshold: threshold,
              maxFaces: maxFaces,
              qualityFilter: qualityFilter
            }
          };
          setRequestData(requestInfo);
        }
        
        // APIリクエスト実行（カスタム版）
        // 認識パラメータを追加
        const recognitionConfig = {
          threshold: threshold,
          maxFaces: maxFaces,
          qualityFilter: qualityFilter
        };
        
        const { response: apiResponse, statusCode, responseData } = 
          await sendApiRequestWithDetails(dataToSend, recognitionConfig);
        
        // APIステータスを設定
        setApiStatus(`HTTP ${statusCode} ${statusCode === 200 ? 'OK' : 'Error'}`);
        
        // 生APIレスポンスを設定（開発者モード用）
        setRawApiResponse(responseData);
        
        response = apiResponse;
      }
      
      setRecognitionResult(response);
      
      if (response && response.status === 'success' && response.faces && response.faces.length > 0) {
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
      
      // エラー情報をRawResponseにも保存
      setRawApiResponse({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setApiStatus('Error');
      
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

  // 詳細なAPIリクエスト処理（ステータスコードなどの情報を含む）
  const sendApiRequestWithDetails = async (base64Image: string, config?: any) => {
    try {
      // Constantsからの設定読み込み（apiService.tsのロジックを一部複製）
      const apiUrl = 'https://62az2hs957.execute-api.ap-northeast-1.amazonaws.com/prod/search';
      const apiKey = 'dSOovEKqYwgehvBr24g57tWpqJn1DfManBOt1WXd';

      // Base64文字列からデータ部分のみを抽出
      const base64Data = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;

      // 認識設定をリクエストボディに追加
      const requestBody = {
        image_base64str: base64Data,
        threshold: config?.threshold || 80.0,
        maxFaces: config?.maxFaces || 5,
        qualityFilter: config?.qualityFilter || 'AUTO'
      };
      
      // fetch APIで詳細な情報を取得
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      // レスポンスのステータスコード
      const statusCode = fetchResponse.status;
      
      // レスポンスの本文を取得
      let responseText = await fetchResponse.text();
      let responseData;
      
      try {
        // JSONとしてパース
        responseData = JSON.parse(responseText);
      } catch (e) {
        // JSONパースに失敗した場合は生テキストを使用
        responseData = { rawText: responseText };
      }
      
      if (!fetchResponse.ok) {
        throw new Error(`API request failed ${statusCode}: ${responseText}`);
      }

      // 成功レスポンスを返す
      return {
        response: responseData,
        statusCode,
        responseData,
        headers: Object.fromEntries(fetchResponse.headers.entries())
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      // エラー情報を含めて返す
      return {
        response: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          faces: []
        },
        statusCode: 500,
        responseData: {
          error: error instanceof Error ? error.message : String(error)
        },
        headers: {}
      };
    }
  };

  // 顔の枠を描画
  const renderFaceBoxes = () => {
    if (!faceCoordinates || !faceCoordinates.length || !detectionsVisible) return null;
    
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
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} {...{color: "#0F172A"} as any} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>顔認識テスト</Text>
        <TouchableOpacity
          style={styles.devModeButton}
          onPress={() => setDeveloperMode(!developerMode)}
        >
          <Code size={20} {...{color: developerMode ? "#3B82F6" : "#94A3B8"} as any} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 開発者モードの表示 */}
        {developerMode && (
          <View style={styles.devSection}>
            <View style={styles.devSectionHeader}>
              <Text style={styles.devSectionTitle}>開発者モード</Text>
              <TouchableOpacity
                style={styles.devModeToggle}
                onPress={() => setDeveloperMode(false)}
              >
                <Text style={styles.devModeToggleText}>非表示</Text>
              </TouchableOpacity>
            </View>
            
            {apiStatus && (
              <View style={styles.devStatusContainer}>
                <Text style={styles.devStatusLabel}>APIステータス:</Text>
                <Text style={[
                  styles.devStatusValue,
                  apiStatus.includes('200') ? styles.devStatusSuccess : 
                  apiStatus.includes('模擬') ? styles.devStatusMock : styles.devStatusError
                ]}>
                  {apiStatus}
                </Text>
              </View>
            )}
            
            {rawApiResponse && (
              <TouchableOpacity
                style={styles.viewResponseButton}
                onPress={() => setResponseModalVisible(true)}
              >
                <Text style={styles.viewResponseButtonText}>APIレスポンスを表示</Text>
              </TouchableOpacity>
            )}
            
            {/* リクエスト情報表示 */}
            {requestData && (
              <View style={styles.requestInfoContainer}>
                <Text style={styles.requestInfoTitle}>リクエスト情報:</Text>
                <Text style={styles.requestInfoText}>URL: {requestData.url}</Text>
                <Text style={styles.requestInfoText}>Method: {requestData.method}</Text>
                <Text style={styles.requestInfoText}>Headers: {JSON.stringify(requestData.headers)}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(JSON.stringify(requestData))}
                >
                  <Copy size={16} {...{color: "#3B82F6"} as any} />
                  <Text style={styles.copyButtonText}>リクエスト情報をコピー</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* モックデータセクション */}
        <View style={styles.mockSection}>
          <Text style={styles.sectionTitle}>モックデータテスト</Text>
          <Text style={styles.instructionText}>
            APIと接続せずにUIテストを行うためのモックデータを使用できます。
          </Text>
          
          <View style={styles.mockToggleContainer}>
            <Text style={styles.mockToggleLabel}>モックデータを使用:</Text>
            <Switch
              value={useMockData}
              onValueChange={(value) => {
                setUseMockData(value);
                if (value && !recognitionResult) {
                  // モックデータに切り替えた時点でデータがなければ表示する
                  showWithMockData();
                }
              }}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={useMockData ? '#10B981' : '#F1F5F9'}
            />
          </View>
          
          {useMockData && (
            <>
              <Text style={styles.mockPatternLabel}>モックパターン:</Text>
              <View style={styles.mockPatternContainer}>
                {MOCK_PATTERNS.map((pattern) => (
                  <TouchableOpacity
                    key={pattern.id}
                    style={[
                      styles.mockPatternButton,
                      selectedMockPattern === pattern.id && styles.mockPatternButtonSelected
                    ]}
                    onPress={() => {
                      setSelectedMockPattern(pattern.id);
                      showWithMockData();
                    }}
                  >
                    <Text
                      style={[
                        styles.mockPatternButtonText,
                        selectedMockPattern === pattern.id && styles.mockPatternButtonTextSelected
                      ]}
                    >
                      {pattern.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.applyMockButton}
                onPress={showWithMockData}
              >
                <Text style={styles.applyMockButtonText}>モックデータを適用</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>テスト方法</Text>
          <Text style={styles.instructionText}>
            1. 写真を撮影するか選択してください{'\n'}
            2. 自動的に顔認識を行います{'\n'}
            3. 検出された顔とメールアドレスが表示されます
          </Text>
          
          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.mockDataText}>APIデバッグモード:</Text>
              <Switch
                value={apiDebugMode}
                onValueChange={setApiDebugMode}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={apiDebugMode ? '#3B82F6' : '#F1F5F9'}
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text style={styles.mockDataText}>高度な設定:</Text>
              <Switch
                value={showAdvancedSettings}
                onValueChange={setShowAdvancedSettings}
                trackColor={{ false: '#CBD5E1', true: '#DBEAFE' }}
                thumbColor={showAdvancedSettings ? '#3B82F6' : '#F1F5F9'}
              />
            </View>
          </View>
          
          {showAdvancedSettings && (
            <View style={styles.advancedSettingsContainer}>
              <Text style={styles.advancedSettingsTitle}>顔認識パラメータ</Text>
              
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>類似度閾値: {threshold}%</Text>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderMinMax}>低</Text>
                  <View style={styles.sliderWrapper}>
                    <Slider
                      style={styles.slider}
                      minimumValue={50}
                      maximumValue={99}
                      step={1}
                      value={threshold}
                      onValueChange={setThreshold}
                      minimumTrackTintColor="#3B82F6"
                      maximumTrackTintColor="#CBD5E1"
                      thumbTintColor="#2563EB"
                    />
                  </View>
                  <Text style={styles.sliderMinMax}>高</Text>
                </View>
                <Text style={styles.sliderHelp}>低いと検出数増加、高いと精度向上</Text>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>最大検出数:</Text>
                <View style={styles.settingButtonGroup}>
                  {[1, 3, 5, 10].map(value => (
                    <TouchableOpacity
                      key={`faces-${value}`}
                      style={[
                        styles.settingButton,
                        maxFaces === value && styles.settingButtonSelected
                      ]}
                      onPress={() => setMaxFaces(value)}
                    >
                      <Text
                        style={[
                          styles.settingButtonText,
                          maxFaces === value && styles.settingButtonTextSelected
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>品質フィルター:</Text>
                <View style={styles.settingButtonGroup}>
                  {['NONE', 'LOW', 'MEDIUM', 'HIGH', 'AUTO'].map(value => (
                    <TouchableOpacity
                      key={`quality-${value}`}
                      style={[
                        styles.settingButton,
                        qualityFilter === value && styles.settingButtonSelected
                      ]}
                      onPress={() => setQualityFilter(value)}
                    >
                      <Text
                        style={[
                          styles.settingButtonText,
                          qualityFilter === value && styles.settingButtonTextSelected
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <Text style={styles.settingHelp}>
                AUTO: 自動設定、NONE: フィルタなし、HIGH: 高品質画像のみ使用
              </Text>
            </View>
          )}
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
        
        {faceCoordinates && faceCoordinates.length > 0 && (
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
            
            {suggestedEmails && suggestedEmails.length > 0 && (
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
                    `検出顔数: ${faceCoordinates ? faceCoordinates.length : 0}\n` +
                    `メールアドレス: ${suggestedEmails && suggestedEmails.length > 0 ? suggestedEmails.join(', ') : 'なし'}\n` +
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
        
        {recognitionResult && recognitionResult.faces && recognitionResult.faces.length === 0 && (
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
            <View style={styles.errorButtonContainer}>
              <TouchableOpacity
                style={styles.backToHomeButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={16} {...{color: "#DC2626"} as any} />
                <Text style={styles.backToHomeButtonText}>前の画面に戻る</Text>
              </TouchableOpacity>
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
        
        {useMockData && (
          <View style={styles.mockIndicator}>
            <Text style={styles.mockIndicatorText}>モックモード有効</Text>
          </View>
        )}
        
        {/* APIレスポンス表示モーダル */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={responseModalVisible}
          onRequestClose={() => setResponseModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>API レスポンス詳細</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setResponseModalVisible(false)}
                >
                  <X size={20} {...{color: "#64748B"} as any} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.responseTitle}>ステータス: {apiStatus}</Text>
                
                <View style={styles.responseDataContainer}>
                  <Text style={styles.responseDataTitle}>レスポンスデータ:</Text>
                  <Text style={styles.responseDataText}>
                    {JSON.stringify(rawApiResponse, null, 2)}
                  </Text>
                </View>
                
                {recognitionResult && (
                  <View style={styles.processedDataContainer}>
                    <Text style={styles.processedDataTitle}>処理済みデータ:</Text>
                    <Text style={styles.processedDataText}>
                      - ステータス: {recognitionResult.status}{'\n'}
                      - メッセージ: {recognitionResult.message}{'\n'}
                      - 検出顔数: {recognitionResult.faces && recognitionResult.faces.length || 0}{'\n'}
                      - タイムスタンプ: {recognitionResult.timestamp}
                    </Text>
                  </View>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.copyResponseButton}
                onPress={() => copyToClipboard(JSON.stringify(rawApiResponse))}
              >
                <Copy size={18} {...{color: "#FFFFFF"} as any} />
                <Text style={styles.copyResponseButtonText}>レスポンスデータをコピー</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  errorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backToHomeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  backToHomeButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
  },
  mockDataButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
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
  mockSection: {
    marginBottom: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mockToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
  },
  mockToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
  },
  mockPatternLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#047857',
    marginBottom: 8,
  },
  mockPatternContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  mockPatternButton: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  mockPatternButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#047857',
  },
  mockPatternButtonText: {
    fontSize: 14,
    color: '#047857',
  },
  mockPatternButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  applyMockButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyMockButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  mockIndicator: {
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  mockIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  devModeButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  devSection: {
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  devSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  devSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  devModeToggle: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  devModeToggleText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  devStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
  },
  devStatusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginRight: 8,
  },
  devStatusValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  devStatusSuccess: {
    color: '#059669',
  },
  devStatusError: {
    color: '#DC2626',
  },
  devStatusMock: {
    color: '#9333EA',
    fontStyle: 'italic',
  },
  viewResponseButton: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewResponseButtonText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  requestInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  requestInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  requestInfoText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#334155',
    marginBottom: 4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  responseDataContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  responseDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  responseDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#334155',
    lineHeight: 18,
  },
  processedDataContainer: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  processedDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 8,
  },
  processedDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#064E3B',
    lineHeight: 18,
  },
  copyResponseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  copyResponseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  advancedSettingsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  advancedSettingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  slider: {
    height: 40,
  },
  sliderMinMax: {
    fontSize: 12,
    color: '#94A3B8',
    width: 24,
    textAlign: 'center',
  },
  sliderHelp: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  settingRow: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  settingButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  settingButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  settingButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  settingButtonText: {
    fontSize: 12,
    color: '#64748B',
  },
  settingButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingHelp: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
}); 