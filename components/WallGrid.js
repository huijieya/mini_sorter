
export default {
  name: 'WallGrid',
  props: ['wall', 'className'],
  emits: ['slot-click'],
  methods: {
    getStatusStyle(status) {
      // 适配后端大写状态字符串
      const s = String(status).toUpperCase();
      switch (s) {
        case 'OPEN': 
          return 'bg-[#64C84C] text-black border-none shadow-[0_0_8px_rgba(100,200,76,0.3)]';
        case 'IN-PROGRESS': 
          return 'bg-[#f88133] text-black border-none';
        case 'FULL': 
          return 'bg-[#ffc634] text-black border-none';
        case 'FINISHED': 
        case 'COMPLETED':
          return 'bg-[#22D3EE] text-black border-none';
        case 'CLEAR':
        case 'CLOSE':
        default: 
          return 'bg-[#2a2a2a] text-gray-600 border-white/5';
      }
    }
  },
  template: `
  <div v-if="wall.online" :class="['flex flex-col', className]">
    <div class="mb-1 px-1 flex justify-between items-center">
      <span class="text-[9px] font-black text-cyan-500/80 uppercase tracking-widest">{{ wall.name }}</span>
      <div class="flex gap-1">
        <div class="w-1.5 h-1.5 rounded-full bg-[#64C84C] shadow-[0_0_4px_#64C84C]"></div>
      </div>
    </div>
    <!-- 针对 12 个料框（如 3x4 或 4x3）优化的网格布局 -->
    <div class="grid grid-cols-3 gap-1 flex-1 border border-white/5 p-1 rounded-lg bg-black/40 backdrop-blur-md shadow-inner overflow-hidden">
      <button
        v-for="slot in wall.slots"
        :key="slot.id"
        @click="$emit('slot-click', wall.id, slot.id)"
        class="w-full h-full rounded-md border flex flex-col items-center justify-center transition-all active:scale-95 text-[7px] font-black relative group overflow-hidden"
        :class="getStatusStyle(slot.status)"
      >
        <span class="absolute top-1 left-1 opacity-30 font-mono scale-90">{{ slot.label }}</span>
        <span v-if="slot.count > 0" class="text-lg font-black mt-1.5 leading-none drop-shadow-sm">{{ slot.count }}</span>
        
        <!-- 扫码选中时的动态光晕效果 -->
        <div v-if="String(slot.status).toUpperCase() === 'OPEN'" class="absolute inset-0 bg-white/10 animate-pulse"></div>
      </button>
    </div>
  </div>
  <div v-else :class="['flex flex-col relative', className]">
    <div class="mb-1 px-1 opacity-20">
      <span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{{ wall.name || 'Offline' }}</span>
    </div>
    <div class="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg bg-white/[0.01] overflow-hidden grayscale">
      <div class="text-[10px] font-black text-gray-800 tracking-tighter uppercase mb-1">Station Offline</div>
      <div class="px-2 py-0.5 bg-red-500/5 rounded border border-red-500/10">
        <span class="text-[7px] text-red-500/40 font-bold">WAITING FOR HANDSHAKE</span>
      </div>
    </div>
  </div>
  `
};
