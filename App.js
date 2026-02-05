
import Header from './components/Header.js';
import StatusBar from './components/StatusBar.js';
import WallGrid from './components/WallGrid.js';
import ControlPanel from './components/ControlPanel.js';
import SettingsOverlay from './components/SettingsOverlay.js';
import { callBackend, listenFromBackend } from './services/bridge.js';

const SlotStatus = {
  CLOSED: 'closed',
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  FULL: 'full',
  FINISHED: 'finished'
};

const App = {
  name: 'App',
  components: { Header, StatusBar, WallGrid, ControlPanel, SettingsOverlay },
  template: `
    <div class="h-screen w-screen flex flex-col bg-[#0c0c0c] text-gray-200 overflow-hidden select-none font-sans relative">
      <Header @open-settings="showSettings = true" @open-dev="showDev = !showDev" />

      <main class="flex-1 m-2 mt-0 p-2 bg-[#161616] rounded-xl flex flex-col gap-1.5 overflow-hidden border border-white/5 shadow-2xl">
        <StatusBar :status="hwStatus" />

        <div class="flex-1 flex gap-2 min-h-0 overflow-hidden">
          <div class="flex flex-col gap-2 w-[24%] h-full">
            <WallGrid :wall="walls[0]" @slot-click="handleSlotClick" class="flex-1" />
            <WallGrid :wall="walls[2]" @slot-click="handleSlotClick" class="flex-1" />
          </div>

          <div class="flex-1 min-w-[320px] bg-black/30 border border-white/5 rounded-xl overflow-hidden shadow-inner backdrop-blur-sm relative">
            <ControlPanel 
              :order="order" 
              :mode="sortingMode" 
              :feedback="feedback"
              :camera-img="cameraImg"
              @toggle-mode="handleModeToggle"
              @update-actual="(val) => order.actual = val"
              @dispatch="handleDispatch"
            />
          </div>

          <div class="flex flex-col gap-2 w-[24%] h-full">
            <WallGrid :wall="walls[1]" @slot-click="handleSlotClick" class="flex-1" />
            <WallGrid :wall="walls[3]" @slot-click="handleSlotClick" class="flex-1" />
          </div>
        </div>
      </main>

      <SettingsOverlay v-if="showSettings" @close="showSettings = false" />

      <!-- 开发模拟器面板 (仅用于模拟测试后端推送) -->
      <div v-if="showDev" class="absolute top-16 right-4 z-[60] bg-[#222] border border-cyan-500/50 p-4 rounded-xl shadow-2xl w-80 text-[10px] space-y-2">
        <h3 class="text-cyan-400 font-bold border-b border-white/10 pb-1 mb-2">协议模拟器 (BE to FE)</h3>
        <div class="grid grid-cols-2 gap-2">
          <button @click="simulate('INIT_CONFIG')" class="bg-gray-700 p-1 rounded">模拟初始化</button>
          <button @click="simulate('STATUS_SYNC')" class="bg-gray-700 p-1 rounded">模拟硬件断开</button>
          <button @click="simulate('SCAN_RESULT')" class="bg-cyan-900 p-1 rounded">模拟扫码成功</button>
          <button @click="simulate('SITE_UPDATE')" class="bg-orange-900 p-1 rounded">模拟料框更新</button>
          <button @click="simulate('COMMON_RESULT')" class="bg-green-900 p-1 rounded">模拟通用成功</button>
          <button @click="simulate('CAMERA_RESULT')" class="bg-purple-900 p-1 rounded">模拟相机流</button>
        </div>
        <p class="text-gray-500 italic mt-2">提示：点击上方按钮测试前端对后端的响应逻辑</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      showSettings: false,
      showDev: false,
      sortingMode: 'multi',
      feedback: { text: '系统就绪', type: 'info' },
      cameraImg: '',
      hwStatus: { 
        cameraConnected: false, 
        networkConnected: false, 
        networkMode: 'wired',
        wesConnected: true 
      },
      walls: [
        { id: 'w1', name: 'Wall01', online: true, slots: [] },
        { id: 'w2', name: 'Wall02', online: true, slots: [] },
        { id: 'w3', name: 'Wall03', online: true, slots: [] },
        { id: 'w4', name: 'Wall04', online: false, slots: [] },
      ],
      order: { orderId: '', barcode: '', name: '请扫码', required: 0, actual: 0 }
    };
  },
  
  methods: {
    // --- FE -> BE 指令 ---
    handleModeToggle(mode) {
      this.sortingMode = mode;
      callBackend('CURRENT_MODE', { currentMode: mode });
    },
    handleSlotClick(wallId, slotId) {
      callBackend('SLOT_CLICK', { wallId, slotId });
    },
    handleDispatch() {
      callBackend('ROBOT__DEPARTURE', { 
        barcode: this.order.barcode, 
        newActual: this.order.actual 
      });
    },

    // --- BE -> FE 响应处理 (协议 3.0) ---
    processBackendMessage(key, params) {
      switch (key) {
        case 'INIT_CONFIG': // 3.1
          if (params.walls) this.walls = params.walls;
          if (params.order) this.order = { ...params.order };
          break;

        case 'STATUS_SYNC': // 3.2
          this.hwStatus.cameraConnected = params.cameraConnected;
          this.hwStatus.networkConnected = params.networkConnected;
          this.hwStatus.networkMode = params.networkMode;
          // 更新墙面在线状态
          if (params.walls) {
            params.walls.forEach(pw => {
              const wall = this.walls.find(w => w.id === pw.id);
              if (wall) wall.online = pw.online;
            });
          }
          break;

        case 'SCAN_RESULT': // 3.3
          if (params.order) {
            this.order = { ...params.order };
            this.feedback = { text: '识别成功', type: 'success' };
          }
          if (params.target && params.target.slotId) {
            this.updateSlotStatus(params.target.slotId, SlotStatus.OPEN);
          }
          break;

        case 'SITE_UPDATE': // 3.4
          if (Array.isArray(params)) {
            params.forEach(update => {
              this.updateSlotByUpdate(update);
            });
          }
          break;

        case 'COMMON_RESULT': // 3.5
          this.feedback = { 
            text: params.message || '操作成功', 
            type: params.message.includes('失败') ? 'error' : 'success' 
          };
          break;

        case 'CAMERA_RESULT': // 3.6
          this.cameraImg = params.imageBase64;
          break;
      }
    },

    updateSlotByUpdate(update) {
      // 在所有墙中寻找对应的 slotId
      this.walls.forEach(wall => {
        const slot = wall.slots.find(s => s.id === update.id);
        if (slot) {
          if (update.count !== undefined) slot.count = update.count;
          if (update.status === 'CLEAR') {
            slot.status = SlotStatus.CLOSED; // 清除状态回到默认
          } else if (update.status) {
            // 这里将协议中的大写映射到前端小写枚举
            slot.status = update.status.toLowerCase();
          }
        }
      });
    },

    updateSlotStatus(slotId, status) {
      this.walls.forEach(wall => {
        const slot = wall.slots.find(s => s.id === slotId);
        if (slot) slot.status = status;
      });
    },

    // --- 模拟器逻辑 ---
    simulate(key) {
      const mockData = {
        'INIT_CONFIG': {
          walls: Array.from({ length: 4 }, (_, i) => ({
            id: `w${i+1}`, name: `Wall0${i+1}`, online: i < 3,
            slots: Array.from({ length: 20 }, (_, j) => ({
              id: `${String.fromCharCode(65+i)}${j+1}`,
              label: `${String.fromCharCode(65+i)}${j+1}`,
              count: 0, status: SlotStatus.CLOSED
            }))
          })),
          order: { orderId: 'OD-TEST-001', barcode: 'SN998877', name: '模拟物料A', required: 5, actual: 5 }
        },
        'STATUS_SYNC': { cameraConnected: true, networkConnected: false, networkMode: 'wireless', walls: [{id: 'w4', online: true}] },
        'SCAN_RESULT': { 
          order: { orderId: 'OD-SCAN-102', barcode: 'SN665544', name: '模拟扫码物料', required: 10, actual: 10 },
          target: { slotId: 'A8' }
        },
        'SITE_UPDATE': [{ id: 'A8', count: 1, status: 'IN-PROGRESS' }],
        'COMMON_RESULT': { message: '发车指令已接收' },
        'CAMERA_RESULT': { imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }
      };

      if (window.onCSharpResponse) {
        window.onCSharpResponse(key, mockData[key]);
      }
    }
  },
  
  mounted() {
    listenFromBackend(this.processBackendMessage);
    // 页面加载完成请求初始化 (协议 2.1)
    callBackend('INIT_REQUEST', {});
  }
};

export default App;
