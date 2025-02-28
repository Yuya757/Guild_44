/**
 * Format a scheduled date and time string to a more readable format
 * @param dateString The date string in ISO format (YYYY-MM-DD)
 * @param timeString The time string in format (HH:MM)
 * @returns Formatted date and time string
 */
export const formatScheduledDate = (dateString: string, timeString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    return timeString ? `${formattedDate} ${timeString}` : formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error);
    return `${dateString} ${timeString || ''}`;
  }
};

export default formatScheduledDate; 