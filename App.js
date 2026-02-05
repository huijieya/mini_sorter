
import Header from './components/Header.js';
import StatusBar from './components/StatusBar.js';
import WallGrid from './components/WallGrid.js';
import ControlPanel from './components/ControlPanel.js';
import SettingsOverlay from './components/SettingsOverlay.js';
import { callBackend, listenFromBackend } from './services/bridge.js';

const App = {
  name: 'App',
  components: { Header, StatusBar, WallGrid, ControlPanel, SettingsOverlay },
  template: `
    <div class="h-screen w-screen flex flex-col bg-[#0c0c0c] text-gray-200 overflow-hidden select-none font-sans relative">
      <Header @open-settings="showSettings = true" @open-dev="showDev = !showDev" />

      <main class="flex-1 m-2 mt-0 p-2 bg-[#161616] rounded-xl flex flex-col gap-1.5 overflow-hidden border border-white/5 shadow-2xl">
        <StatusBar :status="hwStatus" />

        <div class="flex-1 flex gap-2 min-h-0 overflow-hidden">
          <!-- 左侧墙面区域 -->
          <div class="flex flex-col gap-2 w-[24%] h-full">
            <template v-for="wall in leftWalls" :key="wall.id">
              <WallGrid :wall="wall" @slot-click="handleSlotClick" class="flex-1" />
            </template>
          </div>

          <!-- 中央控制区域 -->
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

          <!-- 右侧墙面区域 -->
          <div class="flex flex-col gap-2 w-[24%] h-full">
            <template v-for="wall in rightWalls" :key="wall.id">
              <WallGrid :wall="wall" @slot-click="handleSlotClick" class="flex-1" />
            </template>
          </div>
        </div>
      </main>

      <SettingsOverlay v-if="showSettings" @close="showSettings = false" />

      <!-- 开发模拟器面板 -->
      <div v-if="showDev" class="absolute top-16 right-4 z-[60] bg-[#222] border border-cyan-500/50 p-4 rounded-xl shadow-2xl w-80 text-[10px] space-y-2">
        <h3 class="text-cyan-400 font-bold border-b border-white/10 pb-1 mb-2">协议模拟器 (BE to FE)</h3>
        <div class="grid grid-cols-2 gap-2">
          <button @click="simulate('INIT_CONFIG_2')" class="bg-blue-900 p-1 rounded">模拟2面墙初始化</button>
          <button @click="simulate('INIT_CONFIG_4')" class="bg-indigo-900 p-1 rounded">模拟4面墙初始化</button>
          <button @click="simulate('SCAN_RESULT')" class="bg-cyan-900 p-1 rounded">模拟扫码成功</button>
          <button @click="simulate('SITE_UPDATE')" class="bg-orange-900 p-1 rounded">模拟料框更新</button>
          <button @click="simulate('COMMON_RESULT')" class="bg-green-900 p-1 rounded">模拟通用成功</button>
        </div>
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
        cameraConnected: true, 
        networkConnected: true, 
        networkMode: 'wired',
        wesConnected: true 
      },
      walls: [], // 由 INIT_CONFIG 填充
      order: { orderId: '', barcode: '', name: '请扫码', required: 0, actual: 0 }
    };
  },

  computed: {
    // 根据墙面总数动态分配左右布局
    leftWalls() {
      if (this.walls.length === 0) return [];
      if (this.walls.length <= 2) return [this.walls[0]];
      return [this.walls[0], this.walls[2]];
    },
    rightWalls() {
      if (this.walls.length <= 1) return [];
      if (this.walls.length === 2) return [this.walls[1]];
      return [this.walls[1], this.walls[3]];
    }
  },
  
  methods: {
    handleModeToggle(mode) {
      this.sortingMode = mode;
      const modeValue = mode === 'single' ? 1 : 2;
      callBackend('CURRENT_MODE', { currentMode: modeValue });
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

    processBackendMessage(key, params) {
      switch (key) {
        case 'INIT_CONFIG':
          if (params.walls) this.walls = params.walls;
          if (params.order) this.order = { ...params.order };
          break;

        case 'STATUS_SYNC':
          this.hwStatus.cameraConnected = params.cameraConnected;
          this.hwStatus.networkConnected = params.networkConnected;
          if (params.walls) {
            params.walls.forEach(pw => {
              const wall = this.walls.find(w => w.id === pw.id);
              if (wall) wall.online = pw.online;
            });
          }
          break;

        case 'SCAN_RESULT':
          if (params.order) this.order = { ...params.order };
          if (params.target && params.target.slotId) {
            this.updateSlotStatus(params.target.slotId, 'OPEN');
          }
          break;

        case 'SITE_UPDATE':
          if (Array.isArray(params)) {
            params.forEach(update => {
              this.updateSlotByUpdate(update);
            });
          }
          break;

        case 'COMMON_RESULT':
          this.feedback = { 
            text: params.message || '操作成功', 
            type: params.message.includes('失败') ? 'error' : 'success' 
          };
          break;
      }
    },

    updateSlotByUpdate(update) {
      this.walls.forEach(wall => {
        const slot = wall.slots.find(s => s.id === update.id);
        if (slot) {
          if (update.count !== undefined) slot.count = update.count;
          if (update.status) slot.status = update.status;
        }
      });
    },

    updateSlotStatus(slotId, status) {
      this.walls.forEach(wall => {
        const slot = wall.slots.find(s => s.id === slotId);
        if (slot) slot.status = status;
      });
    },

    simulate(key) {
      const generateSlots = (prefix) => {
        return [
          { id: `${prefix}_1_1`, label: `${prefix}_1_1`, count: 0, status: "CLOSE" },
          { id: `${prefix}_1_2`, label: `${prefix}_1_2`, count: 0, status: "CLOSE" },
          { id: `${prefix}_1_3`, label: `${prefix}_1_3`, count: 0, status: "CLOSE" },
          { id: `${prefix}_2_1`, label: `${prefix}_2_1`, count: 0, status: "CLOSE" },
          { id: `${prefix}_2_2`, label: `${prefix}_2_2`, count: 0, status: "CLOSE" },
          { id: `${prefix}_2_3`, label: `${prefix}_2_3`, count: 0, status: "CLOSE" },
          { id: `${prefix}_3_1`, label: `${prefix}_3_1`, count: 0, status: "CLOSE" },
          { id: `${prefix}_3_2`, label: `${prefix}_3_2`, count: 0, status: "CLOSE" },
          { id: `${prefix}_3_3`, label: `${prefix}_3_3`, count: 0, status: "CLOSE" },
          { id: `${prefix}_4_1`, label: `${prefix}_4_1`, count: 0, status: "CLOSE" },
          { id: `${prefix}_4_2`, label: `${prefix}_4_2`, count: 0, status: "CLOSE" },
          { id: `${prefix}_4_3`, label: `${prefix}_4_3`, count: 0, status: "CLOSE" }
        ];
      };

      const mockData = {
        'INIT_CONFIG_2': {
          key: 'INIT_CONFIG',
          params: {
            walls: [
              { id: "0", name: "Wall_Left", online: true, slots: generateSlots('wall1') },
              { id: "1", name: "Wall_Right", online: true, slots: generateSlots('wall2') }
            ],
            order: { orderId: 'MOCK-001', barcode: 'SN123', name: '待分拣物料', required: 2, actual: 0 }
          }
        },
        'INIT_CONFIG_4': {
          key: 'INIT_CONFIG',
          params: {
            walls: [
              { id: "0", name: "Wall1", online: true, slots: generateSlots('wall1') },
              { id: "1", name: "Wall2", online: true, slots: generateSlots('wall2') },
              { id: "2", name: "Wall3", online: true, slots: generateSlots('wall3') },
              { id: "3", name: "Wall4", online: true, slots: generateSlots('wall4') }
            ],
            order: { orderId: 'MOCK-004', barcode: 'SN444', name: '四墙测试', required: 10, actual: 0 }
          }
        }
      };

      if (key.startsWith('INIT_CONFIG')) {
        const data = mockData[key];
        window.onCSharpResponse(data.key, data.params);
      } else {
        // 其他简单模拟
        const simpleMocks = {
          'SCAN_RESULT': ['SCAN_RESULT', { order: { barcode: 'SN-SCAN', name: '扫码物料', required: 5, actual: 0 }, target: { slotId: 'wall1_1_2' } }],
          'SITE_UPDATE': ['SITE_UPDATE', [{ id: 'wall1_1_2', count: 1, status: 'IN-PROGRESS' }]],
          'COMMON_RESULT': ['COMMON_RESULT', { message: '发车完成' }]
        };
        const [k, p] = simpleMocks[key];
        window.onCSharpResponse(k, p);
      }
    }
  },
  
  mounted() {
    listenFromBackend(this.processBackendMessage);
    callBackend('INIT_REQUEST', {});
  }
};

export default App;
