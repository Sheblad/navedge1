import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="group p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
      <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg w-fit mb-4 group-hover:shadow-lg group-hover:shadow-blue-600/25 transition-all duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;