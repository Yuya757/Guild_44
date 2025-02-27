import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Download, Share2, MessageCircle } from 'lucide-react-native';

// Mock data for the request details
const MOCK_REQUESTS = {
  '1': {
    id: '1',
    image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538',
    title: 'Mountain Landscape',
    owner: 'Jane Smith',
    ownerEmail: 'jane.smith@example.com',
    status: 'approved',
    date: '2023-10-15',
    projectName: 'Summer Marketing Campaign',
    usagePurpose: 'Website',
    usageDescription: 'This image will be used as a hero banner on our website homepage to promote our new outdoor adventure packages.',
    usageDuration: '6 months',
    approvalDate: '2023-10-18',
    notes: 'Please credit the photographer in the footer of the website.',
  },
  '2': {
    id: '2',
    image: 'https://images.unsplash.com/photo-1682687220208-22d7a2543e88',
    title: 'City Skyline',
    owner: 'John Doe',
    ownerEmail: 'john.doe@example.com',
    status: 'pending',
    date: '2023-10-18',
    projectName: 'Urban Living Blog',
    usagePurpose: 'Blog Post',
    usageDescription: 'This image will be used to illustrate a blog post about urban architecture and city planning.',
    usageDuration: '1 year',
    notes: '',
  },
  '3': {
    id: '3',
    image: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ea',
    title: 'Beach Sunset',
    owner: 'Alex Johnson',
    ownerEmail: 'alex.johnson@example.com',
    status: 'denied',
    date: '2023-10-10',
    projectName: 'Travel Brochure',
    usagePurpose: 'Print Publication',
    usageDescription: 'This image would be used in our travel brochure to showcase beach destinations.',
    usageDuration: '3 months',
    denialReason: 'The image is already licensed exclusively to another company.',
    denialDate: '2023-10-12',
  },
};

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  
  // Get the request details based on the ID
  const request = MOCK_REQUESTS[id as string];
  
  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Request not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'denied':
        return 'Denied';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: `${request.image}?w=800&auto=format&q=80` }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{request.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + '20' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(request.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} color="#64748B" />
              <Text style={styles.infoText}>Requested: {request.date}</Text>
            </View>
            {request.status === 'approved' && (
              <View style={styles.infoItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.infoText}>Approved: {request.approvalDate}</Text>
              </View>
            )}
            {request.status === 'denied' && (
              <View style={styles.infoItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.infoText}>Denied: {request.denialDate}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>Name</Text>
              <Text style={styles.sectionItemText}>{request.owner}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>Email</Text>
              <Text style={styles.sectionItemText}>{request.ownerEmail}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage Details</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>Project/Campaign</Text>
              <Text style={styles.sectionItemText}>{request.projectName}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>Purpose</Text>
              <Text style={styles.sectionItemText}>{request.usagePurpose}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>Description</Text>
              <Text style={styles.sectionItemText}>{request.usageDescription}</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionItemTitle}>Duration</Text>
              <Text style={styles.sectionItemText}>{request.usageDuration}</Text>
            </View>
          </View>

          {request.status === 'approved' && request.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes from Owner</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{request.notes}</Text>
              </View>
            </View>
          )}

          {request.status === 'denied' && request.denialReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason for Denial</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{request.denialReason}</Text>
              </View>
            </View>
          )}

          {request.status === 'pending' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Send a Message</Text>
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Add a message or additional information..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton}>
                  <MessageCircle size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {request.status === 'approved' && (
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Download Image</Text>
            </TouchableOpacity>
          )}

          {request.status === 'denied' && (
            <TouchableOpacity
              style={styles.newRequestButton}
              onPress={() => router.push('/new-request')}
            >
              <Text style={styles.newRequestButtonText}>Create New Request</Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
  },
  detailsContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionContent: {
    marginBottom: 12,
  },
  sectionItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  sectionItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 24,
  },
  notesContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 24,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  newRequestButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newRequestButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});