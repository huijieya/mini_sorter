
export default {
  name: 'WallGrid',
  props: ['wall', 'className'],
  emits: ['slot-click'],
  methods: {
    getStatusStyle(status) {
      switch (status) {
        case 'open': return 'bg-[#64C84C] text-black border-none shadow-[0_0_6px_rgba(100,200,76,0.2)]';
        case 'in-progress': return 'bg-[#f88133] text-black border-none';
        case 'full': return 'bg-[#ffc634] text-black border-none';
        case 'finished': return 'bg-[#22D3EE] text-black border-none';
        case 'completed': return 'bg-[#22D3EE] text-black border-none'; // 兼容协议中的 COMPLETED 拼写
        default: return 'bg-[#2a2a2a] text-gray-600 border-white/5';
      }
    }
  },
  template: `
  <div v-if="wall.online" :class="['flex flex-col', className]">
    <div class="mb-0.5 px-1 flex justify-between items-baseline">
      <span class="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Wall: {{ wall.name }}</span>
      <div class="flex gap-0.5">
        <div class="w-1 h-1 rounded-full bg-green-500"></div>
        <div class="w-1 h-1 rounded-full bg-green-500 opacity-20"></div>
      </div>
    </div>
    <div class="grid grid-cols-5 grid-rows-4 gap-1 flex-1 border border-white/5 p-1 rounded-lg bg-black/20">
      <button
        v-for="slot in wall.slots"
        :key="slot.id"
        @click="$emit('slot-click', wall.id, slot.id)"
        class="w-full h-full rounded-sm border flex flex-col items-center justify-center transition-all active:scale-90 text-[7px] font-black relative overflow-hidden"
        :class="getStatusStyle(slot.status)"
      >
        <span class="absolute top-0.5 left-0.5 opacity-40 font-mono">{{ slot.label }}</span>
        <span v-if="slot.count > 0" class="text-sm font-black mt-1 leading-none">{{ slot.count }}</span>
      </button>
    </div>
  </div>
  <div v-else :class="['flex flex-col relative', className]">
    <div class="mb-0.5 px-1 opacity-20">
      <span class="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Wall: {{ wall.name }}</span>
    </div>
    <div class="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-lg bg-white/[0.02] overflow-hidden group">
      <div class="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <span class="text-[10px] font-black text-gray-800 tracking-wider">OFFLINE / DISCONNECTED</span>
      <div class="mt-1 px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
        <span class="text-[7px] text-red-500/50 uppercase">Waiting for sync...</span>
      </div>
    </div>
  </div>
  `
};
