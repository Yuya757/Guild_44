export interface Photo {
  photoId: string;
  photoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata: {
    uploader: string;
    timestamp: string;
  };
}

export interface ApprovalData {
  faceStamp: boolean;
  quality: 'OK' | 'NG';
  comment: string;
}