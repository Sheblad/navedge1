import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, Zap, Download } from 'lucide-react';

interface ImageProcessorProps {
  onProcessingChange: (isProcessing: boolean) => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ onProcessingChange }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processImage = useCallback(async () => {
    if (!selectedImage || !canvasRef.current) return;

    onProcessingChange(true);
    
    // Simulate edge detection processing
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple edge detection simulation (convert to grayscale and enhance edges)
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          const edge = gray > 128 ? 255 : 0; // Simple threshold
          data[i] = edge;     // Red
          data[i + 1] = edge; // Green
          data[i + 2] = edge; // Blue
        }
        
        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to data URL
        setProcessedImage(canvas.toDataURL());
        onProcessingChange(false);
      };
      
      img.src = selectedImage;
    }, 2000); // Simulate processing time
  }, [selectedImage, onProcessingChange]);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-700 rounded-full w-fit mx-auto">
            <Upload className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-white font-semibold mb-2">
              Drop your image here or click to browse
            </p>
            <p className="text-slate-400 text-sm">
              Supports JPG, PNG, GIF up to 10MB
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Choose File
          </button>
        </div>
      </div>

      {/* Image Preview and Processing */}
      {selectedImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Original Image
            </h3>
            <div className="bg-slate-900 rounded-lg p-4">
              <img
                src={selectedImage}
                alt="Original"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Processed Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Edge Detection Result
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              {processedImage ? (
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <div className="p-4 bg-slate-800 rounded-full w-fit mx-auto mb-4">
                    <Zap className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400">Click "Process Image" to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing Controls */}
      {selectedImage && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={processImage}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
          >
            <Zap className="w-5 h-5 mr-2" />
            Process Image
          </button>
          
          {processedImage && (
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.download = 'processed-image.png';
                link.href = processedImage;
                link.click();
              }}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Result
            </button>
          )}
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageProcessor;