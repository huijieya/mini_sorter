
import React, { useState, useEffect, useCallback } from 'react';
import { SlotStatus, SortingMode, Wall, OrderInfo, HardwareStatus, BackendResponse } from './types';
import { callBackend, listenFromBackend } from './services/bridge';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import WallGrid from './components/WallGrid';
import ControlPanel from './components/ControlPanel';
import SettingsOverlay from './components/SettingsOverlay';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [sortingMode, setSortingMode] = useState<SortingMode>('single');
  const [feedback, setFeedback] = useState<{ text: string; type: 'info' | 'success' | 'error' }>({
    text: '等待扫码...',
    type: 'info'
  });
  
  // 硬件状态
  const [hwStatus, setHwStatus] = useState<HardwareStatus>({
    cameraConnected: false, // 默认设为false以便测试光标聚焦逻辑
    networkConnected: true
  });

  // 墙面数据
  const [walls, setWalls] = useState<Wall[]>([
    { 
      id: 'w1', name: 'Wall001', online: true, 
      slots: Array.from({ length: 20 }, (_, i) => ({ 
        id: `A${i+1}`, label: `A${i+1}`,
        status: SlotStatus.CLOSED,
        count: 0
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
      id: 'w4', name: 'Wall004', online: false, 
      slots: Array.from({ length: 20 }, (_, i) => ({ id: `D${i+1}`, label: `D${i+1}`, count: 0, status: SlotStatus.CLOSED })) 
    },
  ]);

  const [order, setOrder] = useState<OrderInfo>({
    orderId: '-',
    barcode: '-',
    name: '请扫码开始',
    required: 0,
    actual: 0
  });

  // 处理发车逻辑
  const handleDispatch = useCallback(() => {
    callBackend('DISPATCH_CONFIRM', { 
      orderId: order.orderId, 
      barcode: order.barcode, 
      actual: order.actual 
    });
    setFeedback({ text: '发车成功！', type: 'success' });
    
    // 3秒后恢复默认反馈
    setTimeout(() => {
      setFeedback({ text: '等待扫码...', type: 'info' });
    }, 3000);
  }, [order]);

  // 处理扫码输入
  const handleManualScan = (barcode: string) => {
    setFeedback({ text: '正在查询: ' + barcode, type: 'info' });
    callBackend('MANUAL_SCAN', { barcode });
  };

  // 接收后端指令
  useEffect(() => {
    listenFromBackend((key, res: BackendResponse) => {
      if (res.code !== 0) {
        setFeedback({ text: res.message || '操作失败', type: 'error' });
        return;
      }

      const { data } = res;
      switch (key) {
        case 'STATUS_SYNC':
          if (data.hardware) setHwStatus(data.hardware);
          break;

        case 'SCAN_RESULT':
          setOrder(data.order);
          setFeedback({ text: '识别成功: ' + data.order.barcode, type: 'success' });
          
          // 更新墙面亮灯
          if (data.target) {
            const { wallId, slotId } = data.target;
            setWalls(prev => prev.map(w => w.id === wallId ? {
              ...w,
              slots: w.slots.map(s => s.id === slotId ? { ...s, status: SlotStatus.OPEN } : s)
            } : w));
          }

          // 单件模式逻辑：自动发车
          if (sortingMode === 'single') {
            setTimeout(() => {
              handleDispatch();
            }, 500); // 略微延迟增加视觉反馈感
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

  const handleSlotClick = (wallId: string, slotId: string) => {
    callBackend('SLOT_CLICK', { wallId, slotId });
  };

  const handleUpdateActual = (val: number) => {
    setOrder(prev => ({ ...prev, actual: val }));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f0f0f] text-gray-200 overflow-hidden relative">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="flex-1 px-4 py-1 flex flex-col gap-2 overflow-hidden">
        <StatusBar status={hwStatus} />

        <div className="flex-1 flex gap-2.5 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-2.5 w-[28%] h-full overflow-hidden">
            <WallGrid wall={walls[0]} onSlotClick={(id) => handleSlotClick(walls[0].id, id)} className="flex-1" />
            <WallGrid wall={walls[2]} onSlotClick={(id) => handleSlotClick(walls[2].id, id)} className="flex-1" />
          </div>

          <div className="flex-1 min-w-[340px]">
            <ControlPanel 
              order={order} 
              mode={sortingMode} 
              feedback={feedback}
              cameraOnline={hwStatus.cameraConnected}
              onToggleMode={(m) => setSortingMode(m)}
              onUpdateActual={handleUpdateActual}
              onDispatch={handleDispatch}
              onManualScan={handleManualScan}
            />
          </div>

          <div className="flex flex-col gap-2.5 w-[28%] h-full overflow-hidden">
            <WallGrid wall={walls[1]} onSlotClick={(id) => handleSlotClick(walls[1].id, id)} className="flex-1" />
            <WallGrid wall={walls[3]} onSlotClick={(id) => handleSlotClick(walls[3].id, id)} className="flex-1" />
          </div>
        </div>

        <div className="flex items-center gap-5 text-[9px] text-gray-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 self-start mb-1">
          <span className="font-bold uppercase opacity-60">隔口状态:</span>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm bg-gray-600"></div> 关闭</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm bg-[#64C84C]"></div> 打开</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm bg-[#F59E0B]"></div> 进行中</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm bg-[#FACC15]"></div> 满箱</div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm bg-[#22D3EE]"></div> 分拣完成</div>
          </div>
        </div>
      </main>

      {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;
