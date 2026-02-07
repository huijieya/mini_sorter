
import { AlertCircle, Settings, Link2, Power, Terminal, Wifi } from 'lucide-vue-next';

export default {
  name: 'Header',
  props: ['status'],
  emits: ['open-settings', 'open-dev', 'power-off'],
  components: { AlertCircle, Settings, Link2, Power, Terminal, Wifi },
  template: `
  <header class="flex justify-between items-center px-4 py-2">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold tracking-tight text-gray-100">FlexiNode V1.0</h1>
      <button 
        @click="$emit('open-dev')"
        class="flex items-center gap-1 text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-500 hover:text-cyan-400"
      >
        <Terminal :size="10" />
        DEV 模拟
      </button>
    </div>
    <div class="flex items-center gap-2">
      <button class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors">
        <AlertCircle :size="16" />
      </button>
      <button 
        @click="$emit('open-settings', 'rules')"
        class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors"
      >
        <Settings :size="16" />
      </button>
      
      <!-- 网络状态按钮：点击直接进入网络配置 -->
      <button 
        @click="$emit('open-settings', 'network')"
        :class="['w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center border border-white/5 transition-colors active:scale-90', status?.networkConnected ? 'text-[#64C84C]' : 'text-red-500']"
      >
        <component :is="status?.networkMode === 2 ? 'Wifi' : 'Link2'" :size="16" />
      </button>

      <button 
        @click="$emit('power-off')"
        class="w-7 h-7 bg-[#2c2c2c] hover:bg-red-900/40 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 border border-white/5 transition-all active:scale-90"
      >
        <Power :size="16" />
      </button>
    </div>
  </header>
  `
};
