import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search as SearchIcon, X, Filter, TriangleAlert as AlertTriangle } from 'lucide-react-native';

// Define interface for search results
interface SearchResultItem {
  id: string;
  image: string;
  title: string;
  owner: string;
  status: 'approved' | 'pending' | 'denied' | string;
  date: string;
}

// 人物写真のモックデータ
const MOCK_REQUESTS: SearchResultItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&q=80',
    title: '社員プロフィール写真',
    owner: '田中 花子',
    status: 'approved',
    date: '2023-10-15',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80',
    title: 'マーケティング素材',
    owner: '佐藤 太郎',
    status: 'pending',
    date: '2023-10-18',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&q=80',
    title: 'イベント写真',
    owner: '鈴木 一郎',
    status: 'denied',
    date: '2023-10-10',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&q=80',
    title: 'チームビルディング',
    owner: '山田 優子',
    status: 'approved',
    date: '2023-10-05',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&q=80',
    title: '広告キャンペーン',
    owner: '高橋 誠',
    status: 'pending',
    date: '2023-10-20',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&q=80',
    title: 'ウェブサイト素材',
    owner: '伊藤 美咲',
    status: 'approved',
    date: '2023-10-12',
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = MOCK_REQUESTS.filter(
        (item) =>
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.owner.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'denied':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認済';
      case 'pending':
        return '審査中';
      case 'denied':
        return '却下';
      default:
        return status;
    }
  };

  const handleReportImage = (item: SearchResultItem) => {
    Alert.alert(
      '写真の報告',
      'この写真に関する問題を報告しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '自分ではない',
          onPress: () => reportNotMe(item)
        },
        {
          text: '不適切な内容',
          onPress: () => reportInappropriate(item)
        }
      ]
    );
  };

  const reportNotMe = (item: SearchResultItem) => {
    Alert.alert(
      '報告を送信しました',
      '「自分ではない」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  const reportInappropriate = (item: SearchResultItem) => {
    Alert.alert(
      '報告を送信しました',
      '「不適切な内容」という報告を受け付けました。確認後、対応いたします。',
      [{ text: 'OK' }]
    );
  };

  const renderResultItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => router.push(`/request-details/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.resultImage}
        />
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => handleReportImage(item)}
        >
          <AlertTriangle size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultOwner} numberOfLines={1}>
          {item.owner}
        </Text>
        <View style={styles.resultMeta}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          <Text style={styles.resultDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>検索</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="タイトルまたは所有者で検索"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {showResults ? (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>検索結果がありません</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            タイトルまたは所有者名で画像使用許可申請を検索できます
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '400',
    color: '#0F172A',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  reportButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  resultOwner: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  resultDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
});