import { ref } from 'vue';
import { ChevronLeft, Globe } from 'lucide-vue-next';

export default {
  name: 'SettingsOverlay',
  emits: ['close'],
  components: { ChevronLeft, Globe },
  setup() {
    const activeTab = ref('rules');
    const ruleOptions = {
      standard: ['波次订单'],
      builtIn: ['波次订单', '编码分拣', '随机分拣', '编码范围', '起止符'],
      custom: ['顺丰', '中通', '京东']
    };

    return {
      activeTab,
      ruleOptions
    };
  },
  template: `
  <div class="absolute inset-0 z-50 bg-[#0f0f0f] flex flex-col p-8 overflow-hidden">
    <div class="flex justify-between items-center mb-12">
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold">FlexiNode V1.0</h2>
        <p class="text-gray-500 text-sm font-bold uppercase tracking-widest">单机规则配置</p>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
          <Globe :size="16" />
          <span class="text-sm font-mono">192.168.0.1</span>
        </div>
        <button 
          @click="$emit('close')"
          class="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-5 py-2 rounded-lg transition-colors"
        >
          返回
          <ChevronLeft :size="18" />
        </button>
      </div>
    </div>

    <div class="bg-[#1a1a1a] rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden">
      <div class="flex border-b border-white/5">
        <button 
          @click="activeTab = 'rules'"
          class="px-12 py-5 font-bold transition-all relative"
          :class="activeTab === 'rules' ? 'text-white' : 'text-gray-500 hover:text-gray-300'"
        >
          单机规则
          <div v-if="activeTab === 'rules'" class="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </button>
        <button 
          @click="activeTab = 'network'"
          class="px-12 py-5 font-bold transition-all relative"
          :class="activeTab === 'network' ? 'text-white' : 'text-gray-500 hover:text-gray-300'"
        >
          网络设置
          <div v-if="activeTab === 'network'" class="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </button>
      </div>

      <div class="p-12 space-y-12 flex-1 overflow-y-auto">
        <div class="flex items-start">
          <span class="w-32 text-gray-500 font-bold py-3">当前规则</span>
          <div class="flex flex-wrap gap-4">
            <button class="px-8 py-4 bg-[#64C84C] text-black font-bold rounded-xl shadow-lg shadow-green-500/20">
              波次订单
            </button>
          </div>
        </div>

        <div class="flex items-start">
          <span class="w-32 text-gray-500 font-bold py-3">内设</span>
          <div class="flex flex-wrap gap-4">
            <button 
              v-for="rule in ruleOptions.builtIn" 
              :key="rule"
              class="px-8 py-4 rounded-xl font-bold transition-all"
              :class="rule === '波次订单' ? 'bg-[#64C84C] text-black shadow-lg shadow-green-500/20' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'"
            >
              {{ rule }}
            </button>
          </div>
        </div>

        <div class="flex items-start">
          <span class="w-32 text-gray-500 font-bold py-3">自定义</span>
          <div class="flex flex-wrap gap-4">
            <button 
              v-for="rule in ruleOptions.custom" 
              :key="rule"
              class="px-8 py-4 bg-[#2a2a2a] text-gray-400 font-bold rounded-xl hover:bg-[#333] transition-all"
            >
              {{ rule }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
};