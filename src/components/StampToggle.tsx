import React from 'react';
import { Stamp } from 'lucide-react';

interface StampToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function StampToggle({ value, onChange }: StampToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <label className="flex items-center gap-2 text-sm font-medium">
        <Stamp className="h-4 w-4" />
        Replace face with stamp
      </label>
    </div>
  );
}