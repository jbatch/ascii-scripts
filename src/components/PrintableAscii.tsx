import { useEffect, useState } from "react";
import { TextPixel } from "./types";

const A4_WIDTH_PT = 595;
const A4_HEIGHT_PT = 842;
const MARGIN_PT = 6;
const CHAR_ASPECT_RATIO = 0.5; // Characters are typically twice as tall as wide

interface PrintableAsciiProps {
  textArt: TextPixel[][];
  isColored: boolean;
  isBold: boolean;
}

export const PrintableAscii = ({
  textArt,
  isColored,
  isBold,
}: PrintableAsciiProps) => {
  const [fontSize, setFontSize] = useState(12);

  useEffect(() => {
    const maxChars = Math.max(...textArt.map((row) => row.length));
    const numLines = textArt.length;

    const contentRatio = (maxChars * CHAR_ASPECT_RATIO) / numLines;
    const a4Ratio = A4_WIDTH_PT / A4_HEIGHT_PT;
    const shouldBeLandscape = contentRatio > a4Ratio;

    // Calculate available space (accounting for margins)
    const availableWidth =
      (shouldBeLandscape ? A4_HEIGHT_PT : A4_WIDTH_PT) - MARGIN_PT * 2;
    const availableHeight =
      (shouldBeLandscape ? A4_WIDTH_PT : A4_HEIGHT_PT) - MARGIN_PT * 2;

    // Line height multiplier (1.2 is typical)
    const lineHeightFactor = 1.2;

    // We want characters to fill their space better
    // Character width in points = fontSize * CHAR_ASPECT_RATIO
    // Calculate font size based on width:
    const widthBasedSize = availableWidth / (maxChars * CHAR_ASPECT_RATIO);

    // Calculate font size based on height:
    const heightBasedSize = availableHeight / (numLines * lineHeightFactor);

    // Take the smaller of the two to ensure fitting
    const idealSize = Math.min(widthBasedSize, heightBasedSize);

    // Add a small buffer to account for any rounding issues
    setFontSize(Math.floor(idealSize * 0.95));
  }, [textArt]);

  return (
    <div className="hidden print:flex print:justify-center print:items-center">
      <pre
        className={`font-mono whitespace-pre ${
          isBold ? "font-bold" : "font-normal"
        }`}
        style={{
          fontSize: `${fontSize}pt`,
          lineHeight: "1.2",
          padding: `${MARGIN_PT}pt`,
          margin: 0,
        }}
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
  );
};
