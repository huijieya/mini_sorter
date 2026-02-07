
import { AlertCircle, Settings, Link2, Power, Terminal, Wifi, Languages } from 'lucide-vue-next';
import { translations } from '../services/i18n.js';

export default {
  name: 'Header',
  props: ['status', 'lang'],
  emits: ['open-settings', 'open-dev', 'power-off', 'change-lang'],
  components: { AlertCircle, Settings, Link2, Power, Terminal, Wifi, Languages },
  data() {
    return {
      showLangMenu: false
    };
  },
  methods: {
    t(key) {
      return translations[this.lang]?.[key] || key;
    },
    selectLang(l) {
      this.$emit('change-lang', l);
      this.showLangMenu = false;
    }
  },
  template: `
  <header class="flex justify-between items-center px-4 py-2 relative">
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold tracking-tight text-gray-100">{{ t('app_title') }}</h1>
      <button 
        @click="$emit('open-dev')"
        class="flex items-center gap-1 text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-500 hover:text-cyan-400"
      >
        <Terminal :size="10" />
        {{ t('dev_mode') }}
      </button>
    </div>
    <div class="flex items-center gap-2">
      <!-- 语言切换 -->
      <div class="relative">
        <button 
          @click="showLangMenu = !showLangMenu"
          class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors active:scale-90"
        >
          <Languages :size="16" />
        </button>
        <div v-if="showLangMenu" class="absolute top-9 right-0 bg-[#222] border border-white/10 rounded-xl shadow-2xl py-2 w-32 z-[100] animate-in slide-in-from-top-2">
          <button @click="selectLang('zh')" class="w-full px-4 py-2 text-left text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors" :class="lang === 'zh' ? 'text-cyan-400' : 'text-gray-400'">中文 (ZH)</button>
          <button @click="selectLang('en')" class="w-full px-4 py-2 text-left text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors" :class="lang === 'en' ? 'text-cyan-400' : 'text-gray-400'">English (EN)</button>
          <button @click="selectLang('ja')" class="w-full px-4 py-2 text-left text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors" :class="lang === 'ja' ? 'text-cyan-400' : 'text-gray-400'">日本語 (JA)</button>
          <button @click="selectLang('ko')" class="w-full px-4 py-2 text-left text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors" :class="lang === 'ko' ? 'text-cyan-400' : 'text-gray-400'">한국어 (KO)</button>
        </div>
      </div>

      <button 
        @click="$emit('open-settings', 'rules')"
        class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors"
      >
        <Settings :size="16" />
      </button>
      
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
    <!-- 遮罩用于关闭语言菜单 -->
    <div v-if="showLangMenu" class="fixed inset-0 z-[99]" @click="showLangMenu = false"></div>
  </header>
  `
};
