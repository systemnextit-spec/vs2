import React, { useRef, useState } from 'react';
import { Upload, X, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageToServer } from '../../services/imageUploadService';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

interface MediaSectionProps {
  data: any;
  tenantId: string;
  onChange: (data: any) => void;
}

const MediaSection: React.FC<MediaSectionProps> = ({ data, tenantId, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0] instanceof File) {
      await handleImageUpload(files[0]);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToServer(file, tenantId);
      onChange({ mainImage: imageUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file =>
        uploadImageToServer(file, tenantId)
      );
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange({
        galleryImages: [...data.galleryImages, ...uploadedUrls]
      });
      toast.success(`${uploadedUrls.length} images uploaded`);
    } catch (error) {
      toast.error('Failed to upload images');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Media</h2>

      <div className="space-y-4 sm:space-y-6">
        {/* Main Image Upload */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Product Image <span className="text-red-500">*</span>
          </label>
          {data.mainImage ? (
            <div className="relative w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={normalizeImageUrl(data.mainImage)}
                alt="Product"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onChange({ mainImage: '' })}
                className="absolute to p-2 right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-lg hover:bg-red-600"
              >
                <X size={16} className="sm:hidden" />
                <X size={20} className="hidden sm:block" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleImageDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 sm:p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <Upload size={28} className="mx-auto text-gray-400 mb-2 sm:mb-3 sm:w-8 sm:h-8" />
              <p className="text-xs sm:text-sm text-gray-600">
                Drag and drop your image or <span className="text-blue-500 font-semibold">click to browse</span>
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, WebP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleImageUpload(files[0]);
                  }
                }}
                className="hidden"
              />
            </div>
          )}
          <div className="mt-2 sm:mt-3 flex gap-2 sm:gap-3">
            <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs sm:text-sm">
              Buy Image
            </button>
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Gallery Images
          </label>
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 mb-3">
            {data.galleryImages.map((image: string, index: number) => (
              <div key={index} className="relative h-16 sm:h-20 bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={normalizeImageUrl(image)}
                  alt={`Gallery ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onChange({
                    galleryImages: data.galleryImages.filter((_: string, i: number) => i !== index)
                  })}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                handleGalleryUpload(files);
              }
            }}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 file:mr-2 sm:file:mr-3 file:px-2 sm:file:px-3 file:py-1 file:border file:border-gray-300 file:rounded file:text-xs sm:file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Video Link (YouTube/Vimeo)
          </label>
          <div className="flex gap-2 sm:gap-3">
            <Play size={18} className="text-gray-400 mt-2 flex-shrink-0" />
            <input
              type="url"
              value={data.videoUrl}
              onChange={(e) => onChange({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaSection;
