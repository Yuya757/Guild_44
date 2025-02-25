import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QualitySelectorProps {
  value: 'OK' | 'NG' | null;
  onChange: (value: 'OK' | 'NG') => void;
}

export function QualitySelector({ value, onChange }: QualitySelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange('OK')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          value === 'OK'
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <CheckCircle className="h-4 w-4" />
        OK
      </button>
      <button
        type="button"
        onClick={() => onChange('NG')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          value === 'NG'
            ? 'bg-red-50 border-red-500 text-red-700'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <XCircle className="h-4 w-4" />
        NG
      </button>
    </div>
  );
}