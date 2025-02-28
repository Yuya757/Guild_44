import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, Download, Share2 } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ConsentSubmittedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.iconContainer}>
        <CheckCircle size={80} {...{color: "#10B981"} as any} style={styles.icon} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.contentContainer}>
        <Text style={styles.title}>承諾が完了しました！</Text>

        <Text style={styles.description}>
          これで写真の使用に同意したことになります。承諾証明書をダウンロードできます。
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>次に行うこと：</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>
              証明書をダウンロードして安全な場所に保管してください
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>
              証明書には承諾の詳細が記載されています
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadContainer} onPress={() => alert('証明書をダウンロードしました')}>
          <Download size={20} {...{color: "#3B82F6"} as any} />
          <Text style={styles.actionButtonText}>承諾証明書をダウンロード</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareContainer} onPress={() => Share.share({message: '写真使用の承諾が完了しました。'})}>
          <Share2 size={20} {...{color: "#3B82F6"} as any} />
          <Text style={styles.actionButtonText}>承諾情報を共有</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>ホームに戻る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 20,
  },
  downloadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
    padding: 20,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});