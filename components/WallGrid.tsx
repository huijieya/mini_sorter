import React from 'react';
import { Wall, SlotStatus } from '../types';

interface WallGridProps {
  wall: Wall;
  onSlotClick: (id: string) => void;
  className?: string;
}

const WallGrid: React.FC<WallGridProps> = ({ wall, onSlotClick, className = "" }) => {
  const getStatusStyle = (status: SlotStatus) => {
    switch (status) {
      case SlotStatus.OPEN: return 'bg-[#64C84C] text-black border-none shadow-[0_0_6px_rgba(100,200,76,0.2)]';
      case SlotStatus.IN_PROGRESS: return 'bg-[#f88133] text-black border-none';
      case SlotStatus.FULL: return 'bg-[#ffc634] text-black border-none';
      case SlotStatus.FINISHED: return 'bg-[#22D3EE] text-black border-none';
      default: return 'bg-[#2a2a2a] text-gray-600 border-white/5';
    }
  };

  if (wall.online) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="mb-0.5 px-1">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Wall: {wall.name}</span>
        </div>
        
        <div className="grid grid-cols-5 grid-rows-4 gap-1 flex-1 border border-white/5 p-1 rounded-lg bg-black/20">
          {wall.slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSlotClick(slot.id)}
              className={`
                w-full h-full rounded-sm border flex flex-col items-center justify-center 
                transition-all active:scale-90 text-[7px] font-black relative overflow-hidden
                ${getStatusStyle(slot.status)}
              `}
            >
              <span className="absolute top-0.5 left-0.5 opacity-40 font-mono">
                {slot.label}
              </span>
              {slot.count > 0 && (
                <span className="text-sm font-black mt-1 leading-none">{slot.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col relative ${className}`}>
      <div className="mb-0.5 px-1">
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Wall: -</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center border border-white/5 rounded-lg bg-black/10 overflow-hidden">
        <span className="text-[10px] font-bold text-gray-800 tracking-wider">OFFLINE</span>
      </div>
    </div>
  );
};

export default WallGrid;