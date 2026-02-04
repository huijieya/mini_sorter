import React from 'react';
import { User, Video, LayoutGrid, Monitor } from 'lucide-react';
import { HardwareStatus } from '../types';

interface StatusBarProps {
  status: HardwareStatus;
}

const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black">
          <User size={14} fill="currentColor" />
        </div>
        <span className="text-xs font-bold text-gray-300">Hyper001</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-500">相机</span>
          <Video className={status.cameraConnected ? "text-[#64C84C]" : "text-red-500"} size={16} fill="currentColor" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-500">设备</span>
          <LayoutGrid className={status.deviceConnected ? "text-[#64C84C]" : "text-red-500"} size={16} fill="currentColor" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-gray-500">WES</span>
          <Monitor className={status.wesConnected ? "text-[#64C84C]" : "text-red-500"} size={16} fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default StatusBar;