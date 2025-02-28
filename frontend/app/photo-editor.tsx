import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Check, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

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

export default function PhotoEditorScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedStickerType, setSelectedStickerType] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // 画像サイズの取得（必要に応じて）
  const onImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setImageSize({ width, height });
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
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <ImageIcon size={48} {...{color: "#94A3B8"} as any} />
              <Text style={styles.noImageText}>画像が見つかりません</Text>
              <TouchableOpacity 
                style={styles.selectImageButton}
                onPress={() => router.back()}
              >
                <Text style={styles.selectImageButtonText}>戻る</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* スタンプのレンダリング */}
          {renderStickers()}
        </View>

        {selectedSticker !== null && (
          <TouchableOpacity style={styles.removeButton} onPress={removeSelectedSticker}>
            <Trash2 size={24} {...{color: "#EF4444"} as any} />
            <Text style={styles.removeButtonText}>削除</Text>
          </TouchableOpacity>
        )}

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
    height: width,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
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
    fontWeight: '500',
    color: '#64748B',
  },
  selectImageButton: {
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  selectImageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sticker: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#3B82F6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  removeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  stickerSelector: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  stickersScrollView: {
    marginBottom: 16,
  },
  stickerOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedStickerOption: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  stickerOptionText: {
    fontSize: 30,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 20,
  },
}); 