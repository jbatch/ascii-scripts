import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface ImagePreviewProps {
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  processingMode: "threshold" | "edge" | "dither" | "adaptive";
  threshold: number;
  sensitivity: number;
}

const ImagePreview = ({
  onImageUpload,
  onImageClear,
  processingMode,
  threshold,
  sensitivity,
}: ImagePreviewProps) => {
  const [showProcessed, setShowProcessed] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(
    (imageElement: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match image
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;

      // Draw original image
      ctx.drawImage(imageElement, 0, 0);
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply selected processing
      switch (processingMode) {
        case "threshold": {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = brightness < threshold ? 0 : 255;
            data[i] = data[i + 1] = data[i + 2] = value;
          }
          break;
        }
        case "edge": {
          break;
        }
        case "dither": {
          break;
        }
      }

      // Draw processed image data
      ctx.putImageData(imageData, 0, 0);
      setProcessedImageUrl(canvas.toDataURL());
    },
    [processingMode, threshold, sensitivity]
  );

  const handleImageUpload = useCallback(
    (file: File) => {
      setCurrentImage(file);
      onImageUpload(file);

      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
        img.onload = () => {
          processImage(img);
        };
      };

      reader.readAsDataURL(file);
    },
    [onImageUpload, processImage]
  );

  const handleImageClear = useCallback(() => {
    setCurrentImage(null);
    setProcessedImageUrl("");
    setShowProcessed(false);
    onImageClear();
  }, [onImageClear]);

  // Reprocess image when processing parameters change
  useEffect(() => {
    if (currentImage) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
        img.onload = () => {
          processImage(img);
        };
      };

      reader.readAsDataURL(currentImage);
    }
  }, [currentImage, processImage]);

  return (
    <div className="relative">
      <ImageUpload
        onImageUpload={handleImageUpload}
        onImageClear={handleImageClear}
      />

      {currentImage && processedImageUrl && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-8 right-8"
            onClick={() => setShowProcessed(!showProcessed)}
          >
            {showProcessed ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" /> Show Original
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" /> Show Processed
              </>
            )}
          </Button>
          {showProcessed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={processedImageUrl}
                alt="Processed preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImagePreview;
