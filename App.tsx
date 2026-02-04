import React, { useState, useEffect, useCallback } from 'react';
import { SlotStatus, SortingMode, Wall, OrderInfo, HardwareStatus, BackendResponse, FeedbackMessage } from './types';
import { callBackend, listenFromBackend } from './services/bridge';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import WallGrid from './components/WallGrid';
import ControlPanel from './components/ControlPanel';
import SettingsOverlay from './components/SettingsOverlay';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [sortingMode, setSortingMode] = useState<SortingMode>('multi');
  const [feedback, setFeedback] = useState<FeedbackMessage>({
    text: '请扫码',
    type: 'info'
  });
  
  const [hwStatus, setHwStatus] = useState<HardwareStatus>({
    cameraConnected: true,
    deviceConnected: true,
    wesConnected: true
  });

  const [walls, setWalls] = useState<Wall[]>([
    { 
      id: 'w1', name: 'Wall001', online: true, 
      slots: Array.from({ length: 20 }, (_, i) => ({ 
        id: `A${i+1}`, label: `A${i+1}`,
        status: i === 0 ? SlotStatus.OPEN : i === 7 ? SlotStatus.FULL : i === 8 ? SlotStatus.IN_PROGRESS : i === 11 ? SlotStatus.FINISHED : SlotStatus.CLOSED,
        count: i === 0 ? 10 : i === 11 ? 16 : 0
      })) 
    },
    { 
      id: 'w2', name: 'Wall002', online: true, 
      slots: Array.from({ length: 20 }, (_, i) => ({ id: `C${i+1}`, label: `C${i+1}`, count: 0, status: SlotStatus.CLOSED })) 
    },
    { 
      id: 'w3', name: 'Wall003', online: true, 
      slots: Array.from({ length: 20 }, (_, i) => ({ id: `B${i+1}`, label: `B${i+1}`, count: 0, status: SlotStatus.CLOSED })) 
    },
    { 
      id: 'w4', name: 'Wall004', online: true, 
      slots: Array.from({ length: 20 }, (_, i) => ({ id: `D${i+1}`, label: `D${i+1}`, count: 0, status: SlotStatus.CLOSED })) 
    },
  ]);

  const [order, setOrder] = useState<OrderInfo>({
    orderId: 'OD20251234',
    barcode: 'SN20259901',
    name: '某XL女式T恤',
    required: 10,
    actual: 5
  });

  const handleDispatch = useCallback((targetOrder: OrderInfo) => {
    if (!targetOrder.barcode || targetOrder.barcode === '-') return;
    
    callBackend('DISPATCH_CONFIRM', { 
      orderId: targetOrder.orderId, 
      barcode: targetOrder.barcode, 
      actual: sortingMode === 'single' ? targetOrder.required : targetOrder.actual 
    });

    setFeedback({ text: '发车成功', type: 'success' });
    
    setTimeout(() => {
      setOrder({ orderId: '', barcode: '', name: '请扫码', required: 0, actual: 0 });
      setFeedback({ text: '请扫码', type: 'info' });
    }, 1500);
  }, [sortingMode]);

  useEffect(() => {
    listenFromBackend((key, res: BackendResponse) => {
      if (res.code !== 0) {
        setFeedback({ text: res.message || '识别失败', type: 'error' });
        return;
      }

      const { data } = res;
      switch (key) {
        case 'STATUS_SYNC':
          if (data.hardware) setHwStatus(data.hardware);
          break;

        case 'SCAN_RESULT':
          const newOrder = data.order;
          setOrder({ ...newOrder, actual: newOrder.required });
          setFeedback({ text: '识别成功', type: 'success' });
          
          if (data.target) {
            const { wallId, slotId } = data.target;
            setWalls(prev => prev.map(w => w.id === wallId ? {
              ...w,
              slots: w.slots.map(s => s.id === slotId ? { ...s, status: SlotStatus.OPEN } : s)
            } : w));
          }

          if (sortingMode === 'single') {
            setTimeout(() => {
              handleDispatch(newOrder);
            }, 600);
          }
          break;

        case 'WALL_UPDATE':
          setWalls(prev => prev.map(w => w.id === data.wallId ? {
            ...w,
            slots: w.slots.map(s => s.id === data.slotId ? { ...s, count: data.count, status: data.status || s.status } : s)
          } : w));
          break;
      }
    });

    callBackend('INIT_REQUEST', {});
  }, [sortingMode, handleDispatch]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0c0c] text-gray-200 overflow-hidden select-none font-sans">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="flex-1 m-2 mt-0 p-2 bg-[#161616] rounded-xl flex flex-col gap-1.5 overflow-hidden border border-white/5 shadow-2xl">
        <StatusBar status={hwStatus} />

        <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
          {/* Left Walls */}
          <div className="flex flex-col gap-2 w-[24%] h-full">
            <WallGrid wall={walls[0]} onSlotClick={(id) => callBackend('SLOT_CLICK', { wallId: walls[0].id, slotId: id })} className="flex-1" />
            <WallGrid wall={walls[2]} onSlotClick={(id) => callBackend('SLOT_CLICK', { wallId: walls[2].id, slotId: id })} className="flex-1" />
          </div>

          {/* Center Column */}
          <div className="flex-1 min-w-[320px] bg-black/30 border border-white/5 rounded-xl overflow-hidden shadow-inner backdrop-blur-sm">
            <ControlPanel 
              order={order} 
              mode={sortingMode} 
              feedback={feedback}
              onToggleMode={setSortingMode}
              onUpdateActual={(val) => setOrder(prev => ({ ...prev, actual: val }))}
              onDispatch={() => handleDispatch(order)}
            />
          </div>

          {/* Right Walls */}
          <div className="flex flex-col gap-2 w-[24%] h-full">
            <WallGrid wall={walls[1]} onSlotClick={(id) => callBackend('SLOT_CLICK', { wallId: walls[1].id, slotId: id })} className="flex-1" />
            <WallGrid wall={walls[3]} onSlotClick={(id) => callBackend('SLOT_CLICK', { wallId: walls[3].id, slotId: id })} className="flex-1" />
          </div>
        </div>

        {/* Legend and Branding - Compact */}
        <div className="flex items-center justify-between mt-0.5 px-1 h-5">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">格口状态</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1"><div className="w-2 h-1.5 bg-gray-600 rounded-sm"></div><span className="text-[8px] text-gray-500 font-bold">关闭</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-1.5 bg-[#64C84C] rounded-sm"></div><span className="text-[8px] text-gray-500 font-bold">打开</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-1.5 bg-[#f88133] rounded-sm"></div><span className="text-[8px] text-gray-500 font-bold">进行</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-1.5 bg-[#ffc634] rounded-sm"></div><span className="text-[8px] text-gray-500 font-bold">满箱</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-1.5 bg-[#22D3EE] rounded-sm"></div><span className="text-[8px] text-gray-500 font-bold">完成</span></div>
            </div>
          </div>
          
          <div className="flex items-baseline gap-0.5 opacity-10 scale-50 origin-right">
            <span className="text-xl font-black italic tracking-tighter text-gray-100">HYPER</span>
            <span className="text-xl font-black italic tracking-tighter text-gray-500">LEAP</span>
          </div>
        </div>
      </main>

      {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;