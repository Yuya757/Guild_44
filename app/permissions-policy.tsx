import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PermissionsPolicyScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Permissions Policy</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Download size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Image Permissions and Consent Policy</Text>
          <Text style={styles.introText}>
            This policy outlines the requirements and procedures for obtaining, managing, and
            documenting consent for the use of images. All stakeholders must adhere to these
            guidelines to ensure ethical and legal compliance.
          </Text>
        </View>

        {/* Section 1: Obtaining Consent */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('consent')}
        >
          <Text style={styles.sectionTitle}>1. Obtaining Explicit Consent</Text>
          <Text style={styles.expandButton}>{expandedSection === 'consent' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'consent' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>When Consent is Required:</Text>
            <Text style={styles.bulletPoint}>• Before capturing images of identifiable individuals</Text>
            <Text style={styles.bulletPoint}>• Prior to any use, sharing, or modification of existing images</Text>
            <Text style={styles.bulletPoint}>• When repurposing images for uses beyond the original consent</Text>
            
            <Text style={styles.sectionSubtitle}>How to Obtain Consent:</Text>
            <Text style={styles.bulletPoint}>• Use the official consent form provided in this application</Text>
            <Text style={styles.bulletPoint}>• Clearly explain all intended uses and potential modifications</Text>
            <Text style={styles.bulletPoint}>• Provide opportunity for questions before consent is given</Text>
            <Text style={styles.bulletPoint}>• Obtain written or digital signature through the app</Text>
            <Text style={styles.bulletPoint}>• Provide a copy of the signed consent form to the subject</Text>
            
            <Text style={styles.sectionSubtitle}>Verbal Consent Limitations:</Text>
            <Text style={styles.bulletPoint}>• Verbal consent alone is insufficient for most uses</Text>
            <Text style={styles.bulletPoint}>• May only be used in exceptional circumstances with proper documentation</Text>
            <Text style={styles.bulletPoint}>• Must be followed up with written consent when possible</Text>
          </View>
        )}

        {/* Section 2: Types of Permissions */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('types')}
        >
          <Text style={styles.sectionTitle}>2. Types of Permissions</Text>
          <Text style={styles.expandButton}>{expandedSection === 'types' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'types' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Digital Use Permission:</Text>
            <Text style={styles.bulletPoint}>• Website and social media platforms</Text>
            <Text style={styles.bulletPoint}>• Digital marketing materials</Text>
            <Text style={styles.bulletPoint}>• Mobile applications</Text>
            <Text style={styles.bulletPoint}>• Email newsletters and communications</Text>
            
            <Text style={styles.sectionSubtitle}>Print Permission:</Text>
            <Text style={styles.bulletPoint}>• Brochures, flyers, and posters</Text>
            <Text style={styles.bulletPoint}>• Magazines and newspapers</Text>
            <Text style={styles.bulletPoint}>• Billboards and physical advertisements</Text>
            <Text style={styles.bulletPoint}>• Product packaging</Text>
            
            <Text style={styles.sectionSubtitle}>Commercial Use Permission:</Text>
            <Text style={styles.bulletPoint}>• Advertising and promotional materials</Text>
            <Text style={styles.bulletPoint}>• Products for sale</Text>
            <Text style={styles.bulletPoint}>• Monetized content</Text>
            <Text style={styles.bulletPoint}>• Corporate communications</Text>
            
            <Text style={styles.sectionSubtitle}>Personal/Non-Commercial Use:</Text>
            <Text style={styles.bulletPoint}>• Personal social media accounts</Text>
            <Text style={styles.bulletPoint}>• Educational or research purposes</Text>
            <Text style={styles.bulletPoint}>• Non-profit organization materials</Text>
            <Text style={styles.bulletPoint}>• Internal company communications</Text>
          </View>
        )}

        {/* Section 3: Time and Geographic Limitations */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('limitations')}
        >
          <Text style={styles.sectionTitle}>3. Time and Geographic Limitations</Text>
          <Text style={styles.expandButton}>{expandedSection === 'limitations' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'limitations' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Time Limitations:</Text>
            <Text style={styles.bulletPoint}>• All permissions must include a specific duration</Text>
            <Text style={styles.bulletPoint}>• Standard options: 1 year, 3 years, 5 years, or perpetual</Text>
            <Text style={styles.bulletPoint}>• Renewal process must begin 30 days before expiration</Text>
            <Text style={styles.bulletPoint}>• Expired permissions require new consent</Text>
            
            <Text style={styles.sectionSubtitle}>Geographic Scope:</Text>
            <Text style={styles.bulletPoint}>• Local: Limited to specific city or region</Text>
            <Text style={styles.bulletPoint}>• National: Limited to a single country</Text>
            <Text style={styles.bulletPoint}>• International: Multiple specified countries</Text>
            <Text style={styles.bulletPoint}>• Worldwide: No geographic restrictions</Text>
            
            <Text style={styles.sectionSubtitle}>Documentation Requirements:</Text>
            <Text style={styles.bulletPoint}>• Clearly state both time and geographic limitations in consent form</Text>
            <Text style={styles.bulletPoint}>• Maintain calendar of expiration dates</Text>
            <Text style={styles.bulletPoint}>• Document any extensions or modifications to original scope</Text>
          </View>
        )}

        {/* Section 4: Image Modification */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('modification')}
        >
          <Text style={styles.sectionTitle}>4. Image Modification Guidelines</Text>
          <Text style={styles.expandButton}>{expandedSection === 'modification' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'modification' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Permitted Modifications:</Text>
            <Text style={styles.bulletPoint}>• Basic color correction and lighting adjustments</Text>
            <Text style={styles.bulletPoint}>• Cropping that maintains context and integrity</Text>
            <Text style={styles.bulletPoint}>• Removal of minor blemishes or distractions</Text>
            <Text style={styles.bulletPoint}>• Addition of text or graphics that don't alter meaning</Text>
            
            <Text style={styles.sectionSubtitle}>Prohibited Modifications:</Text>
            <Text style={styles.bulletPoint}>• Alterations that change the subject's appearance significantly</Text>
            <Text style={styles.bulletPoint}>• Manipulations that place the subject in a false context</Text>
            <Text style={styles.bulletPoint}>• Edits that could be deemed defamatory or misleading</Text>
            <Text style={styles.bulletPoint}>• Combining with other images to create misleading composites</Text>
            
            <Text style={styles.sectionSubtitle}>Special Permission Required:</Text>
            <Text style={styles.bulletPoint}>• Artistic or creative manipulations</Text>
            <Text style={styles.bulletPoint}>• Face swapping or significant digital alterations</Text>
            <Text style={styles.bulletPoint}>• AI-generated modifications or variations</Text>
            <Text style={styles.bulletPoint}>• Use in satire or parody</Text>
          </View>
        )}

        {/* Section 5: Distribution Channels */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('distribution')}
        >
          <Text style={styles.sectionTitle}>5. Distribution Channels</Text>
          <Text style={styles.expandButton}>{expandedSection === 'distribution' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'distribution' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Authorized Channels:</Text>
            <Text style={styles.bulletPoint}>• Company-owned websites and social media accounts</Text>
            <Text style={styles.bulletPoint}>• Approved third-party platforms and partners</Text>
            <Text style={styles.bulletPoint}>• Licensed distributors and resellers</Text>
            <Text style={styles.bulletPoint}>• Official publications and marketing materials</Text>
            
            <Text style={styles.sectionSubtitle}>Distribution Restrictions:</Text>
            <Text style={styles.bulletPoint}>• No redistribution to unapproved third parties</Text>
            <Text style={styles.bulletPoint}>• No sale or licensing without specific permission</Text>
            <Text style={styles.bulletPoint}>• No use on platforms with terms that conflict with this policy</Text>
            <Text style={styles.bulletPoint}>• No distribution in contexts that could harm the subject's reputation</Text>
            
            <Text style={styles.sectionSubtitle}>Required Documentation:</Text>
            <Text style={styles.bulletPoint}>• Maintain record of all platforms where images are distributed</Text>
            <Text style={styles.bulletPoint}>• Document dates of publication and removal</Text>
            <Text style={styles.bulletPoint}>• Track engagement metrics where applicable</Text>
          </View>
        )}

        {/* Section 6: Revoking Permissions */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('revocation')}
        >
          <Text style={styles.sectionTitle}>6. Revoking Permissions</Text>
          <Text style={styles.expandButton}>{expandedSection === 'revocation' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'revocation' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Revocation Process:</Text>
            <Text style={styles.bulletPoint}>• Submit formal revocation request through the app</Text>
            <Text style={styles.bulletPoint}>• Include specific images and reasons for revocation</Text>
            <Text style={styles.bulletPoint}>• Acknowledgment of receipt within 2 business days</Text>
            <Text style={styles.bulletPoint}>• Decision communicated within 10 business days</Text>
            
            <Text style={styles.sectionSubtitle}>Implementation Timeline:</Text>
            <Text style={styles.bulletPoint}>• Digital platforms: Removal within 5 business days</Text>
            <Text style={styles.bulletPoint}>• Social media: Removal within 3 business days</Text>
            <Text style={styles.bulletPoint}>• Print materials: No new production after notification</Text>
            <Text style={styles.bulletPoint}>• Existing physical materials: Reasonable effort to recall</Text>
            
            <Text style={styles.sectionSubtitle}>Limitations on Revocation:</Text>
            <Text style={styles.bulletPoint}>• May not be possible for already-distributed print materials</Text>
            <Text style={styles.bulletPoint}>• Limited for materials under contractual obligations</Text>
            <Text style={styles.bulletPoint}>• May require legal consultation in complex cases</Text>
            <Text style={styles.bulletPoint}>• Commercial uses may have different terms as specified in contract</Text>
          </View>
        )}

        {/* Section 7: Special Considerations */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('special')}
        >
          <Text style={styles.sectionTitle}>7. Special Considerations</Text>
          <Text style={styles.expandButton}>{expandedSection === 'special' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'special' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Minors (Under 18):</Text>
            <Text style={styles.bulletPoint}>• Parental/guardian consent required</Text>
            <Text style={styles.bulletPoint}>• Both parent/guardian and minor must be informed</Text>
            <Text style={styles.bulletPoint}>• More restrictive usage limitations apply</Text>
            <Text style={styles.bulletPoint}>• Annual review of consent required</Text>
            
            <Text style={styles.sectionSubtitle}>Vulnerable Individuals:</Text>
            <Text style={styles.bulletPoint}>• Additional safeguards for those with diminished capacity</Text>
            <Text style={styles.bulletPoint}>• Legal guardian or authorized representative must consent</Text>
            <Text style={styles.bulletPoint}>• Extra care to ensure dignity and respect</Text>
            <Text style={styles.bulletPoint}>• Regular review of appropriateness of continued use</Text>
            
            <Text style={styles.sectionSubtitle}>Group Photos:</Text>
            <Text style={styles.bulletPoint}>• Best effort to obtain consent from all identifiable individuals</Text>
            <Text style={styles.bulletPoint}>• Clear documentation of those who have/haven't provided consent</Text>
            <Text style={styles.bulletPoint}>• Option to blur or remove non-consenting individuals</Text>
            <Text style={styles.bulletPoint}>• Special process for large groups where individual consent is impractical</Text>
          </View>
        )}

        {/* Section 8: Documentation Requirements */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('documentation')}
        >
          <Text style={styles.sectionTitle}>8. Documentation Requirements</Text>
          <Text style={styles.expandButton}>{expandedSection === 'documentation' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'documentation' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Required Documentation:</Text>
            <Text style={styles.bulletPoint}>• Signed consent forms (digital or physical)</Text>
            <Text style={styles.bulletPoint}>• Record of verbal consent (when applicable)</Text>
            <Text style={styles.bulletPoint}>• Correspondence related to permissions</Text>
            <Text style={styles.bulletPoint}>• Modification history of images</Text>
            
            <Text style={styles.sectionSubtitle}>Storage and Access:</Text>
            <Text style={styles.bulletPoint}>• Secure, encrypted storage system</Text>
            <Text style={styles.bulletPoint}>• Limited access to authorized personnel only</Text>
            <Text style={styles.bulletPoint}>• Regular backups of all consent documentation</Text>
            <Text style={styles.bulletPoint}>• Minimum retention period of 3 years after last use</Text>
            
            <Text style={styles.sectionSubtitle}>Audit Procedures:</Text>
            <Text style={styles.bulletPoint}>• Quarterly internal audits of consent documentation</Text>
            <Text style={styles.bulletPoint}>• Annual comprehensive review of all active permissions</Text>
            <Text style={styles.bulletPoint}>• Documentation of audit findings and corrective actions</Text>
            <Text style={styles.bulletPoint}>• Regular training on documentation requirements</Text>
          </View>
        )}

        {/* Section 9: Unauthorized Use */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('unauthorized')}
        >
          <Text style={styles.sectionTitle}>9. Consequences of Unauthorized Use</Text>
          <Text style={styles.expandButton}>{expandedSection === 'unauthorized' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'unauthorized' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Internal Violations:</Text>
            <Text style={styles.bulletPoint}>• Immediate removal of unauthorized content</Text>
            <Text style={styles.bulletPoint}>• Disciplinary action according to company policy</Text>
            <Text style={styles.bulletPoint}>• Mandatory retraining on permissions policy</Text>
            <Text style={styles.bulletPoint}>• Documentation of violation and resolution</Text>
            
            <Text style={styles.sectionSubtitle}>External Violations:</Text>
            <Text style={styles.bulletPoint}>• Formal cease and desist notification</Text>
            <Text style={styles.bulletPoint}>• Request for immediate removal</Text>
            <Text style={styles.bulletPoint}>• Potential legal action for continued violations</Text>
            <Text style={styles.bulletPoint}>• Documentation of all communications and actions taken</Text>
            
            <Text style={styles.sectionSubtitle}>Remediation:</Text>
            <Text style={styles.bulletPoint}>• Notification to affected individuals</Text>
            <Text style={styles.bulletPoint}>• Transparent communication about the violation</Text>
            <Text style={styles.bulletPoint}>• Implementation of preventative measures</Text>
            <Text style={styles.bulletPoint}>• Review of policies and procedures to prevent recurrence</Text>
          </View>
        )}

        {/* Section 10: Privacy and Data Protection */}
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={() => toggleSection('privacy')}
        >
          <Text style={styles.sectionTitle}>10. Privacy and Data Protection</Text>
          <Text style={styles.expandButton}>{expandedSection === 'privacy' ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {expandedSection === 'privacy' && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Data Protection Measures:</Text>
            <Text style={styles.bulletPoint}>• Compliance with relevant data protection laws (GDPR, CCPA, etc.)</Text>
            <Text style={styles.bulletPoint}>• Secure storage of all images and related personal data</Text>
            <Text style={styles.bulletPoint}>• Encryption of sensitive information</Text>
            <Text style={styles.bulletPoint}>• Regular security assessments and updates</Text>
            
            <Text style={styles.sectionSubtitle}>Subject Rights:</Text>
            <Text style={styles.bulletPoint}>• Right to access all stored images and consent records</Text>
            <Text style={styles.bulletPoint}>• Right to request correction of inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Right to data portability where applicable</Text>
            <Text style={styles.bulletPoint}>• Clear process for exercising these rights</Text>
            
            <Text style={styles.sectionSubtitle}>Metadata Management:</Text>
            <Text style={styles.bulletPoint}>• Review of image metadata for privacy concerns</Text>
            <Text style={styles.bulletPoint}>• Removal of sensitive location data when appropriate</Text>
            <Text style={styles.bulletPoint}>• Documentation of metadata management procedures</Text>
            <Text style={styles.bulletPoint}>• Regular audits of metadata handling practices</Text>
          </View>
        )}

        <View style={styles.footerSection}>
          <Text style={styles.footerTitle}>Policy Implementation</Text>
          <Text style={styles.footerText}>
            This policy is effective immediately and applies to all new image acquisitions and uses.
            For existing images, a review and compliance process must be completed within 90 days.
          </Text>
          <Text style={styles.footerText}>
            All stakeholders are responsible for understanding and adhering to this policy.
            Regular training will be provided to ensure compliance.
          </Text>
          <Text style={styles.footerText}>
            Questions about this policy should be directed to the permissions administrator
            through the app's support feature.
          </Text>
          <Text style={styles.footerVersion}>Version 1.0 - Last Updated: June 15, 2025</Text>
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
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  expandButton: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 8,
  },
  footerSection: {
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#334155',
    lineHeight: 22,
    marginBottom: 12,
  },
  footerVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 8,
    textAlign: 'right',
  },
});