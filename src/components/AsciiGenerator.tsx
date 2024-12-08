import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Copy, Check, Palette } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const CHARACTER_SETS = {
  basic: " .:-=+*#%@",
  extended:
    "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
      .split("")
      .reverse()
      .join(""),
};

interface ColorOption {
  name: string;
  hue: number;
  preview: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { name: "Blue", hue: 220, preview: "hsl(220, 70%, 50%)" },
  { name: "Purple", hue: 270, preview: "hsl(270, 70%, 50%)" },
  { name: "Pink", hue: 330, preview: "hsl(330, 70%, 50%)" },
  { name: "Red", hue: 0, preview: "hsl(0, 70%, 50%)" },
  { name: "Orange", hue: 30, preview: "hsl(30, 70%, 50%)" },
  { name: "Green", hue: 150, preview: "hsl(150, 70%, 50%)" },
  { name: "Teal", hue: 180, preview: "hsl(180, 70%, 50%)" },
  { name: "Cyan", hue: 195, preview: "hsl(195, 70%, 50%)" },
];

// Generate colors for the gradient
const generateColorGradient = (
  numColors: number,
  isDark: boolean,
  hue: number
): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    const brightness = isDark
      ? 90 - (i * 50) / numColors // Dark mode: 90% to 40% brightness
      : 80 - (i * 60) / numColors; // Light mode: 80% to 20% brightness
    colors.push(`hsl(${hue}, 70%, ${brightness}%)`);
  }
  return colors;
};

const toGrayScale = (r: number, g: number, b: number): number => {
  return Math.floor(0.21 * r + 0.72 * g + 0.07 * b);
};

interface AsciiOutput {
  char: string;
  colorIndex: number;
}

const AsciiGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [asciiArt, setAsciiArt] = useState<AsciiOutput[][]>([]);
  const [characterSet, setCharacterSet] = useState<"basic" | "extended">(
    "basic"
  );
  const [width, setWidth] = useState<number>(65);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isColored, setIsColored] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    COLOR_OPTIONS[0]
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleCopy = useCallback(() => {
    const plainText = asciiArt
      .map((row) => row.map((char) => char.char).join(""))
      .join("\n");
    navigator.clipboard.writeText(plainText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [asciiArt]);

  const generateAscii = useCallback(
    async (file: File) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const scale = width / img.width;
        const height = Math.floor(img.height * scale * 0.5);
        const canvasWidth = Math.floor(img.width * scale);

        canvas.width = canvasWidth;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, canvasWidth, height);
        const imageData = ctx.getImageData(0, 0, canvasWidth, height);
        const pixels = imageData.data;

        const grayscaleImageData = new ImageData(canvasWidth, height);
        for (let i = 0; i < pixels.length; i += 4) {
          const gray =
            255 - toGrayScale(pixels[i], pixels[i + 1], pixels[i + 2]);
          grayscaleImageData.data[i] = gray;
          grayscaleImageData.data[i + 1] = gray;
          grayscaleImageData.data[i + 2] = gray;
          grayscaleImageData.data[i + 3] = 255;
        }

        const previewCtx = previewCanvasRef.current?.getContext("2d");
        if (previewCtx) {
          previewCtx.canvas.width = canvasWidth;
          previewCtx.canvas.height = height;
          previewCtx.putImageData(grayscaleImageData, 0, 0);
        }

        const chars = CHARACTER_SETS[characterSet];
        const newAsciiArt: AsciiOutput[][] = [];

        for (let i = 0; i < height; i++) {
          const row: AsciiOutput[] = [];
          for (let j = 0; j < canvasWidth; j++) {
            const idx = (i * canvasWidth + j) * 4;
            const gray = grayscaleImageData.data[idx];
            const charIdx = Math.floor((gray * (chars.length - 1)) / 255);
            row.push({
              char: chars[charIdx],
              colorIndex: charIdx,
            });
          }
          newAsciiArt.push(row);
        }

        setAsciiArt(newAsciiArt);
      };

      reader.readAsDataURL(file);
    },
    [characterSet, width]
  );

  const handleImageUpload = useCallback((newFile: File) => {
    setFile(newFile);
  }, []);

  useEffect(() => {
    if (!file) {
      setAsciiArt([]);
      const previewCtx = previewCanvasRef.current?.getContext("2d");
      if (previewCtx) {
        previewCtx.clearRect(
          0,
          0,
          previewCtx.canvas.width,
          previewCtx.canvas.height
        );
      }
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      generateAscii(file);
    }
  }, [file, generateAscii]);

  const colors = generateColorGradient(
    CHARACTER_SETS[characterSet].length,
    isDarkMode,
    selectedColor.hue
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-xl font-bold">ASCII Art Generator</h2>
        <div className="flex-1 flex gap-4 items-center">
          <div className="w-[180px]">
            <Select
              value={characterSet}
              onValueChange={(value: "basic" | "extended") =>
                setCharacterSet(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Character Set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Characters</SelectItem>
                <SelectItem value="extended">Extended Characters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex gap-2 items-center">
            <span className="text-sm">Width:</span>
            <Slider
              min={30}
              max={200}
              step={5}
              value={[width]}
              onValueChange={([newWidth]) => setWidth(newWidth)}
              className="w-48"
            />
            <span className="text-sm w-12">{width}ch</span>
          </div>
        </div>
      </div>

      <ImageUpload onImageUpload={handleImageUpload} />

      {asciiArt.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">ASCII Output</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsColored(!isColored)}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  {isColored && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0 mt-1"
                          style={{ backgroundColor: selectedColor.preview }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2">
                        <div className="grid grid-cols-4 gap-1">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color.name}
                              className={`w-8 h-8 rounded-md transition-all ${
                                selectedColor.name === color.name
                                  ? "ring-2 ring-offset-2 ring-ring"
                                  : "hover:scale-110"
                              }`}
                              style={{ backgroundColor: color.preview }}
                              onClick={() => setSelectedColor(color)}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <pre
                className={`font-mono text-xs whitespace-pre overflow-x-auto ${
                  isDarkMode ? "bg-black" : "bg-white"
                } p-4 rounded-md transition-colors`}
              >
                {asciiArt.map((row, i) => (
                  <div key={i} style={{ lineHeight: "1.2" }}>
                    {row.map((char, j) => (
                      <span
                        key={`${i}-${j}`}
                        style={{
                          color: isColored
                            ? colors[char.colorIndex]
                            : isDarkMode
                            ? "white"
                            : "black",
                        }}
                      >
                        {char.char}
                      </span>
                    ))}
                  </div>
                ))}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AsciiGenerator;
