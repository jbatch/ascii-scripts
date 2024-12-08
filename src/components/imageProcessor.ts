// imageProcessor.ts

import { ProcessingOptions, ProcessingResult } from "./types";

export const processImage = async (
  sourceImage: HTMLImageElement,
  options: ProcessingOptions
): Promise<ProcessingResult> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Scale image to desired size
  const scale = options.width / sourceImage.width;
  const scaledHeight = Math.floor(sourceImage.height * scale * 0.5);
  canvas.width = options.width;
  canvas.height = scaledHeight;

  ctx.drawImage(sourceImage, 0, 0, options.width, scaledHeight);
  let imageData = ctx.getImageData(0, 0, options.width, scaledHeight);

  // Apply selected processing mode
  switch (options.mode) {
    case "threshold": {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = brightness < options.threshold ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = value;
      }
      break;
    }
    case "edge": {
      const output = new ImageData(
        new Uint8ClampedArray(imageData.data),
        canvas.width,
        canvas.height
      );
      const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

      // Helper function to get pixel value with edge handling
      const getPixel = (x: number, y: number): number => {
        // Handle edge cases by duplicating edge pixels
        const safeX = Math.min(Math.max(x, 0), canvas.width - 1);
        const safeY = Math.min(Math.max(y, 0), canvas.height - 1);
        const idx = (safeY * canvas.width + safeX) * 4;
        return (
          (imageData.data[idx] +
            imageData.data[idx + 1] +
            imageData.data[idx + 2]) /
          3
        );
      };

      // Process all pixels including edges
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          let pixelX = 0;
          let pixelY = 0;

          // Apply Sobel operators
          for (let kernelY = 0; kernelY < 3; kernelY++) {
            for (let kernelX = 0; kernelX < 3; kernelX++) {
              const pixel = getPixel(x + kernelX - 1, y + kernelY - 1);

              pixelX += pixel * sobelX[kernelY * 3 + kernelX];
              pixelY += pixel * sobelY[kernelY * 3 + kernelX];
            }
          }

          const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
          const idx = (y * canvas.width + x) * 4;
          const edge = magnitude > options.sensitivity ? 0 : 255;
          output.data[idx] = output.data[idx + 1] = output.data[idx + 2] = edge;
          output.data[idx + 3] = 255;
        }
      }
      imageData = output;
      break;
    }
    case "dither": {
      const output = new ImageData(
        new Uint8ClampedArray(imageData.data),
        canvas.width,
        canvas.height
      );
      const data = output.data;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const oldPixel = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const newPixel = oldPixel < options.threshold ? 0 : 255;
          const error = oldPixel - newPixel;

          data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

          if (x + 1 < canvas.width) {
            data[idx + 4] += (error * 7) / 16;
            if (y + 1 < canvas.height) {
              data[idx + 4 + canvas.width * 4] += (error * 1) / 16;
            }
          }
          if (y + 1 < canvas.height) {
            data[idx + canvas.width * 4] += (error * 5) / 16;
            if (x > 0) {
              data[idx - 4 + canvas.width * 4] += (error * 3) / 16;
            }
          }
        }
      }
      imageData = output;
      break;
    }
  }

  // Create preview URL
  ctx.putImageData(imageData, 0, 0);
  const previewUrl = canvas.toDataURL();

  return {
    imageData,
    previewUrl,
    width: options.width,
    height: scaledHeight,
  };
};
