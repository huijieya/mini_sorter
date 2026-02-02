
import React from 'react';
import { Minus, Plus, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { OrderInfo, SortingMode } from '../types';

interface ControlPanelProps {
  order: OrderInfo;
  mode: SortingMode;
  onToggleMode: (mode: SortingMode) => void;
  onUpdateActual: (val: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ order, mode, onToggleMode, onUpdateActual }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 h-full flex flex-col overflow-hidden shadow-2xl p-4 relative">
      {/* Top Section: Mode and Basic Info */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sorting Mode</span>
        <div className="bg-[#2a2a2a] p-0.5 rounded-full flex items-center relative w-24">
          <div 
            className={`absolute w-[44px] h-5 bg-cyan-500 rounded-full transition-transform duration-200 ${mode === 'multi' ? 'translate-x-11' : 'translate-x-0'}`}
          />
          <button 
            onClick={() => onToggleMode('single')}
            className={`z-10 flex-1 text-[9px] font-black ${mode === 'single' ? 'text-black' : 'text-gray-500'}`}
          >
            单件
          </button>
          <button 
            onClick={() => onToggleMode('multi')}
            className={`z-10 flex-1 text-[9px] font-black ${mode === 'multi' ? 'text-black' : 'text-gray-500'}`}
          >
            多件
          </button>
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#222] p-2 rounded-lg border border-white/5">
          <span className="text-[8px] text-gray-500 uppercase font-bold block">订单号</span>
          <span className="text-xs font-mono font-bold text-gray-300 truncate block">{order.orderId}</span>
        </div>
        <div className="bg-[#222] p-2 rounded-lg border border-white/5">
          <span className="text-[8px] text-gray-500 uppercase font-bold block">条码</span>
          <span className="text-xs font-mono font-bold text-gray-300 truncate block">{order.barcode}</span>
        </div>
        <div className="col-span-2 bg-[#222] p-2 rounded-lg border border-white/5">
          <span className="text-[8px] text-gray-500 uppercase font-bold block">物品名称</span>
          <span className="text-sm font-bold text-white truncate block">{order.name}</span>
        </div>
      </div>

      {/* Quantities */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#222] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">应发</span>
          <span className="text-2xl font-black text-cyan-400 leading-none">{order.required}</span>
        </div>
        <div className="bg-[#222] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-500 uppercase font-bold mb-1">实发</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onUpdateActual(Math.max(0, order.actual - 1))}
              className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-cyan-400"
            >
              <Minus size={12} />
            </button>
            <span className="text-xl font-black text-white w-6 text-center">{order.actual}</span>
            <button 
              onClick={() => onUpdateActual(order.actual + 1)}
              className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-cyan-400"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Image Display Area - Highly prominent as requested */}
      <div className="flex-1 min-h-0 mb-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden relative group">
        {order.imageUrl ? (
          <img 
            src={order.imageUrl} 
            alt={order.name} 
            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <ImageIcon size={48} />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Preview</span>
          </div>
        )}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[8px] font-black text-cyan-400 uppercase">
          Live Preview
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        {mode === 'multi' && (
          <button className="w-full py-2.5 bg-[#22D3EE] hover:bg-[#1bb8cf] text-black font-black text-sm rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 uppercase tracking-widest">
            发车 (Confirm)
          </button>
        )}

        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <button className="relative w-full py-4 bg-[#252525] border-2 border-dashed border-cyan-500/30 rounded-xl flex items-center justify-center gap-2 transition-all hover:border-cyan-500 hover:bg-[#2a2a2a] group">
            <span className="text-xl font-black text-cyan-400 tracking-widest uppercase">请扫码</span>
            <CheckCircle2 className="text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
