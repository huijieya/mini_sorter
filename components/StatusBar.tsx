
import React from 'react';
import { User, Camera, Cpu } from 'lucide-react';
import { HardwareStatus } from '../types';

interface StatusBarProps {
  status: HardwareStatus;
}

const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  return (
    <div className="bg-[#1f1f1f] rounded-lg py-1.5 px-4 flex items-center justify-between border border-white/5 shadow-md">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-cyan-500/15 rounded-full flex items-center justify-center border border-cyan-500/20">
          <User className="text-cyan-400" size={14} />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-500 uppercase font-black tracking-tighter leading-none mb-0.5">Operator</span>
          <span className="text-xs font-bold text-gray-200">Hyper001</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Camera</span>
          <Camera size={14} className={status.cameraConnected ? "text-green-500" : "text-red-500 opacity-50"} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Device</span>
          <Cpu size={14} className={status.networkConnected ? "text-green-500" : "text-red-500 opacity-50"} />
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
