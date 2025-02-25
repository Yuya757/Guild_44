import React from 'react';
import type { Photo } from '../types';

interface PhotoDisplayProps {
  photo: Photo;
}

export function PhotoDisplay({ photo }: PhotoDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      <img
        src={photo.photoUrl}
        alt="Photo for approval"
        className="w-full h-auto object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
        <p className="text-sm">Uploaded by: {photo.metadata.uploader}</p>
        <p className="text-xs">
          {new Date(photo.metadata.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}