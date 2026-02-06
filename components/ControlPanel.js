
import { computed } from 'vue';
import { Minus, Plus, Check, Image as ImageIcon, Scan, AlertCircle } from 'lucide-vue-next';

export default {
  name: 'ControlPanel',
  props: ['order', 'mode', 'feedback', 'cameraImg'],
  emits: ['request-mode-toggle', 'update-actual', 'dispatch'],
  components: { Minus, Plus, Check, ImageIcon, Scan, AlertCircle },
  setup(props) {
    const fbStyle = computed(() => {
      switch (props.feedback.type) {
        case 'success': return { color: 'text-[#64C84C]', icon: Check, filled: false };
        case 'error': return { color: 'text-red-500', icon: AlertCircle, filled: false };
        default: return { color: 'text-cyan-400', icon: Scan, filled: false };
      }
    });

    return { fbStyle };
  },
  template: `
  <div class="h-full flex flex-col p-2.5 gap-2 overflow-hidden font-sans">
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-bold text-gray-400 uppercase tracking-tighter">投递模式</span>
      <div class="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
        <button 
          @click="$emit('request-mode-toggle', 'single')"
          class="px-3 py-1 rounded text-[10px] font-bold transition-all"
          :class="mode === 'single' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-gray-300'"
        >
          单件
        </button>
        <button 
          @click="$emit('request-mode-toggle', 'multi')"
          class="px-3 py-1 rounded text-[10px] font-bold transition-all"
          :class="mode === 'multi' ? 'bg-[#64C84C] text-black shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-300'"
        >
          多件
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-x-2 gap-y-1 p-2 bg-white/5 rounded-lg border border-white/5 text-[10px]">
      <div class="flex gap-1 overflow-hidden"><span class="text-gray-500 shrink-0">单号:</span><span class="text-gray-200 font-mono truncate leading-tight">{{ order.orderId || '-' }}</span></div>
      <div class="flex gap-1 overflow-hidden"><span class="text-gray-500 shrink-0">条码:</span><span class="text-cyan-400 font-mono truncate font-bold leading-tight">{{ order.barcode || '-' }}</span></div>
      <div class="flex gap-1 col-span-2 border-t border-white/5 pt-1 mt-0.5"><span class="text-gray-500 shrink-0">品名:</span><span class="text-gray-100 font-bold truncate leading-tight">{{ order.name || '-' }}</span></div>
      <div class="flex gap-1"><span class="text-gray-500 shrink-0">应发:</span><span class="text-cyan-400 font-black leading-tight">{{ order.required || 0 }}</span></div>
    </div>

    <div class="flex items-center justify-between px-1 py-1 border-y border-white/5">
      <span class="text-[11px] font-black text-gray-100 uppercase tracking-tighter">实发数量</span>
      <div class="flex items-center gap-1.5">
        <button 
          :disabled="mode === 'single'"
          @click="$emit('update-actual', Math.max(0, order.actual - 1))"
          class="w-7 h-7 bg-gray-700 hover:bg-gray-600 disabled:opacity-20 flex items-center justify-center rounded text-white active:scale-90 transition-all border border-white/5"
        >
          <Minus :size="14" :stroke-width="3" />
        </button>
        <div class="w-12 h-7 bg-black/40 border border-cyan-500/30 rounded flex items-center justify-center text-base font-black text-cyan-400">
          {{ mode === 'single' ? '-' : order.actual }}
        </div>
        <button 
          :disabled="mode === 'single'"
          @click="$emit('update-actual', order.actual + 1)"
          class="w-7 h-7 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-20 flex items-center justify-center rounded text-black active:scale-90 transition-all shadow-lg shadow-cyan-500/10"
        >
          <Plus :size="14" :stroke-width="3" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 relative border border-white/5 rounded-xl bg-black/50 flex items-center justify-center overflow-hidden group shadow-inner">
      <img v-if="cameraImg" :src="cameraImg" class="w-full h-full object-cover" />
      <div v-else class="flex flex-col items-center gap-1 opacity-10 group-hover:opacity-25 transition-all duration-500 scale-90">
        <ImageIcon :size="48" :stroke-width="1" />
        <span class="text-[7px] font-black tracking-[0.3em] uppercase">Camera Standby</span>
      </div>
      <div class="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-sm"></div>
      <div class="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-sm"></div>
      <div class="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-sm"></div>
      <div class="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/40 rounded-br-sm"></div>
    </div>

    <div class="space-y-1.5 mt-auto">
      <button 
        @click="$emit('dispatch')"
        :disabled="mode === 'single' || !order.barcode || feedback.type === 'success'"
        class="w-full py-2.5 rounded-lg text-lg font-black uppercase tracking-tighter transition-all"
        :class="(mode === 'single' || !order.barcode || feedback.type === 'success') ? 'bg-gray-800 text-gray-600 opacity-20 cursor-not-allowed' : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[0.98] shadow-lg shadow-cyan-500/20'"
      >
        确认发车
      </button>

      <div class="w-full py-2 bg-black/40 rounded-lg flex items-center justify-center gap-2.5 border border-white/5 shadow-inner">
        <span class="text-[11px] font-black tracking-widest uppercase" :class="fbStyle.color">
          {{ feedback.text }}
        </span>
        <component :is="fbStyle.icon" :class="fbStyle.color" :size="18" :fill="fbStyle.filled ? 'currentColor' : 'none'" />
      </div>
    </div>
  </div>
  `
};
