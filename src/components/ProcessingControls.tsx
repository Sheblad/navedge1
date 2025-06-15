import React from 'react';
import { Play, Pause, RotateCcw, Download, Settings } from 'lucide-react';

interface ProcessingControlsProps {
  isProcessing: boolean;
}

const ProcessingControls: React.FC<ProcessingControlsProps> = ({ isProcessing }) => {
  return (
    <div className="flex items-center space-x-3">
      <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
        <Settings className="w-5 h-5" />
      </button>
      <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
        <RotateCcw className="w-5 h-5" />
      </button>
      <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
        <Download className="w-5 h-5" />
      </button>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
        isProcessing ? 'bg-green-600' : 'bg-slate-700'
      }`}>
        {isProcessing ? (
          <>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Processing</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm">Ready</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessingControls;