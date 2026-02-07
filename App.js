
import Header from './components/Header.js';
import StatusBar from './components/StatusBar.js';
import WallGrid from './components/WallGrid.js';
import ControlPanel from './components/ControlPanel.js';
import SettingsOverlay from './components/SettingsOverlay.js';
import ConfirmModal from './components/ConfirmModal.js';
import { callBackend, listenFromBackend } from './services/bridge.js';

const App = {
  name: 'App',
  components: { Header, StatusBar, WallGrid, ControlPanel, SettingsOverlay, ConfirmModal },
  template: `
    <div class="h-screen w-screen flex flex-col bg-[#0c0c0c] text-gray-200 overflow-hidden select-none font-sans relative">
      <Header 
        :status="hwStatus"
        @open-settings="handleOpenSettings" 
        @open-dev="showDev = !showDev" 
        @power-off="triggerPowerOff" 
      />

      <main class="flex-1 m-2 mt-0 p-2 bg-[#161616] rounded-xl flex flex-col gap-1.5 overflow-hidden border border-white/5 shadow-2xl">
        <StatusBar :status="hwStatus" />

        <div class="flex-1 flex gap-2 min-h-0 overflow-hidden">
          <div class="flex flex-col gap-2 w-[24%] h-full">
            <template v-for="wall in leftWalls" :key="wall.id">
              <WallGrid :wall="wall" @slot-click="handleSlotClick" class="flex-1" />
            </template>
          </div>

          <div class="flex-1 min-w-[320px] bg-black/30 border border-white/5 rounded-xl overflow-hidden shadow-inner backdrop-blur-sm relative">
            <ControlPanel 
              :order="order" 
              :mode="sortingMode" 
              :feedback="feedback"
              :camera-img="cameraImg"
              @request-mode-toggle="requestModeToggle"
              @update-actual="(val) => order.actual = val"
              @dispatch="handleDispatch"
            />
          </div>

          <div class="flex flex-col gap-2 w-[24%] h-full">
            <template v-for="wall in rightWalls" :key="wall.id">
              <WallGrid :wall="wall" @slot-click="handleSlotClick" class="flex-1" />
            </template>
          </div>
        </div>
      </main>

      <!-- 各种覆盖层 -->
      <SettingsOverlay 
        v-if="showSettings" 
        :wifi-list="wifiList"
        :hw-status="hwStatus"
        :sorting-rules="sortingRules"
        :current-rule="currentRule"
        @close="showSettings = false" 
      />
      
      <ConfirmModal 
        :show="confirmModal.show"
        :title="confirmModal.title"
        :content="confirmModal.content"
        :confirm-color="confirmModal.color"
        @confirm="handleConfirmAction"
        @cancel="confirmModal.show = false"
      />

      <!-- 开发模拟器 -->
      <div v-if="showDev" class="absolute bottom-16 right-4 z-[60] bg-[#222] border border-cyan-500/50 p-4 rounded-xl shadow-2xl w-80 text-[10px] space-y-2">
        <h3 class="text-cyan-400 font-bold border-b border-white/10 pb-1 mb-2">协议模拟器 (BE to FE)</h3>
        <div class="grid grid-cols-2 gap-2">
          <button @click="simulate('INIT_CONFIG_2')" class="bg-blue-900 p-1 rounded">模拟2面墙初始化</button>
          <button @click="simulate('INIT_CONFIG_4')" class="bg-indigo-900 p-1 rounded">模拟4面墙初始化</button>
          <button @click="simulate('SCAN_RESULT')" class="bg-cyan-900 p-1 rounded">模拟扫码成功</button>
          <button @click="simulate('SITE_UPDATE')" class="bg-orange-900 p-1 rounded">模拟料框更新</button>
          <button @click="simulate('CAMERA_RESULT')" class="bg-pink-900 p-1 rounded">模拟相机画面</button>
          <button @click="simulate('WIFI_NETWORK')" class="bg-amber-900 p-1 rounded">模拟WIFI列表</button>
          <button @click="simulate('SORTING_MODE')" class="bg-emerald-900 p-1 rounded">模拟分拣规则列表</button>
          <button @click="simulate('NET_TOGGLE')" class="bg-purple-900 p-1 rounded">模拟网络切换</button>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      showSettings: false,
      showDev: false,
      sortingMode: 'single',
      feedback: { text: '系统就绪', type: 'info' },
      cameraImg: '',
      hwStatus: { 
        cameraConnected: true, 
        networkConnected: true, 
        networkMode: 1, 
        wesConnected: true,
        ipAddress: '0.0.0.0' 
      },
      walls: [],
      wifiList: [],
      sortingRules: [],
      currentRule: { waveType: 1, label: '订单分拣' },
      order: { orderId: '', barcode: '', name: '请扫码', required: 0, actual: 0 },
      
      confirmModal: {
        show: false,
        type: '', 
        title: '',
        content: '',
        color: 'bg-cyan-500',
        pendingMode: ''
      }
    };
  },

  computed: {
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
    handleOpenSettings() {
      this.showSettings = true;
      callBackend('GET_CURRENT_RULE', {});
    },
    requestModeToggle(newMode) {
      if (this.sortingMode === newMode) return;
      this.confirmModal.type = 'mode';
      this.confirmModal.pendingMode = newMode;
      if (newMode === 'multi') {
        this.confirmModal.title = '切换至<span class="text-cyan-400">多件模式</span>需要手动发车';
        this.confirmModal.content = '请确认';
      } else {
        this.confirmModal.title = '切换至<span class="text-cyan-400">单件模式</span>将触发自动发车';
        this.confirmModal.content = '请确认商品已准备就位';
      }
      this.confirmModal.color = 'bg-cyan-500';
      this.confirmModal.show = true;
    },

    triggerPowerOff() {
      this.confirmModal.type = 'power';
      this.confirmModal.title = '确认要<span class="text-red-500">关机</span>吗？';
      this.confirmModal.content = '这将控制全部设备物理关机并退出系统。';
      this.confirmModal.color = 'bg-red-500';
      this.confirmModal.show = true;
    },

    handleConfirmAction() {
      if (this.confirmModal.type === 'mode') {
        this.sortingMode = this.confirmModal.pendingMode;
        callBackend('CURRENT_MODE', { currentMode: this.sortingMode === 'single' ? 1 : 2 });
      } else if (this.confirmModal.type === 'power') {
        callBackend('SYSTEM_POWER_OFF', { immediate: true });
      }
      this.confirmModal.show = false;
    },

    handleSlotClick(wallId, slotId) { callBackend('SLOT_CLICK', { wallId, slotId }); },
    handleDispatch() { 
      callBackend('ROBOT_DEPARTURE', { barcode: this.order.barcode, newActual: this.order.actual }); 
    },
    processBackendMessage(key, params) {
      switch (key) {
        case 'INIT_CONFIG':
          if (params.walls) this.walls = params.walls;
          if (params.order) this.order = { ...params.order };
          break;
        case 'STATUS_SYNC':
          if (params.cameraConnected !== undefined) this.hwStatus.cameraConnected = params.cameraConnected;
          if (params.networkConnected !== undefined) this.hwStatus.networkConnected = params.networkConnected;
          if (params.networkMode !== undefined) this.hwStatus.networkMode = params.networkMode;
          if (params.wesConnected !== undefined) this.hwStatus.wesConnected = params.wesConnected;
          if (params.ipAddress !== undefined) this.hwStatus.ipAddress = params.ipAddress;
          if (params.walls) {
            params.walls.forEach(pw => {
              const wall = this.walls.find(w => w.id === pw.id);
              if (wall) wall.online = pw.online;
            });
          }
          break;
        case 'SCAN_RESULT':
          if (params.order) this.order = { ...params.order };
          if (params.target && params.target.slotId) this.updateSlotStatus(params.target.slotId, 'OPEN');
          break;
        case 'SITE_UPDATE':
          if (Array.isArray(params)) params.forEach(update => this.updateSlotByUpdate(update));
          break;
        case 'CAMERA_RESULT':
          if (params) {
            const base64 = typeof params === 'string' ? params : params.imageBase64;
            if (base64) this.cameraImg = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
          }
          break;
        case 'WIFI_NETWORK':
          if (Array.isArray(params)) this.wifiList = params;
          break;
        case 'SORTING_MODE':
          if (params.waveTypes) this.sortingRules = params.waveTypes;
          if (params.waveType !== undefined) {
             this.currentRule = { waveType: params.waveType, label: params.label };
          }
          break;
        case 'COMMON_RESULT':
          this.feedback = { text: params.message || '操作成功', type: params.message?.includes('失败') ? 'error' : 'success' };
          break;
        case 'DEPARTURE_SUCCESS':
          this.feedback = { text: '下发成功', type: 'success' };
          setTimeout(() => {
            this.order = { orderId: '', barcode: '', name: '请扫码', required: 0, actual: 0 };
            this.feedback = { text: '请扫码', type: 'info' };
          }, 2000);
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
      const generateSlots = (p) => Array.from({length:12}, (_,i)=>({id:`${p}_${Math.floor(i/3)+1}_${i%3+1}`,label:`${p}_${Math.floor(i/3)+1}_${i%3+1}`,count:0,status:"CLOSE"}));
      if (key === 'NET_TOGGLE') {
        this.processBackendMessage('STATUS_SYNC', { networkConnected: !this.hwStatus.networkConnected, networkMode: this.hwStatus.networkMode === 1 ? 2 : 1, ipAddress: !this.hwStatus.networkConnected ? '192.168.1.55' : '0.0.0.0' });
        return;
      }
      const mockData = {
        'INIT_CONFIG_2': { key: 'INIT_CONFIG', params: { walls: [{ id: "0", name: "Wall_Left", online: true, slots: generateSlots('wall1') }, { id: "1", name: "Wall_Right", online: true, slots: generateSlots('wall2') }], order: { orderId: 'MOCK-001', barcode: 'SN123', name: '待分拣物料', required: 2, actual: 0 } } },
        'INIT_CONFIG_4': { key: 'INIT_CONFIG', params: { walls: [{ id: "0", name: "Wall1", online: true, slots: generateSlots('wall1') }, { id: "1", name: "Wall2", online: true, slots: generateSlots('wall2') }, { id: "2", name: "Wall3", online: true, slots: generateSlots('wall3') }, { id: "3", name: "Wall4", online: true, slots: generateSlots('wall4') }], order: { orderId: 'MOCK-004', barcode: 'SN444', name: '四墙测试', required: 10, actual: 0 } } },
        'SCAN_RESULT': { key: 'SCAN_RESULT', params: { order: { orderId: 'MOCK-SCAN', barcode: 'SCAN123456', name: '模拟扫码物料', required: 5, actual: 1 }, target: { slotId: 'wall1_1_1' } } },
        'SITE_UPDATE': { key: 'SITE_UPDATE', params: [{ id: 'wall1_1_1', count: 2, status: 'IN-PROGRESS' }] },
        'CAMERA_RESULT': { key: 'CAMERA_RESULT', params: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
        'WIFI_NETWORK': { key: 'WIFI_NETWORK', params: [{ ssid: "HYPERLEAP-5G", signalStrength: 90 }, { ssid: "Office-Guest", signalStrength: 65 }, { ssid: "StarLink", signalStrength: 40 }] },
        'SORTING_MODE': { key: 'SORTING_MODE', params: { waveTypes: [{ waveType: 1, label: "订单分拣" }, { waveType: 2, label: "包裹分拣" }, { waveType: 3, label: "条码分拣" }, { waveType: 4, label: "编码范围分拣" }, { waveType: 5, label: "起止符分拣" }], waveType: 1, label: "订单分拣" } }
      };
      if (mockData[key]) this.processBackendMessage(mockData[key].key, mockData[key].params);
    }
  },
  mounted() {
    listenFromBackend(this.processBackendMessage);
    callBackend('INIT_REQUEST', {});
    callBackend('GET_CURRENT_RULE', {});
  }
};

export default App;
