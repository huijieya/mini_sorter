import React from 'react';
import { Minus, Plus, CircleCheck, Image as ImageIcon, Scan, AlertCircle } from 'lucide-react';
import { OrderInfo, SortingMode, FeedbackMessage } from '../types';

interface ControlPanelProps {
  order: OrderInfo;
  mode: SortingMode;
  feedback: FeedbackMessage;
  onToggleMode: (mode: SortingMode) => void;
  onUpdateActual: (val: number) => void;
  onDispatch: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  order, mode, feedback, onToggleMode, onUpdateActual, onDispatch 
}) => {
  const getFeedbackStyles = () => {
    switch (feedback.type) {
      case 'success': return { color: 'text-[#64C84C]', icon: <CircleCheck size={18} fill="currentColor" /> };
      case 'error': return { color: 'text-red-500', icon: <AlertCircle size={18} fill="currentColor" /> };
      default: return { color: 'text-cyan-400', icon: <Scan size={18} /> };
    }
  };

  const fbStyle = getFeedbackStyles();

  return (
    <div className="h-full flex flex-col p-2.5 gap-2 overflow-hidden font-sans">
      {/* 投递模式 - 工业风格切换器 */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">投递模式</span>
        <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
          <button 
            onClick={() => onToggleMode('single')}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${mode === 'single' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            单件
          </button>
          <button 
            onClick={() => onToggleMode('multi')}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${mode === 'multi' ? 'bg-[#64C84C] text-black shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-300'}`}
          >
            多件
          </button>
        </div>
      </div>

      {/* 订单信息 - 紧凑型网格 */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2 bg-white/5 rounded-lg border border-white/5 text-[10px]">
        <div className="flex gap-1 overflow-hidden">
          <span className="text-gray-500 shrink-0">单号:</span>
          <span className="text-gray-200 font-mono truncate leading-tight">{order.orderId || '-'}</span>
        </div>
        <div className="flex gap-1 overflow-hidden">
          <span className="text-gray-500 shrink-0">条码:</span>
          <span className="text-cyan-400 font-mono truncate font-bold leading-tight">{order.barcode || '-'}</span>
        </div>
        <div className="flex gap-1 col-span-2 border-t border-white/5 pt-1 mt-0.5">
          <span className="text-gray-500 shrink-0">品名:</span>
          <span className="text-gray-100 font-bold truncate leading-tight">{order.name || '-'}</span>
        </div>
        <div className="flex gap-1">
          <span className="text-gray-500 shrink-0">应发:</span>
          <span className="text-cyan-400 font-black leading-tight">{order.required || 0}</span>
        </div>
      </div>

      {/* 实发数量调整 */}
      <div className="flex items-center justify-between px-1 py-1 border-y border-white/5">
        <span className="text-[11px] font-black text-gray-100 uppercase tracking-tighter">实发数量</span>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={mode === 'single'}
            onClick={() => onUpdateActual(Math.max(0, order.actual - 1))}
            className="w-7 h-7 bg-gray-700 hover:bg-gray-600 disabled:opacity-20 flex items-center justify-center rounded text-white active:scale-90 transition-all border border-white/5"
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <div className="w-12 h-7 bg-black/40 border border-cyan-500/30 rounded flex items-center justify-center text-base font-black text-cyan-400 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">
            {mode === 'single' ? '-' : order.actual}
          </div>
          <button 
            disabled={mode === 'single'}
            onClick={() => onUpdateActual(order.actual + 1)}
            className="w-7 h-7 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-20 flex items-center justify-center rounded text-black active:scale-90 transition-all shadow-lg shadow-cyan-500/10"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 视觉识别区域 - 极大化比例 */}
      <div className="flex-1 min-h-0 relative border border-white/5 rounded-xl bg-black/50 flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent)]"></div>
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-sm"></div>
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-sm"></div>
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-sm"></div>
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/40 rounded-br-sm"></div>
        
        <div className="flex flex-col items-center gap-1 opacity-10 group-hover:opacity-25 transition-all duration-500 scale-90">
          <ImageIcon size={48} strokeWidth={1} />
          <span className="text-[7px] font-black tracking-[0.3em] uppercase">Visual Hub Standby</span>
        </div>
      </div>

      {/* 底部反馈与操作 */}
      <div className="space-y-1.5 mt-auto">
        <button 
          onClick={onDispatch}
          disabled={mode === 'single' || !order.barcode}
          className={`w-full py-2.5 rounded-lg text-lg font-black uppercase tracking-tighter transition-all ${
            mode === 'single' || !order.barcode
            ? 'bg-gray-800 text-gray-600 opacity-20 cursor-not-allowed' 
            : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[0.98] shadow-lg shadow-cyan-500/20'
          }`}
        >
          确认发车
        </button>

        <div className="w-full py-2 bg-black/40 rounded-lg flex items-center justify-center gap-2.5 border border-white/5 shadow-inner">
          <span className={`text-[11px] font-black tracking-widest uppercase ${fbStyle.color}`}>
            {feedback.text}
          </span>
          <span className={fbStyle.color}>{fbStyle.icon}</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;