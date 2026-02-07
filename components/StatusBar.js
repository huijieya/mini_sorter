
import { User, Video, LayoutGrid, Monitor } from 'lucide-vue-next';
import { translations } from '../services/i18n.js';

export default {
  name: 'StatusBar',
  props: ['status', 'lang'],
  components: { User, Video, LayoutGrid, Monitor },
  methods: {
    t(key) {
      return translations[this.lang]?.[key] || key;
    }
  },
  template: `
  <div class="flex items-center justify-between px-2 py-1">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black">
        <User :size="14" fill="currentColor" />
      </div>
      <span class="text-xs font-bold text-gray-300">Hyper001</span>
    </div>
    <div class="flex items-center gap-5">
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] uppercase font-bold text-gray-500">{{ t('camera') }}</span>
        <Video :class="status.cameraConnected ? 'text-[#64C84C]' : 'text-red-500'" :size="16" fill="currentColor" />
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] uppercase font-bold text-gray-500">{{ t('device') }}</span>
        <LayoutGrid :class="status.deviceConnected ? 'text-[#64C84C]' : 'text-red-500'" :size="16" fill="currentColor" />
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] uppercase font-bold text-gray-500">{{ t('wes') }}</span>
        <Monitor :class="status.wesConnected ? 'text-[#64C84C]' : 'text-red-500'" :size="16" fill="currentColor" />
      </div>
    </div>
  </div>
  `
};
