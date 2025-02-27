import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

export default function RequestSubmittedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={80} color="#10B981" style={styles.icon} />
        
        <Text style={styles.title}>Request Submitted!</Text>
        
        <Text style={styles.description}>
          Your permission request has been successfully submitted. The image owner will be notified and you'll receive updates on the status of your request.
        </Text>
        
        <View style={styles.requestSummary}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&auto=format&q=80' }}
            style={styles.requestImage}
          />
          <View style={styles.requestDetails}>
            <Text style={styles.requestTitle}>Mountain Landscape</Text>
            <Text style={styles.requestOwner}>Owner: Jane Smith</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>The image owner will review your request</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>You'll receive a notification when they respond</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <Text style={styles.infoText}>If approved, you can use the image as specified in your request</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  requestSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
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
  requestDetails: {
    flex: 1,
    marginLeft: 16,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
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
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});