import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { PhotoDisplay } from '../components/PhotoDisplay';
import { StampToggle } from '../components/StampToggle';
import { QualitySelector } from '../components/QualitySelector';
import { CommentBox } from '../components/CommentBox';
import type { Photo, ApprovalData } from '../types';

// Mock data for demonstration
const mockPhoto: Photo = {
  photoId: '12345',
  photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  status: 'pending',
  metadata: {
    uploader: 'John Doe',
    timestamp: new Date().toISOString(),
  },
};

export function ApprovalPage() {
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    faceStamp: false,
    quality: null as 'OK' | 'NG' | null,
    comment: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalData.quality) {
      alert('Please select a quality rating (OK/NG)');
      return;
    }

    // TODO: Implement API call
    console.log('Submitting approval:', approvalData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Photo Review</h1>
          <p className="mt-2 text-gray-600">
            Please review the photo and provide your approval
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <PhotoDisplay photo={mockPhoto} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <StampToggle
                  value={approvalData.faceStamp}
                  onChange={(value) =>
                    setApprovalData({ ...approvalData, faceStamp: value })
                  }
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quality Rating
                  </label>
                  <QualitySelector
                    value={approvalData.quality}
                    onChange={(value) =>
                      setApprovalData({ ...approvalData, quality: value })
                    }
                  />
                </div>

                <CommentBox
                  value={approvalData.comment}
                  onChange={(value) =>
                    setApprovalData({ ...approvalData, comment: value })
                  }
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}