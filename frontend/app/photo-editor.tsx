import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Check, Image as ImageIcon, Trash2, Search, Zap, Mail } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { recognizeFacesFromImage, getSuggestedEmails, getFaceCoordinates } from '../utils/apiService';

const { width } = Dimensions.get('window');

// スタンプの種類
const STICKERS = [
  { id: 'emoji1', text: '😊', color: '#FFD700' },
  { id: 'emoji2', text: '😎', color: '#FF6347' },
  { id: 'emoji3', text: '🙈', color: '#4682B4' },
  { id: 'blur', text: '⬤', color: '#A9A9A9' },
];

interface Sticker {
  id: string;
  x: number;
  y: number;
  scale: number;
  type: string;
}

interface FaceCoordinate {
  faceId: string;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  }
}

export default function PhotoEditorScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedStickerType, setSelectedStickerType] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedEmails, setSuggestedEmails] = useState<string[]>([]);
  const [faceCoordinates, setFaceCoordinates] = useState<FaceCoordinate[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  // 画像が変更されたら顔認識を実行
  useEffect(() => {
    if (imageUri) {
      detectFaces();
    }
  }, [imageUri]);

  // 画像サイズの取得（必要に応じて）
  const onImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setImageSize({ width, height });
  };

  // 顔認識と処理を実行
  const detectFaces = async () => {
    if (!imageUri) return;
    
    try {
      setIsProcessing(true);
      
      // 画像をBase64に変換
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // 顔認識APIを呼び出し
      const response = await recognizeFacesFromImage(`data:image/jpeg;base64,${base64Image}`);
      
      if (response.status === 'success' && response.faces.length > 0) {
        // メールアドレスの提案を設定
        const emails = getSuggestedEmails(response.faces);
        setSuggestedEmails(emails);
        
        // 顔の座標を取得
        const coordinates = getFaceCoordinates(response.faces);
        setFaceCoordinates(coordinates);
        
        // 検出成功メッセージ
        Alert.alert(
          '顔認識成功',
          `${response.faces.length}人の顔を検出しました。`
        );
      } else {
        Alert.alert(
          '顔認識結果',
          '顔が検出されませんでした。別の画像を試してください。'
        );
      }
    } catch (error) {
      console.error('Face detection error:', error);
      Alert.alert(
        'エラー',
        '顔認識処理中にエラーが発生しました。'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // スタンプを追加
  const addSticker = (type: string) => {
    // 画像の中央に追加
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      x: imageSize.width / 2 - 25, // スタンプの半分のサイズ
      y: imageSize.height / 2 - 25, // スタンプの半分のサイズ
      scale: 1,
      type,
    };
    setStickers([...stickers, newSticker]);
    setSelectedSticker(stickers.length);
    setSelectedStickerType(null); // 選択状態をリセット
  };

  // 自動的に顔の位置にスタンプを配置
  const placeStickersOnFaces = (type: string) => {
    if (faceCoordinates.length === 0) {
      Alert.alert('顔が検出されていません', '先に画像から顔を検出してください。');
      return;
    }
    
    // 各顔に対してスタンプを配置
    const newStickers = faceCoordinates.map(face => {
      // 顔の中心にスタンプを配置
      const centerX = face.boundingBox.left * imageSize.width + (face.boundingBox.width * imageSize.width / 2) - 25;
      const centerY = face.boundingBox.top * imageSize.height + (face.boundingBox.height * imageSize.height / 2) - 25;
      
      return {
        id: `sticker-${Date.now()}-${face.faceId}`,
        x: centerX,
        y: centerY,
        scale: face.boundingBox.width * 1.5, // スタンプのサイズを顔のサイズに合わせる
        type,
      };
    });
    
    setStickers([...stickers, ...newStickers]);
    setSelectedStickerType(null);
  };

  // スタンプを選択
  const selectSticker = (index: number) => {
    setSelectedSticker(index);
  };

  // スタンプを削除
  const removeSelectedSticker = () => {
    if (selectedSticker !== null) {
      const newStickers = stickers.filter((_, index) => index !== selectedSticker);
      setStickers(newStickers);
      setSelectedSticker(null);
    }
  };

  // スタンプ用のPanResponderを作成
  const createPanResponder = (index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        selectSticker(index);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const newStickers = [...stickers];
        newStickers[index].x += dx;
        newStickers[index].y += dy;
        setStickers(newStickers);
      },
      onPanResponderRelease: () => {
        // 何もしない（必要に応じて処理を追加）
      },
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
      // 新しい画像のURIをクエリパラメータとして渡して、このページを再読み込み
      router.replace({
        pathname: '/photo-editor',
        params: { imageUri: result.assets[0].uri }
      });
    }
  };

  // 編集を完了して前のページに戻る
  const handleSave = () => {
    // 実際のアプリでは、ここでスタンプを適用した画像を保存する処理を実装
    // 今回はモックなので、成功メッセージを表示して戻るだけ
    Alert.alert(
      '編集完了',
      '写真が編集されました',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  // スタンプのレンダリング
  const renderStickers = () => {
    return stickers.map((sticker, index) => {
      const panResponder = createPanResponder(index);

      // スタンプの情報を取得
      const stickerInfo = STICKERS.find(s => s.id === sticker.type);

      return (
        <Animated.View
          key={sticker.id}
          style={[
            styles.sticker,
            {
              left: sticker.x,
              top: sticker.y,
              transform: [{ scale: sticker.scale }],
              borderWidth: selectedSticker === index ? 2 : 0,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.stickerContent, { backgroundColor: stickerInfo?.color || '#ccc' }]}>
            <Text style={styles.stickerText}>{stickerInfo?.text || '😊'}</Text>
          </View>
        </Animated.View>
      );
    });
  };

  // 顔の領域を示すボックスをレンダリング（デバッグ用）
  const renderFaceBoxes = () => {
    return faceCoordinates.map((face) => (
      <View
        key={face.faceId}
        style={[
          styles.faceBox,
          {
            left: face.boundingBox.left * imageSize.width,
            top: face.boundingBox.top * imageSize.height,
            width: face.boundingBox.width * imageSize.width,
            height: face.boundingBox.height * imageSize.height,
          },
        ]}
      />
    ));
  };

  const addEmail = () => {
    if (emailInput.trim() && !suggestedEmails.includes(emailInput)) {
      setSuggestedEmails([...suggestedEmails, emailInput]);
      setEmailInput('');
      setShowEmailInput(false);
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
        <Text style={styles.headerTitle}>写真を編集</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Check size={20} {...{color: "#10B981"} as any} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.imageContainer} onLayout={onImageLayout}>
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.processingText}>顔を認識中...</Text>
                </View>
              )}
              {/* 顔のボックスとスタンプのレンダリング */}
              {renderFaceBoxes()}
              {renderStickers()}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <ImageIcon size={48} {...{color: "#94A3B8"} as any} />
              <Text style={styles.noImageText}>画像が見つかりません</Text>
              <TouchableOpacity 
                style={styles.selectImageButton}
                onPress={pickImage}
              >
                <Text style={styles.selectImageButtonText}>画像を選択</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* メールアドレス提案セクション */}
        {imageUri && suggestedEmails.length > 0 && (
          <View style={styles.emailSuggestionContainer}>
            <View style={styles.sectionTitleRow}>
              <Mail size={16} {...{color: "#0F172A"} as any} />
              <Text style={styles.sectionTitle}>メールアドレス候補</Text>
            </View>
            <FlatList
              data={suggestedEmails}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `email-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.emailChip}>
                  <Text style={styles.emailChipText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity 
                  style={styles.addEmailButton}
                  onPress={() => setShowEmailInput(true)}
                >
                  <Text style={styles.addEmailButtonText}>+ 追加</Text>
                </TouchableOpacity>
              }
            />
            {showEmailInput && (
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="メールアドレスを入力"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.emailAddButton}
                  onPress={addEmail}
                >
                  <Text style={styles.emailAddButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 操作ボタンセクション */}
        <View style={styles.actionButtonsContainer}>
          {imageUri && !isProcessing && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={detectFaces}
              >
                <Search size={20} {...{color: "#FFFFFF"} as any} />
                <Text style={styles.actionButtonText}>顔を検出</Text>
              </TouchableOpacity>
              
              {selectedSticker !== null && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.removeButton]} 
                  onPress={removeSelectedSticker}
                >
                  <Trash2 size={20} {...{color: "#FFFFFF"} as any} />
                  <Text style={styles.actionButtonText}>削除</Text>
                </TouchableOpacity>
              )}
              
              {faceCoordinates.length > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.autoPlaceButton]}
                  onPress={() => placeStickersOnFaces('blur')}
                >
                  <Zap size={20} {...{color: "#FFFFFF"} as any} />
                  <Text style={styles.actionButtonText}>自動配置</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* スタンプ選択セクション */}
        <View style={styles.stickerSelector}>
          <Text style={styles.sectionTitle}>スタンプを選択</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stickersScrollView}>
            {STICKERS.map(sticker => (
              <TouchableOpacity
                key={sticker.id}
                style={[
                  styles.stickerOption,
                  { backgroundColor: sticker.color },
                  selectedStickerType === sticker.id && styles.selectedStickerOption,
                ]}
                onPress={() => addSticker(sticker.id)}
              >
                <Text style={styles.stickerOptionText}>{sticker.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.instructionText}>
            スタンプを選んで顔の上に置いてください。スタンプはドラッグで移動できます。
          </Text>
        </View>
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
  saveButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  selectImageButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  selectImageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stickerSelector: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stickersScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stickerOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedStickerOption: {
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  stickerOptionText: {
    fontSize: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  sticker: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#3B82F6',
    borderRadius: 25,
  },
  stickerContent: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerText: {
    fontSize: 24,
  },
  removeButton: {
    backgroundColor: '#EF4444',
  },
  removeButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  faceBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 4,
  },
  emailSuggestionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  emailChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emailChipText: {
    fontSize: 14,
    color: '#0F172A',
  },
  addEmailButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  addEmailButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  emailInputContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  emailInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emailAddButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  autoPlaceButton: {
    backgroundColor: '#10B981',
  },
}); 