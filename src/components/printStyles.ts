export const createPrintStyles = (aspectRatio: number) => {
  // Typical monospace character aspect ratio (width:height)
  const CHAR_ASPECT_RATIO = 0.5;

  // Adjust aspectRatio to account for character dimensions
  const adjustedAspectRatio = aspectRatio * CHAR_ASPECT_RATIO;

  const style = document.createElement("style");
  style.textContent = `
    @media print {
      @page {
        size: ${adjustedAspectRatio > 595 / 842 ? "landscape" : "portrait"};
        margin: 0;
      }

      html, body {
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden;
      }

      #printable-ascii {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        height: 100vh !important;
        width: 100vw !important;
        background: white !important;
        z-index: 9999 !important;
      }

      #printable-ascii pre {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
      }
    }
  `;
  return style;
};
