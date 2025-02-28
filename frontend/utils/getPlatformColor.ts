type PlatformType = 'instagram' | 'twitter' | 'snapchat' | 'facebook' | 'tiktok';

/**
 * Get the brand color for a social media platform
 * @param platform The platform name
 * @returns Hex color code for the platform
 */
export const getPlatformColor = (platform: PlatformType): string => {
  switch (platform) {
    case 'instagram':
      return '#E1306C';
    case 'twitter':
      return '#1DA1F2';
    case 'snapchat':
      return '#FFFC00';
    case 'facebook':
      return '#4267B2';
    case 'tiktok':
      return '#000000';
    default:
      return '#64748B';
  }
};

/**
 * Get the text display name for a platform
 * @param platform The platform name
 * @returns Display name for the platform
 */
export const getPlatformName = (platform: PlatformType): string => {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'twitter':
      return 'Twitter';
    case 'snapchat':
      return 'Snapchat';
    case 'facebook':
      return 'Facebook';
    case 'tiktok':
      return 'TikTok';
    default:
      return platform;
  }
};

export default getPlatformColor; 