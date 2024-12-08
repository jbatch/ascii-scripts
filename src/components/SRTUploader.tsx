import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const parseSRT = (content: string): string => {
  // Normalize line endings to \n
  const normalizedContent = content.replace(/\r\n/g, "\n");

  // Split into subtitle blocks
  const blocks = normalizedContent.split("\n\n");

  // Process each block
  const dialogueLines = blocks.map((block) => {
    const lines = block.split("\n");
    // Skip the first two lines (number and timestamp) and join the rest
    return lines.slice(2).join(" ");
  });

  // Join all dialogue and clean up whitespace
  const cleanedText = dialogueLines
    .join(" ")
    .replace(/<[^>]*>/g, "") // Remove any HTML tags
    .replace(/\{[^}]*\}/g, "") // Remove any curly brace formatting
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  return cleanedText;
};

interface SRTUploaderProps {
  onTextExtracted: (text: string) => void;
  className?: string;
}

const SRTUploader = ({ onTextExtracted, className = "" }: SRTUploaderProps) => {
  const [error, setError] = useState<string>("");

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Verify file type
      if (!file.name.toLowerCase().endsWith(".srt")) {
        setError("Please upload an SRT file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const extractedText = parseSRT(content);
          onTextExtracted(extractedText);
          setError("");
        } catch (err) {
          setError("Error processing SRT file");
          console.error("SRT processing error:", err);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
      };

      reader.readAsText(file);
    },
    [onTextExtracted]
  );

  return (
    <div className={className}>
      <input
        type="file"
        id="srt-upload"
        accept=".srt"
        onChange={handleFileUpload}
        className="hidden"
      />
      <label htmlFor="srt-upload">
        <Button variant="outline" className="w-full" asChild>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Upload SRT File
          </span>
        </Button>
      </label>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default SRTUploader;
