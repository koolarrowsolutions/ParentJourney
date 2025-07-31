import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5, className }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: string[] = [];
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPhotos.push(result);
          if (newPhotos.length === filesToProcess) {
            onPhotosChange([...photos, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          className={cn(
            "border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center transition-all",
            dragOver && "border-primary bg-primary/5",
            "hover:border-primary/50 hover:bg-neutral-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="flex space-x-2">
              <Camera className="h-8 w-8 text-neutral-400" />
              <Upload className="h-8 w-8 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                📸 Add photos to your entry
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Drag & drop or click to upload ({photos.length}/{maxPhotos} photos)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Photos
            </Button>
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-neutral-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length >= maxPhotos && (
        <div className="text-xs text-neutral-500 text-center">
          Maximum {maxPhotos} photos reached
        </div>
      )}
    </div>
  );
}