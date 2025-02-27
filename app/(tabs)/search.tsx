import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search as SearchIcon, X, Filter } from 'lucide-react-native';

// Mock data for the search results
const MOCK_REQUESTS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538',
    title: 'Mountain Landscape',
    owner: 'Jane Smith',
    status: 'approved',
    date: '2023-10-15',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1682687220208-22d7a2543e88',
    title: 'City Skyline',
    owner: 'John Doe',
    status: 'pending',
    date: '2023-10-18',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ea',
    title: 'Beach Sunset',
    owner: 'Alex Johnson',
    status: 'denied',
    date: '2023-10-10',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb',
    title: 'Forest Trail',
    owner: 'Sarah Williams',
    status: 'approved',
    date: '2023-10-05',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1',
    title: 'Urban Architecture',
    owner: 'Michael Brown',
    status: 'pending',
    date: '2023-10-20',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1682695797221-8164ff1fafc9',
    title: 'Autumn Colors',
    owner: 'Emily Davis',
    status: 'approved',
    date: '2023-10-12',
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text) => {
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

  const getStatusColor = (status) => {
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

  const renderResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => router.push(`/request-details/${item.id}`)}
    >
      <Image
        source={{ uri: `${item.image}?w=400&auto=format&q=80` }}
        style={styles.resultImage}
      />
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
          <Text style={styles.statusText}>{item.status}</Text>
          <Text style={styles.resultDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or owner"
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
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Search for image permission requests by title or owner name
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Regular',
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
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  resultOwner: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  resultDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
});