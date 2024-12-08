import React, {
  useCallback,
  useState,
  ChangeEvent,
  DragEvent,
  useEffect,
} from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useImageUpload } from "@/useImageUpload";

interface ImageUploadProps {
  onImageUpload?: (file: File) => void;
  onImageClear?: () => void;
  className?: string;
  autoLoadImage?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageClear,
  className = "",
  autoLoadImage = false,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { preview, error, handleImageUpload, clearImage } = useImageUpload();

  useEffect(() => {
    if (autoLoadImage) {
      fetch("/images/boat.jpg")
        .then((response) => response.blob())
        .then((blob) => {
          // Create a File object from the blob
          const file = new File([blob], "boat.jpg", { type: "image/jpeg" });
          handleImageUpload(file);
          if (onImageUpload) {
            onImageUpload(file);
          }
        })
        .catch((err) => console.error("Error loading default image:", err));
    }
  }, [autoLoadImage, handleImageUpload, onImageUpload]);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer?.files[0];
      handleImageUpload(file);
      if (file && onImageUpload) {
        onImageUpload(file);
      }
    },
    [handleImageUpload, onImageUpload]
  );

  const onFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
        if (onImageUpload) {
          onImageUpload(file);
        }
      }
    },
    [handleImageUpload, onImageUpload]
  );

  const dragEvents = {
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop,
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {!preview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              hover:border-blue-500 hover:bg-blue-50 transition-colors`}
            {...dragEvents}
          >
            <input
              type="file"
              className="hidden"
              id="image-upload"
              accept="image/*"
              onChange={onFileSelect}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop an image here, or click to select
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports: JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-contain rounded-lg"
            />
            <button
              onClick={() => {
                clearImage();
                onImageClear?.();
              }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg 
                hover:bg-gray-100 transition-colors"
              type="button"
            >
              <ImageIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
