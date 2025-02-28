type StatusType = 'approved' | 'pending' | 'denied';

interface StatusStyles {
  backgroundColor: string;
  statusText: string;
  statusColor: string;
}

/**
 * Get styles for displaying status
 * @param status The status value
 * @returns Style object with backgroundColor, statusText and statusColor
 */
export const getStatusStyles = (status: StatusType): StatusStyles => {
  switch (status) {
    case 'approved':
      return {
        backgroundColor: '#10B98120',
        statusColor: '#10B981',
        statusText: '承認済'
      };
    case 'pending':
      return {
        backgroundColor: '#F59E0B20',
        statusColor: '#F59E0B',
        statusText: '承認待ち'
      };
    case 'denied':
      return {
        backgroundColor: '#EF444420',
        statusColor: '#EF4444',
        statusText: '却下'
      };
    default:
      return {
        backgroundColor: '#64748B20',
        statusColor: '#64748B',
        statusText: '不明'
      };
  }
};

export default getStatusStyles; 