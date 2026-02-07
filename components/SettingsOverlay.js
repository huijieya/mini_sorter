
import { ref, reactive, watch } from 'vue';
import { ChevronLeft, Globe, Wifi, WifiOff, Lock, Server, Cpu, Check, ShieldCheck, Database, XCircle, Send, Eye, EyeOff } from 'lucide-vue-next';
import { callBackend } from '../services/bridge.js';

export default {
  name: 'SettingsOverlay',
  props: ['wifiList', 'hwStatus', 'sortingRules', 'currentRule', 'initialTab'],
  emits: ['close'],
  components: { ChevronLeft, Globe, Wifi, WifiOff, Lock, Server, Cpu, Check, ShieldCheck, Database, XCircle, Send, Eye, EyeOff },
  setup(props) {
    const activeTab = ref(props.initialTab || 'rules');
    const selectedSsid = ref('');
    const wifiPassword = ref('');
    const showWifiModal = ref(false);
    const showPassword = ref(false);

    // 本地选中的规则 waveType，用于点击“应用”前预览
    const localWaveType = ref(props.currentRule?.waveType);

    // 当后端更新当前规则时，同步本地状态
    watch(() => props.currentRule?.waveType, (newVal) => {
      localWaveType.value = newVal;
    });

    // 监听 props 变化以同步 activeTab (当从外部点击不同 icon 切换进入时)
    watch(() => props.initialTab, (newVal) => {
      activeTab.value = newVal || 'rules';
    });

    const staticIpForm = reactive({
      ipAddress: '192.168.1.100',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1'
    });

    const handleSelectWifi = (ssid) => {
      selectedSsid.value = ssid;
      wifiPassword.value = '';
      showPassword.value = false;
      showWifiModal.value = true;
    };

    const connectWifi = () => {
      callBackend('CONNECT_WIFI_NETWORK', { ssid: selectedSsid.value, password: wifiPassword.value });
      showWifiModal.value = false;
    };

    const disconnectWifi = () => {
      callBackend('DISCONNECT_WIFI_NETWORK', {});
    };

    const applyStaticIp = () => {
      callBackend('SET_STATICK_IP', { ...staticIpForm });
    };

    const handleSelectRule = (waveType) => {
      localWaveType.value = waveType;
    };

    const applyRule = () => {
      callBackend('SET_CURRENT_RULE', { waveType: localWaveType.value });
    };

    return {
      activeTab,
      selectedSsid,
      wifiPassword,
      showWifiModal,
      showPassword,
      staticIpForm,
      localWaveType,
      handleSelectWifi,
      connectWifi,
      disconnectWifi,
      applyStaticIp,
      handleSelectRule,
      applyRule
    };
  },
  template: `
  <div class="absolute inset-0 z-50 bg-[#0f0f0f] flex flex-col p-8 overflow-hidden animate-in fade-in duration-300">
    <!-- 头部工具栏 (仅保留右侧状态和返回按钮) -->
    <div class="flex justify-end items-center mb-6">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-4 py-2 rounded-xl">
          <Globe :size="16" />
          <span class="text-xs font-mono font-bold">{{ hwStatus?.ipAddress || '0.0.0.0' }}</span>
        </div>
        <button 
          @click="$emit('close')"
          class="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black px-6 py-2.5 rounded-xl border border-white/5 transition-all active:scale-95"
        >
          <ChevronLeft :size="18" />
          BACK
        </button>
      </div>
    </div>

    <!-- 内容面板 -->
    <div class="bg-[#161616] rounded-[2rem] border border-white/5 flex-1 flex flex-col overflow-hidden shadow-2xl relative">
      <!-- 侧边栏/顶部选项卡 -->
      <div class="flex border-b border-white/5 bg-black/20">
        <button 
          @click="activeTab = 'rules'"
          class="px-10 py-5 font-black text-xs uppercase tracking-widest transition-all relative flex items-center gap-3"
          :class="activeTab === 'rules' ? 'text-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'"
        >
          <Database :size="16" />
          分拣规则
          <div v-if="activeTab === 'rules'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
        </button>
        <button 
          @click="activeTab = 'network'"
          class="px-10 py-5 font-black text-xs uppercase tracking-widest transition-all relative flex items-center gap-3"
          :class="activeTab === 'network' ? 'text-cyan-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'"
        >
          <Wifi :size="16" />
          网络配置
          <div v-if="activeTab === 'network'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
        </button>
      </div>

      <!-- 规则视图 -->
      <div v-if="activeTab === 'rules'" class="p-12 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
        <div class="flex items-start group">
          <span class="w-32 text-gray-600 font-black text-[10px] uppercase tracking-tighter py-3 group-hover:text-cyan-400 transition-colors">Current Active</span>
          <div class="flex flex-wrap gap-3">
            <div class="px-8 py-4 bg-[#64C84C] text-black font-black rounded-xl shadow-lg shadow-green-500/10 flex items-center gap-2">
              <Check :size="18" :stroke-width="3" />
              {{ currentRule?.label || '未设置' }}
            </div>
          </div>
        </div>

        <div class="flex items-start">
          <span class="w-32 text-gray-600 font-black text-[10px] uppercase tracking-tighter py-3">Selection</span>
          <div class="flex flex-col gap-6 flex-1">
            <div class="grid grid-cols-4 gap-3">
              <button 
                v-for="rule in sortingRules" 
                :key="rule.waveType"
                @click="handleSelectRule(rule.waveType)"
                class="px-6 py-4 rounded-xl font-bold transition-all border text-sm flex items-center justify-center text-center relative overflow-hidden group/btn"
                :class="[
                  rule.waveType === localWaveType ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#222] text-gray-400 border-white/5 hover:bg-[#2a2a2a] hover:text-white',
                  rule.waveType === currentRule?.waveType ? 'ring-1 ring-[#64C84C]/50' : ''
                ]"
              >
                {{ rule.label }}
                <!-- 已激活标识 -->
                <div v-if="rule.waveType === currentRule?.waveType" class="absolute top-0 right-0 p-1">
                   <div class="w-1.5 h-1.5 rounded-full bg-[#64C84C]"></div>
                </div>
              </button>
              <div v-if="sortingRules.length === 0" class="col-span-4 py-10 text-center text-gray-600 italic text-xs">
                正在获取规则列表...
              </div>
            </div>

            <!-- 应用按钮 -->
            <div class="flex justify-end pt-4 border-t border-white/5">
              <button 
                @click="applyRule"
                :disabled="localWaveType === currentRule?.waveType || !localWaveType"
                class="px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3"
                :class="localWaveType === currentRule?.waveType || !localWaveType 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 active:scale-95'"
              >
                <Send :size="18" />
                应用规则配置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 网络视图 -->
      <div v-if="activeTab === 'network'" class="flex-1 flex overflow-hidden">
        <div class="w-1/2 border-r border-white/5 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black flex items-center gap-3">
              <Wifi :size="20" class="text-cyan-400" />
              可用 WLAN 网络
            </h3>
            <button @click="disconnectWifi" class="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5">
              <XCircle :size="12" />
              断开连接
            </button>
          </div>
          <div v-if="wifiList.length === 0" class="flex-1 flex flex-col items-center justify-center opacity-20 gap-4">
            <WifiOff :size="48" />
            <p class="text-xs font-bold uppercase tracking-widest">正在搜索网络...</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="wifi in wifiList" :key="wifi.ssid" @click="handleSelectWifi(wifi.ssid)" class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all cursor-pointer group">
              <div class="flex items-center gap-4">
                <Wifi :size="18" class="text-gray-500 group-hover:text-cyan-400" />
                <span class="text-sm font-bold">{{ wifi.ssid }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex gap-0.5 items-end h-3">
                  <div v-for="i in 4" :key="i" class="w-1 rounded-t-full bg-current transition-all" :class="[wifi.signalStrength >= (i*25) ? 'opacity-100 text-cyan-400' : 'opacity-20 text-gray-600']" :style="{ height: (i * 25) + '%' }"></div>
                </div>
                <Lock :size="12" class="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
        <div class="w-1/2 p-10 flex flex-col gap-8 bg-black/20 overflow-y-auto custom-scrollbar">
          <h3 class="text-lg font-black flex items-center gap-3">
            <Server :size="20" class="text-cyan-400" />
            IP 设置 (IPv4)
          </h3>
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">IP 地址</label>
              <input v-model="staticIpForm.ipAddress" class="w-full bg-[#222] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-mono focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-gray-700" placeholder="0.0.0.0" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">子网掩码</label>
              <input v-model="staticIpForm.subnetMask" class="w-full bg-[#222] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-mono focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-gray-700" placeholder="255.255.255.0" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">默认网关</label>
              <input v-model="staticIpForm.gateway" class="w-full bg-[#222] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-mono focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-gray-700" placeholder="0.0.0.0" />
            </div>
            <button @click="applyStaticIp" class="w-full mt-4 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl shadow-lg shadow-cyan-500/10 transition-all active:scale-95 flex items-center justify-center gap-2">
              <ShieldCheck :size="18" />
              保存并应用设置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接对话框 -->
    <div v-if="showWifiModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="showWifiModal = false"></div>
      <div class="relative bg-[#222] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col gap-6 animate-pop">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Wifi :size="24" />
          </div>
          <div>
            <h4 class="font-black text-lg text-white">连接到 WiFi</h4>
            <p class="text-gray-500 text-xs font-mono">{{ selectedSsid }}</p>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">安全密钥</label>
          <div class="relative flex items-center">
            <input 
              v-model="wifiPassword" 
              :type="showPassword ? 'text' : 'password'" 
              class="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 pr-12 text-sm focus:border-cyan-500/50 focus:outline-none transition-all" 
              placeholder="输入密码" 
              autofocus 
              @keyup.enter="connectWifi" 
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 text-gray-500 hover:text-cyan-400 transition-colors p-1"
            >
              <component :is="showPassword ? 'EyeOff' : 'Eye'" :size="18" />
            </button>
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="showWifiModal = false" class="flex-1 py-3.5 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-all">取消</button>
          <button @click="connectWifi" class="flex-1 py-3.5 rounded-xl bg-cyan-500 text-black font-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all">连接</button>
        </div>
      </div>
    </div>
  </div>
  `
};
