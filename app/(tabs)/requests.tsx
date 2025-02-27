import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

// Mock data for the requests
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

export default function RequestsScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const filteredRequests = requests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

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

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => router.push(`/request-details/${item.id}`)}
    >
      <Image
        source={{ uri: `${item.image}?w=400&auto=format&q=80` }}
        style={styles.requestImage}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.requestTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.requestOwner} numberOfLines={1}>
          {item.owner}
        </Text>
        <View style={styles.requestMeta}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text style={styles.statusText}>{item.status}</Text>
          <Text style={styles.requestDate}>{item.date}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#94A3B8" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'approved' && styles.activeTabText,
            ]}
          >
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'denied' && styles.activeTab]}
          onPress={() => setActiveTab('denied')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'denied' && styles.activeTabText,
            ]}
          >
            Denied
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.requestsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        }
      />
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  requestsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestItem: {
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
    alignItems: 'center',
  },
  requestImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  requestTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  requestOwner: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  requestMeta: {
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
  requestDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 8,
  },
  chevron: {
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
});