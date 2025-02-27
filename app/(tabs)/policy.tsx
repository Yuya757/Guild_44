import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FileText, Download, ChevronRight, Shield, Users, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function PolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Permissions Policy</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Download size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <FileText size={40} color="#3B82F6" style={styles.introIcon} />
          <Text style={styles.introTitle}>Image Permissions and Consent Policy</Text>
          <Text style={styles.introText}>
            Our comprehensive policy for managing image permissions and consent ensures legal compliance
            and protects the rights of all individuals.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.policyCard}
          onPress={() => router.push('/permissions-policy')}
        >
          <View style={styles.policyCardContent}>
            <Shield size={24} color="#3B82F6" style={styles.policyIcon} />
            <View style={styles.policyCardText}>
              <Text style={styles.policyCardTitle}>Full Policy Document</Text>
              <Text style={styles.policyCardDescription}>
                View the complete image permissions and consent policy
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.policyCard}
          onPress={() => router.push('/consent-form')}
        >
          <View style={styles.policyCardContent}>
            <FileText size={24} color="#3B82F6" style={styles.policyIcon} />
            <View style={styles.policyCardText}>
              <Text style={styles.policyCardTitle}>Consent Form</Text>
              <Text style={styles.policyCardDescription}>
                Create a new image permission consent form
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Key Policy Areas</Text>

        <View style={styles.policyArea}>
          <View style={styles.policyAreaHeader}>
            <Users size={20} color="#3B82F6" />
            <Text style={styles.policyAreaTitle}>Obtaining Consent</Text>
          </View>
          <Text style={styles.policyAreaDescription}>
            Clear guidelines on when and how to obtain explicit consent before using, sharing, or modifying someone's image.
          </Text>
          <View style={styles.policyHighlights}>
            <Text style={styles.policyHighlightItem}>• Written consent required</Text>
            <Text style={styles.policyHighlightItem}>• Special process for minors</Text>
            <Text style={styles.policyHighlightItem}>• Clear explanation of all uses</Text>
          </View>
        </View>

        <View style={styles.policyArea}>
          <View style={styles.policyAreaHeader}>
            <Clock size={20} color="#3B82F6" />
            <Text style={styles.policyAreaTitle}>Time and Geographic Limitations</Text>
          </View>
          <Text style={styles.policyAreaDescription}>
            All permissions must include specific time limitations and geographic scope to protect subjects' rights.
          </Text>
          <View style={styles.policyHighlights}>
            <Text style={styles.policyHighlightItem}>• Standard durations: 1, 3, 5 years</Text>
            <Text style={styles.policyHighlightItem}>• Geographic options from local to worldwide</Text>
            <Text style={styles.policyHighlightItem}>• Renewal process before expiration</Text>
          </View>
        </View>

        <View style={styles.policyArea}>
          <View style={styles.policyAreaHeader}>
            <AlertTriangle size={20} color="#3B82F6" />
            <Text style={styles.policyAreaTitle}>Unauthorized Use</Text>
          </View>
          <Text style={styles.policyAreaDescription}>
            Clear consequences for unauthorized use of images to ensure compliance and protect individuals' rights.
          </Text>
          <View style={styles.policyHighlights}>
            <Text style={styles.policyHighlightItem}>• Immediate content removal</Text>
            <Text style={styles.policyHighlightItem}>• Disciplinary action for violations</Text>
            <Text style={styles.policyHighlightItem}>• Notification to affected individuals</Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions about the policy?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Policy Administrator</Text>
          </TouchableOpacity>
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
  downloadButton: {
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
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  introIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  policyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyIcon: {
    marginRight: 16,
  },
  policyCardText: {
    flex: 1,
  },
  policyCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 4,
  },
  policyCardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 16,
  },
  policyArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  policyAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  policyAreaTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginLeft: 12,
  },
  policyAreaDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  policyHighlights: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
  },
  policyHighlightItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    marginBottom: 4,
  },
  contactSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});