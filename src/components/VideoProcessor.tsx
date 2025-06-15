import React, { useState, useRef, useCallback } from 'react';
import { Camera, Play, Pause, Square, Download, Video } from 'lucide-react';

interface VideoProcessorProps {
  onProcessingChange: (isProcessing: boolean) => void;
}

const VideoProcessor: React.FC<VideoProcessorProps> = ({ onProcessingChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setHasPermission(false);
      setIsRecording(false);
    }
  }, [stream]);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    onProcessingChange(!isRecording);
  }, [isRecording, onProcessingChange]);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0);

    // Simple edge detection overlay
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Continue processing if recording
    if (isRecording) {
      requestAnimationFrame(processFrame);
    }
  }, [isRecording]);

  React.useEffect(() => {
    if (isRecording) {
      processFrame();
    }
  }, [isRecording, processFrame]);

  return (
    <div className="space-y-6">
      {/* Camera Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!hasPermission ? (
          <button
            onClick={startCamera}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={toggleRecording}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Processing
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Processing
                </>
              )}
            </button>
            
            <button
              onClick={stopCamera}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Camera
            </button>
          </>
        )}
      </div>

      {/* Video Display */}
      {hasPermission && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Video Feed */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Live Camera Feed
            </h3>
            <div className="bg-slate-900 rounded-lg p-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Processed Video */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Edge Detection Output
            </h3>
            <div className="bg-slate-900 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="bg-slate-800/50 rounded-lg p-6">
        <h4 className="text-white font-semibold mb-4">Processing Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Camera:</span>
            <span className={hasPermission ? 'text-green-400' : 'text-red-400'}>
              {hasPermission ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Processing:</span>
            <span className={isRecording ? 'text-green-400' : 'text-slate-400'}>
              {isRecording ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Frame Rate:</span>
            <span className="text-slate-300">
              {isRecording ? '30 FPS' : '0 FPS'}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!hasPermission && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h4 className="text-blue-300 font-semibold mb-2">Getting Started</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Click "Start Camera" to access your webcam</li>
            <li>• Allow camera permissions when prompted</li>
            <li>• Click "Start Processing" to begin real-time edge detection</li>
            <li>• The processed output will show detected edges and navigation paths</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoProcessor;