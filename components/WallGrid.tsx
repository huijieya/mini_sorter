
import React from 'react';
import { Wall, SlotStatus } from '../types';

interface WallGridProps {
  wall: Wall;
  onSlotClick: (id: string) => void;
  className?: string;
}

const WallGrid: React.FC<WallGridProps> = ({ wall, onSlotClick, className = "" }) => {
  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case SlotStatus.OPEN: return 'bg-[#64C84C] text-black border-none shadow-[0_0_10px_rgba(100,200,76,0.3)]';
      case SlotStatus.IN_PROGRESS: return 'bg-[#F59E0B] text-black border-none';
      case SlotStatus.FULL: return 'bg-[#FACC15] text-black border-none';
      case SlotStatus.FINISHED: return 'bg-[#22D3EE] text-black border-none';
      default: return 'bg-gray-700/20 text-gray-500 border-gray-600/30';
    }
  };

  // 如果分拨墙在线，显示正常的 20 格料框
  if (wall.online) {
    return (
      <div className={`bg-[#1a1a1a] rounded-xl p-2.5 border border-white/5 flex flex-col overflow-hidden shadow-2xl ${className}`}>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-black text-gray-400 tracking-tight uppercase">墙号：{wall.name}</span>
        </div>
        
        <div className="grid grid-cols-5 grid-rows-4 gap-1.5 flex-1 min-h-0">
          {wall.slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSlotClick(slot.id)}
              className={`
                w-full h-full rounded-md border flex flex-col items-center justify-center 
                transition-all active:scale-95 text-[10px] font-black relative group
                ${getStatusColor(slot.status)}
              `}
            >
              <span className="absolute top-1 left-1.5 text-[8px] opacity-40 group-hover:opacity-100">
                {slot.label}
              </span>
              {slot.count > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-lg leading-none font-black">{slot.count}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 如果分拨墙离线，显示图片右下角的“未检测到分拨墙”样式
  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-white/5 flex flex-col overflow-hidden relative ${className}`}>
      <div className="pt-2 px-3">
        <span className="text-[10px] font-black text-gray-500 tracking-tight uppercase">墙号：-</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* 背景水印 "HI" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[120px] font-black italic tracking-tighter select-none">HI</span>
        </div>
        
        {/* 提示文字 */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-gray-600 tracking-widest">未检测到分拨墙</span>
          <div className="w-8 h-1 bg-gray-700/30 rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default WallGrid;
