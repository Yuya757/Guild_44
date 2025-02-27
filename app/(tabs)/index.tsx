import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Filter } from 'lucide-react-native';

// Mock data for the gallery view
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
];

export default function HomeScreen() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Permissions</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => router.push('/new-request')}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.requestButtonText}>Request Permission</Text>
        </TouchableOpacity>

        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <FlatList
            data={requests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.requestsList}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  recentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 16,
  },
  requestsList: {
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
  },
  requestImage: {
    width: 80,
    height: 80,
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
    marginLeft: 'auto',
  },
});