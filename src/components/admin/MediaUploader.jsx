import { useState, useRef } from 'react';
import { X, Upload, Loader, Check } from 'lucide-react';
import * as storageService from '../../services/storageService';

export default function MediaUploader({ 
  onSelect, 
  onClose, 
  multiple = false,
  context = 'general', // product, collection, homepage, hero, video, general
  folder = '',
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    const uploadedResults = [];
    const bucket = storageService.getBucketForContext(context);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!storageService.validateFileType(file)) {
        setError(`${file.name}: Invalid file type. Only images are allowed.`);
        continue;
      }

      // Validate file size (max 30MB)
      if (!storageService.validateFileSize(file, 30)) {
        setError(`${file.name}: File size must be less than 30MB`);
        continue;
      }

      try {
        // Optional: Compress image before upload
        const compressedFile = await storageService.compressImage(file, 1920, 0.85);

        // Upload to Supabase Storage
        const result = await storageService.uploadFile(compressedFile, {
          bucket,
          folder,
        });

        if (result.success) {
          uploadedResults.push({
            url: result.url,
            path: result.path,
            bucket: result.bucket,
            name: file.name,
            size: file.size,
            type: file.type,
          });
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }

      // Update progress
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploadedFiles(uploadedResults);
    setUploading(false);

    // Auto-select if single file
    if (!multiple && uploadedResults.length === 1) {
      onSelect(uploadedResults.map(f => f.url));
    }
  };

  const handleSelect = () => {
    if (uploadedFiles.length > 0) {
      onSelect(uploadedFiles.map(f => f.url));
    }
  };

  const handleRemove = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold">Upload Images</h2>
            <p className="text-sm text-gray-500 mt-1">
              Uploading to: {storageService.getBucketForContext(context)}
              {folder && ` / ${folder}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-black transition-colors"
          >
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Click to upload {multiple ? 'images' : 'an image'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP, GIF up to 30MB
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Images will be automatically compressed for optimal performance
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Uploading State */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader size={24} className="animate-spin" />
                <span className="text-gray-600">Uploading images...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500">{progress}%</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Uploaded Images Preview */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check size={20} />
                <span className="font-medium">
                  {uploadedFiles.length} {uploadedFiles.length === 1 ? 'image' : 'images'} uploaded successfully
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full aspect-square object-cover border rounded"
                    />
                    <button
                      onClick={() => handleRemove(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {storageService.formatFileSize(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-4 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={uploadedFiles.length === 0}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
