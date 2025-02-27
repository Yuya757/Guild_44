import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle, Download, Share2 } from 'lucide-react-native';

export default function ConsentSubmittedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={80} color="#10B981" style={styles.icon} />
        
        <Text style={styles.title}>Consent Submitted!</Text>
        
        <Text style={styles.description}>
          The image permission consent has been successfully recorded. A confirmation email has been sent to all parties with a copy of the consent form.
        </Text>
        
        <View style={styles.consentSummary}>
          <Text style={styles.summaryTitle}>Consent Reference</Text>
          <Text style={styles.referenceNumber}>IPCS-2025-06-15-0042</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>June 15, 2025</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expires:</Text>
            <Text style={styles.summaryValue}>June 15, 2026</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Download PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>The image can now be used according to the specified permissions</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>You can view or manage this consent at any time from your dashboard</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <Text style={styles.infoText}>You'll receive a reminder 30 days before the consent expires</Text>
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
  consentSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 8,
  },
  referenceNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    width: 70,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginLeft: 8,
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