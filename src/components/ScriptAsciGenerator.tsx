import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Copy, Check, Palette, Maximize2, Type, Printer } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processImage } from "./imageProcessor";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { FullscreenDialog } from "./FullscreenDialog";
import { PrintableAscii } from "./PrintableAscii";
import { createPrintStyles } from "./printStyles";
import { TextPixel, ProcessingMode, ProcessingResult } from "./types";

const LOREM_IPSUM =
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. `.repeat(
    50
  );

interface OriginalImageData {
  imageData: ImageData;
  width: number;
  height: number;
}

const ScriptAsciiGenerator = () => {
  const [inputText, setInputText] = useState(LOREM_IPSUM);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(
    null
  );
  const [originalImageData, setOriginalImageData] =
    useState<OriginalImageData | null>(null);
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [textArt, setTextArt] = useState<TextPixel[][]>([]);
  const [width, setWidth] = useState(100);
  const [threshold, setThreshold] = useState(128);
  const [mode, setMode] = useState<ProcessingMode>("threshold");
  const [sensitivity, setSensitivity] = useState(30);
  const [showProcessed, setShowProcessed] = useState(false);
  const [isColored, setIsColored] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isBold, setIsBold] = useState(true);

  // Helper function to get average color from a region of pixels
  const getAverageColor = (
    imageData: ImageData,
    startX: number,
    startY: number,
    width: number,
    height: number,
    regionSize: number = 1
  ): string => {
    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let y = startY; y < Math.min(startY + regionSize, height); y++) {
      for (let x = startX; x < Math.min(startX + regionSize, width); x++) {
        const i = (y * width + x) * 4;
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
        count++;
      }
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return `rgb(${r},${g},${b})`;
  };

  // Create scaled original image data
  const createOriginalImageData = useCallback(
    (img: HTMLImageElement, targetWidth: number) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const scale = targetWidth / img.width;
      const scaledHeight = Math.floor(img.height * scale * 0.5);
      canvas.width = targetWidth;
      canvas.height = scaledHeight;

      ctx.drawImage(img, 0, 0, targetWidth, scaledHeight);
      const imageData = ctx.getImageData(0, 0, targetWidth, scaledHeight);

      return {
        imageData,
        width: targetWidth,
        height: scaledHeight,
      };
    },
    []
  );

  useEffect(() => {
    if (!currentImage) return;

    // Store original image data
    const origData = createOriginalImageData(currentImage, width);
    setOriginalImageData(origData);

    // Process image for ASCII conversion
    processImage(currentImage, {
      mode,
      threshold,
      sensitivity,
      width,
      height: currentImage.height,
    }).then((result) => {
      setProcessingResult(result);
    });
  }, [
    currentImage,
    mode,
    threshold,
    sensitivity,
    width,
    createOriginalImageData,
  ]);

  useEffect(() => {
    if (!processingResult || !originalImageData) return;

    const { imageData: processedData, width, height } = processingResult;
    const pixels = processedData.data;
    let textIndex = 0;
    const result: TextPixel[][] = [];
    const regionSize = 2; // Size of region to average for color sampling

    for (let y = 0; y < height; y++) {
      const row: TextPixel[] = [];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        // Get color from original image data
        const color = getAverageColor(
          originalImageData.imageData,
          x,
          y,
          width,
          height,
          regionSize
        );

        if (brightness < 128) {
          row.push({
            char: inputText[textIndex % inputText.length],
            color,
          });
          textIndex++;
        } else {
          row.push({
            char: " ",
            color: "transparent",
          });
        }
      }
      result.push(row);
    }

    setTextArt(result);
  }, [processingResult, originalImageData, inputText]);

  const handleImageUpload = useCallback((file: File) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = () => {
        setCurrentImage(img);
      };
    };

    reader.readAsDataURL(file);
  }, []);

  const handleImageClear = useCallback(() => {
    setCurrentImage(null);
    setProcessingResult(null);
    setOriginalImageData(null);
    setTextArt([]);
  }, []);

  const handleCopy = useCallback(() => {
    const text = textArt
      .map((row) => row.map((pixel) => pixel.char).join(""))
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [textArt]);

  const handlePrint = useCallback(() => {
    const aspectRatio =
      textArt.length > 0
        ? Math.max(...textArt.map((row) => row.length)) / textArt.length
        : 1;
    const style = createPrintStyles(aspectRatio);
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  }, [textArt]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-xl font-bold">Script ASCII Art Generator</h2>
        <div className="flex-1 flex gap-4 items-center">
          <Select
            value={mode}
            onValueChange={(value: ProcessingMode) => setMode(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="threshold">Basic Threshold</SelectItem>
              <SelectItem value="edge">Edge Detection</SelectItem>
              <SelectItem value="dither">Dithering</SelectItem>
              <SelectItem value="adaptive">Adaptive (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 flex gap-2 items-center">
            <span className="text-sm">Width:</span>
            <Slider
              min={50}
              max={200}
              step={5}
              value={[width]}
              onValueChange={([newWidth]) => setWidth(newWidth)}
              className="w-48"
            />
            <span className="text-sm w-12">{width}ch</span>
          </div>

          {mode === "threshold" || mode === "dither" ? (
            <div className="flex-1 flex gap-2 items-center">
              <span className="text-sm">Threshold:</span>
              <Slider
                min={0}
                max={255}
                step={1}
                value={[threshold]}
                onValueChange={([newVal]) => setThreshold(newVal)}
                className="w-48"
              />
              <span className="text-sm w-12">{threshold}</span>
            </div>
          ) : mode === "edge" ? (
            <div className="flex-1 flex gap-2 items-center">
              <span className="text-sm">Sensitivity:</span>
              <Slider
                min={1}
                max={255}
                step={1}
                value={[sensitivity]}
                onValueChange={([newVal]) => setSensitivity(newVal)}
                className="w-48"
              />
              <span className="text-sm w-12">{sensitivity}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-32"
            />
          </CardContent>
        </Card>

        <ImageUpload
          onImageUpload={handleImageUpload}
          onImageClear={handleImageClear}
        />
      </div>

      {textArt.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Script Art Output</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-16"
                    onClick={() => setShowProcessed((old) => !old)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsColored(!isColored)}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBold(!isBold)}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <FullscreenDialog
                      textArt={textArt}
                      isColored={isColored}
                      isBold={isBold}
                    />
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {showProcessed && processingResult && (
                <img
                  src={processingResult.previewUrl}
                  alt="Processed preview"
                  className="w-1/2 max-h-full object-contain"
                />
              )}
              {!showProcessed && (
                <pre
                  className={`font-mono text-xs whitespace-pre overflow-x-auto bg-white p-4 rounded-md ${
                    isBold ? "font-bold" : "font-normal"
                  }`}
                >
                  {textArt.map((row, i) => (
                    <div key={i} style={{ lineHeight: "1.2" }}>
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
              )}
            </CardContent>
          </Card>
          <div id="printable-ascii" className="hidden print:block">
            <PrintableAscii
              textArt={textArt}
              isColored={isColored}
              isBold={isBold}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ScriptAsciiGenerator;
