export interface TextPixel {
  char: string;
  color: string;
}

export type ProcessingMode = "threshold" | "edge" | "dither" | "adaptive";

export interface ProcessingOptions {
  mode: ProcessingMode;
  threshold: number;
  sensitivity: number;
  width: number;
  height: number;
}

export interface ProcessingResult {
  imageData: ImageData;
  previewUrl: string;
  width: number;
  height: number;
}
