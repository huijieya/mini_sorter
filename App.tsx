
import React, { useState, useEffect } from 'react';
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
  
  // 硬件状态
  const [hwStatus, setHwStatus] = useState<HardwareStatus>({
    cameraConnected: true,
    networkConnected: true,
    wesConnected: true
  });

  // 墙面数据 - 初始状态部分设为在线用于演示
  const [walls, setWalls] = useState<Wall[]>([
    { 
      id: 'w1', name: 'Wall001', online: true, 
      slots: Array.from({ length: 20 }, (_, i) => ({ 
        id: `A${i+1}`, label: `A${i+1}`,
        status: i === 0 ? SlotStatus.OPEN : (i === 7 ? SlotStatus.FULL : (i === 8 ? SlotStatus.IN_PROGRESS : (i === 11 ? SlotStatus.FINISHED : SlotStatus.CLOSED))),
        // Fix: Removed duplicate 'count' property from line 27 and consolidated logic here.
        count: i === 11 ? 16 : (i === 0 ? 10 : 0)
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
      id: 'w4', name: 'Wall004', online: false, // 默认离线，显示新样式
      slots: Array.from({ length: 20 }, (_, i) => ({ id: `D${i+1}`, label: `D${i+1}`, count: 0, status: SlotStatus.CLOSED })) 
    },
  ]);

  // 物料订单数据
  const [order, setOrder] = useState<OrderInfo>({
    orderId: 'OD20251234',
    barcode: 'SN20259901',
    name: '某XL女式T恤',
    required: 10,
    actual: 5,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400'
  });

  // 接收后端指令
  useEffect(() => {
    listenFromBackend((key, res: BackendResponse) => {
      if (res.code !== 0) {
        console.error(`Backend Error [${key}]: ${res.message}`);
        return;
      }

      const { data } = res;

      switch (key) {
        case 'STATUS_SYNC':
          if (data.hardware) setHwStatus(data.hardware);
          if (data.walls) {
             setWalls(prev => prev.map(w => {
               const update = data.walls.find((uw: any) => uw.id === w.id);
               return update ? { ...w, online: update.online } : w;
             }));
          }
          break;

        case 'SCAN_RESULT':
          setOrder(data.order);
          if (data.target) {
            const { wallId, slotId, status } = data.target;
            setWalls(prev => prev.map(w => {
              if (w.id === wallId) {
                return {
                  ...w,
                  slots: w.slots.map(s => s.id === slotId ? { ...s, status: status || SlotStatus.OPEN } : s)
                };
              }
              return w;
            }));
          }
          break;

        case 'WALL_UPDATE':
          setWalls(prev => prev.map(w => {
            if (w.id === data.wallId) {
              return {
                ...w,
                slots: w.slots.map(s => s.id === data.slotId ? { ...s, count: data.count, status: data.status || s.status } : s)
              };
            }
            return w;
          }));
          break;
          
        case 'INIT_CONFIG':
          if (data.walls) setWalls(data.walls);
          if (data.order) setOrder(data.order);
          break;
      }
    });

    callBackend('INIT_REQUEST', {});
  }, []);

  const handleSlotClick = (wallId: string, slotId: string) => {
    callBackend('SLOT_CLICK', { wallId, slotId });
  };

  const handleUpdateActual = (val: number) => {
    callBackend('UPDATE_COUNT', { barcode: order.barcode, newActual: val });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f0f0f] text-gray-200 overflow-hidden relative">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="flex-1 px-4 py-1 flex flex-col gap-2 overflow-hidden">
        <StatusBar status={hwStatus} />

        <div className="flex-1 flex gap-2.5 min-h-0 overflow-hidden">
          {/* 左侧两面墙 */}
          <div className="flex flex-col gap-2.5 w-[28%] h-full overflow-hidden">
            <WallGrid wall={walls[0]} onSlotClick={(id) => handleSlotClick(walls[0].id, id)} className="flex-1" />
            <WallGrid wall={walls[2]} onSlotClick={(id) => handleSlotClick(walls[2].id, id)} className="flex-1" />
          </div>

          {/* 中央控制面板 */}
          <div className="flex-1 min-w-[340px] shadow-[0_0_40px_rgba(34,211,238,0.05)]">
            <ControlPanel 
              order={order} 
              mode={sortingMode} 
              onToggleMode={(m) => setSortingMode(m)}
              onUpdateActual={handleUpdateActual}
            />
          </div>

          {/* 右侧两面墙 */}
          <div className="flex flex-col gap-2.5 w-[28%] h-full overflow-hidden">
            <WallGrid wall={walls[1]} onSlotClick={(id) => handleSlotClick(walls[1].id, id)} className="flex-1" />
            <WallGrid wall={walls[3]} onSlotClick={(id) => handleSlotClick(walls[3].id, id)} className="flex-1" />
          </div>
        </div>

        {/* 状态图例 */}
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

      <div className="px-4 py-0.5 flex justify-end">
        <h2 className="text-[10px] font-black italic tracking-tighter text-white/10 select-none">HYPERLEAP TECHNOLOGY</h2>
      </div>

      {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;
