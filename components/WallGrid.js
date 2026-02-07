
import { translations } from '../services/i18n.js';

export default {
  name: 'WallGrid',
  props: ['wall', 'className', 'lang'],
  emits: ['slot-click'],
  methods: {
    t(key) {
      return translations[this.lang]?.[key] || key;
    },
    getStatusStyle(status) {
      const s = String(status).toUpperCase();
      switch (s) {
        case 'OPEN': 
          return 'bg-[#64C84C] text-black border-none shadow-[0_0_12px_rgba(100,200,76,0.4)]';
        case 'IN-PROGRESS': 
          return 'bg-[#f88133] text-black border-none';
        case 'FULL': 
          return 'bg-[#ffc634] text-black border-none';
        case 'FINISHED': 
        case 'COMPLETED':
          return 'bg-[#22D3EE] text-black border-none';
        default: 
          return 'bg-[#242424] text-gray-400 border-white/10 hover:border-cyan-500/30';
      }
    }
  },
  template: `
  <div v-if="wall.online" :class="['flex flex-col', className]">
    <div class="mb-1.5 px-1 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{{ wall.name }}</span>
        <div class="w-1.5 h-1.5 rounded-full bg-[#64C84C] shadow-[0_0_6px_#64C84C] animate-pulse"></div>
      </div>
      <span class="text-[8px] text-gray-500 font-mono">{{ t('online').toUpperCase() }}</span>
    </div>
    <div class="grid grid-cols-3 gap-1.5 flex-1 border border-white/5 p-1.5 rounded-xl bg-black/40 backdrop-blur-md shadow-inner overflow-hidden">
      <button
        v-for="slot in wall.slots"
        :key="slot.id"
        @click="$emit('slot-click', wall.id, slot.id)"
        class="w-full h-full rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 text-[7px] font-black relative group overflow-hidden"
        :class="getStatusStyle(slot.status)"
      >
        <span 
          class="absolute top-1 left-1 font-mono scale-90 tracking-tighter"
          :class="['OPEN', 'IN-PROGRESS', 'FULL', 'FINISHED', 'COMPLETED'].includes(String(slot.status).toUpperCase()) ? 'text-black/60' : 'text-gray-400'"
        >
          {{ slot.label }}
        </span>
        <span v-if="slot.count > 0" class="text-xl font-black mt-2 leading-none drop-shadow-md">{{ slot.count }}</span>
        <div v-if="String(slot.status).toUpperCase() === 'OPEN'" class="absolute inset-0 bg-white/20 animate-pulse"></div>
      </button>
    </div>
  </div>
  
  <div v-else :class="['flex flex-col relative', className]">
    <div class="mb-1.5 px-1 flex justify-between items-center opacity-40">
      <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{{ wall.name || 'Station' }}</span>
      <div class="w-1.5 h-1.5 rounded-full bg-red-600"></div>
    </div>
    <div class="flex-1 flex flex-col items-center justify-center border border-dashed border-red-500/20 rounded-xl bg-[#1a1a1a] overflow-hidden">
      <div class="flex flex-col items-center gap-2">
        <div class="p-3 bg-red-500/5 rounded-full border border-red-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500/40"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="text-center">
          <div class="text-[11px] font-black text-gray-300 tracking-wider uppercase">{{ t('offline') }}</div>
          <div class="mt-1 px-2 py-0.5 bg-red-900/20 rounded border border-red-500/20">
            <span class="text-[8px] text-red-400 font-bold uppercase tracking-tight">{{ t('station_offline') }}</span>
          </div>
        </div>
      </div>
      <div class="absolute bottom-4 text-[40px] font-black text-white/[0.02] pointer-events-none select-none italic">
        OFFLINE
      </div>
    </div>
  </div>
  `
};
