import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  // Compress image to reasonable resolution for Firestore document storage (<400KB each)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG 0.78 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setProcessing(true);

    const availableSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    try {
      const newUrls: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await processImageFile(file);
        newUrls.push(compressed);
      }
      onChange([...images, ...newUrls]);
    } catch (err) {
      console.error("Image processing error:", err);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onChange([selected, ...filtered]);
  };

  return (
    <div className="space-y-4">
      {/* Upload button area */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 hover:border-[#EFBF04] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="h-12 w-12 rounded-xl bg-zinc-800 group-hover:bg-[#EFBF04]/10 flex items-center justify-center text-zinc-400 group-hover:text-[#EFBF04] transition-colors mb-3">
            {processing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#EFBF04] border-t-transparent" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          <p className="text-sm font-semibold text-zinc-200">
            {t('listing_photos_label')} ({images.length}/{maxImages})
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            {t('listing_photos_hint')}
          </p>
        </div>
      )}

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative group rounded-xl overflow-hidden border bg-zinc-900 aspect-square ${
                idx === 0 ? 'border-[#EFBF04] ring-2 ring-[#EFBF04]/30' : 'border-zinc-800'
              }`}
            >
              <img
                src={img}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#EFBF04] text-zinc-950 font-bold text-[10px] uppercase shadow">
                  Cover
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    title="Make main photo"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-[#EFBF04] hover:text-zinc-950 text-white transition-colors cursor-pointer"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Remove"
                  className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
