
import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, CheckCircle2, Image as ImageIcon, Scan, AlertCircle } from 'lucide-react';
import { OrderInfo, SortingMode } from '../types';

interface ControlPanelProps {
  order: OrderInfo;
  mode: SortingMode;
  feedback: { text: string; type: 'info' | 'success' | 'error' };
  cameraOnline: boolean;
  onToggleMode: (mode: SortingMode) => void;
  onUpdateActual: (val: number) => void;
  onDispatch: () => void;
  onManualScan: (barcode: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  order, mode, feedback, cameraOnline, 
  onToggleMode, onUpdateActual, onDispatch, onManualScan 
}) => {
  const [scanValue, setScanValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦逻辑：如果没有相机，或者即使有相机但用户想手动扫，始终保持聚焦
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (document.activeElement?.tagName !== 'INPUT' && !cameraOnline) {
        inputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(focusInterval);
  }, [cameraOnline]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanValue.trim()) {
      onManualScan(scanValue.trim());
      setScanValue('');
    }
  };

  const getFeedbackStyles = () => {
    switch (feedback.type) {
      case 'success': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'error': return 'bg-red-500/20 border-red-500 text-red-400 animate-pulse';
      default: return 'bg-[#252525] border-cyan-500/30 text-cyan-400';
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/10 h-full flex flex-col overflow-hidden shadow-2xl p-4 relative">
      {/* 隐藏的扫码输入框 */}
      <form onSubmit={handleScanSubmit} className="absolute opacity-0 pointer-events-none">
        <input 
          ref={inputRef}
          type="text" 
          value={scanValue} 
          onChange={(e) => setScanValue(e.target.value)}
          autoFocus={!cameraOnline}
        />
      </form>

      {/* Top Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sorting Mode</span>
          {!cameraOnline && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 rounded animate-pulse">键盘录入模式</span>}
        </div>
        <div className="bg-[#2a2a2a] p-0.5 rounded-full flex items-center relative w-24">
          <div 
            className={`absolute w-[44px] h-5 bg-cyan-500 rounded-full transition-transform duration-200 ${mode === 'multi' ? 'translate-x-11' : 'translate-x-0'}`}
          />
          <button onClick={() => onToggleMode('single')} className={`z-10 flex-1 text-[9px] font-black ${mode === 'single' ? 'text-black' : 'text-gray-500'}`}>单件</button>
          <button onClick={() => onToggleMode('multi')} className={`z-10 flex-1 text-[9px] font-black ${mode === 'multi' ? 'text-black' : 'text-gray-500'}`}>多件</button>
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

      {/* Quantities - Conditionally Interactive */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#222] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">应发</span>
          <span className="text-2xl font-black text-cyan-400 leading-none">{order.required}</span>
        </div>
        <div className="bg-[#222] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center relative">
          <span className="text-[8px] text-gray-500 uppercase font-bold mb-1">实发</span>
          {mode === 'multi' ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onUpdateActual(Math.max(0, order.actual - 1))}
                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 hover:bg-white/10"
              >
                <Minus size={12} />
              </button>
              <span className="text-xl font-black text-white w-6 text-center">{order.actual}</span>
              <button 
                onClick={() => onUpdateActual(order.actual + 1)}
                className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-cyan-400 hover:bg-white/10"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <span className="text-xl font-black text-gray-500">{order.actual || '-'}</span>
          )}
        </div>
      </div>

      {/* Image Area */}
      <div className="flex-1 min-h-0 mb-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden relative group">
        {order.imageUrl ? (
          <img src={order.imageUrl} alt={order.name} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <ImageIcon size={48} />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Preview</span>
          </div>
        )}
      </div>

      {/* Feedback & Action Buttons */}
      <div className="space-y-2 mt-auto">
        {mode === 'multi' && (
          <button 
            onClick={onDispatch}
            disabled={order.actual === 0}
            className="w-full py-2.5 bg-[#22D3EE] hover:bg-[#1bb8cf] text-black font-black text-sm rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发车 (Confirm)
          </button>
        )}

        <div className="relative">
          <button 
            className={`
              w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-all
              ${getFeedbackStyles()}
            `}
            onClick={() => inputRef.current?.focus()}
          >
            {feedback.type === 'error' ? <AlertCircle size={24} /> : feedback.type === 'success' ? <CheckCircle2 size={24} /> : <Scan size={24} />}
            <span className="text-lg font-black tracking-widest uppercase truncate px-4">
              {feedback.text}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
