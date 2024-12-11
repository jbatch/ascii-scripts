# AsciiScripts

AsciiScripts is a web-based image transformation toolkit that specializes in converting images into artistic ASCII and text-based art.

## Features

### 1. ASCII Art Generator

- Upload and convert images into ASCII art
- Multiple processing modes:
  - Basic Threshold: Simple black and white conversion
  - Edge Detection: Highlight image edges with text
  - Dithering: Advanced pattern-based conversion
  - Adaptive: Smart contrast adjustment (Coming Soon)
- Real-time preview
- Customizable width and processing parameters
- Color preservation option

### 2. Text-Based ASCII Generator

- Create ASCII art using your own text or scripts
- Perfect for recreating images using meaningful text
- Maintains original image colors
- Adjustable text mapping and patterns
- Support for custom fonts and styling

### 3. Image Processing Tools

- Multiple processing algorithms
- Adjustable threshold and sensitivity controls
- Real-time preview of processed images
- Width and scale customization
- Color and monochrome output options

## Technical Stack

- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone git@github.com:jbatch/ascii-scripts.git
cd ascii-scripts
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Usage

### Basic ASCII Art Generation

1. Navigate to the "Random ASCII" tab
2. Upload an image using drag-and-drop or file selection
3. Adjust the width and processing parameters
4. Use the toolbar to customize the output:
   - Toggle color preservation
   - Adjust font weight
   - View in fullscreen
   - Copy to clipboard
   - Print output

### Text-Based ASCII Art

1. Navigate to the "Text ASCII" tab
2. Enter your desired text in the input field
3. Upload an image to convert
4. Adjust processing parameters to fine-tune the output
5. Use the available tools to customize and export your creation
