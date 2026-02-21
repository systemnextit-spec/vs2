import React from 'react';
import { RichTextEditor } from '../RichTextEditor';

interface DescriptionSectionProps {
  data: any;
  onChange: (data: any) => void;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ data, onChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-6">
      {/* Full Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
        <RichTextEditor
          value={data.description}
          onChange={(value) => onChange({ description: value })}
          placeholder="Enter detailed product description..."
          minHeight="min-h-[400px]"
        />
      </div>

      {/* Short Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Short Description</h3>
        <textarea
          value={data.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="Enter a brief description of your product"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">Max 160 characters</p>
      </div>
    </div>
  );
};

export default DescriptionSection;
