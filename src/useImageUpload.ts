import { useCallback, useState } from "react";

// Types for the custom hook
interface ImageUploadState {
  image: File | null;
  preview: string;
  error: string;
  handleImageUpload: (file: File | null) => void;
  clearImage: () => void;
}

// Custom hook for handling image uploads
export const useImageUpload = (): ImageUploadState => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleImageUpload = useCallback((file: File | null) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!file) {
      setError("No file selected");
      return;
    }

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImage(null);
    setPreview("");
    setError("");
  }, []);

  return {
    image,
    preview,
    error,
    handleImageUpload,
    clearImage,
  };
};
