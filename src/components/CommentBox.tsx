import React from 'react';
import { MessageSquare } from 'lucide-react';

interface CommentBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function CommentBox({ value, onChange }: CommentBoxProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MessageSquare className="h-4 w-4" />
        Additional Comments
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter any additional comments or feedback..."
      />
    </div>
  );
}