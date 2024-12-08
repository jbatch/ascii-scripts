import { useRef, useEffect, useState, useCallback } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TextPixel } from "./types";

interface FullscreenDialogProps {
  textArt: TextPixel[][];
  isColored: boolean;
  isBold: boolean;
}

export const FullscreenDialog = ({
  textArt,
  isColored,
  isBold,
}: FullscreenDialogProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const [fontSize, setFontSize] = useState(12);
  const [key, setKey] = useState(0); // Force re-render key

  const calculateFontSize = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    const maxChars = Math.max(...textArt.map((row) => row.length));
    const numLines = textArt.length;

    const idealWidthFontSize = (containerWidth * 0.95) / maxChars;
    const idealHeightFontSize = (containerHeight * 0.95) / numLines;

    const newFontSize = Math.min(idealWidthFontSize, idealHeightFontSize);
    setFontSize(newFontSize);
  }, [textArt]);

  const handleRefresh = () => {
    setKey((prev) => prev + 1); // Force re-render
    setTimeout(calculateFontSize, 0);
  };

  // Initial calculation on mount
  useEffect(() => {
    calculateFontSize();
  }, [calculateFontSize, key, textArt]);

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", calculateFontSize);
    return () => window.removeEventListener("resize", calculateFontSize);
  }, [calculateFontSize, textArt]);

  return (
    <DialogContent
      className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh]"
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        setTimeout(calculateFontSize, 0);
      }}
    >
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="w-8 h-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={containerRef}
        key={key}
        className="w-full h-full overflow-hidden p-4 flex items-center justify-center"
      >
        <pre
          ref={contentRef}
          className={`font-mono whitespace-pre ${
            isBold ? "font-bold" : "font-normal"
          }`}
          style={{ fontSize: `${fontSize}px`, lineHeight: "1" }}
        >
          {textArt.map((row, i) => (
            <div key={i}>
              {row.map((pixel, j) => (
                <span
                  key={`${i}-${j}`}
                  style={{ color: isColored ? pixel.color : "black" }}
                >
                  {pixel.char}
                </span>
              ))}
            </div>
          ))}
        </pre>
      </div>
    </DialogContent>
  );
};
