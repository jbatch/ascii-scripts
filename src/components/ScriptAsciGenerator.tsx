import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Copy, Check } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processImage, ProcessingResult } from "./imageProcessor";

const LOREM_IPSUM =
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. `.repeat(
    50
  );

type ProcessingMode = "threshold" | "edge" | "dither" | "adaptive";

const ScriptAsciiGenerator = () => {
  const [inputText, setInputText] = useState(LOREM_IPSUM);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(
    null
  );
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [textArt, setTextArt] = useState<string[][]>([]);
  const [width, setWidth] = useState(100);
  const [threshold, setThreshold] = useState(128);
  const [mode, setMode] = useState<ProcessingMode>("threshold");
  const [sensitivity, setSensitivity] = useState(30);
  const [showProcessed, setShowProcessed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!currentImage) return;

    processImage(currentImage, {
      mode,
      threshold,
      sensitivity,
      width,
      height: currentImage.height,
    }).then((result) => {
      setProcessingResult(result);
    });
  }, [currentImage, mode, threshold, sensitivity, width]);

  useEffect(() => {
    if (!processingResult) return;

    const { imageData, width, height } = processingResult;
    const pixels = imageData.data;
    let textIndex = 0;
    const result: string[][] = [];

    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;

        if (brightness < 128) {
          row.push(inputText[textIndex % inputText.length]);
          textIndex++;
        } else {
          row.push(" ");
        }
      }
      result.push(row);
    }

    setTextArt(result);
  }, [processingResult, inputText]);

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
    setTextArt([]);
  }, []);

  const handleCopy = useCallback(() => {
    const text = textArt.map((row) => row.join("")).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
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
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Script Art Output</h3>
              <div className="flex gap-2">
                <Button
                  variant={"outline"}
                  size="sm"
                  className="w-16"
                  onClick={() => setShowProcessed((old) => !old)}
                >
                  Preview
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
              <pre className="font-mono text-xs whitespace-pre overflow-x-auto bg-white p-4 rounded-md">
                {textArt.map((row, i) => (
                  <div key={i} style={{ lineHeight: "1.2" }}>
                    {row.join("")}
                  </div>
                ))}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScriptAsciiGenerator;
