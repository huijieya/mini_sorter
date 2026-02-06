
export default {
  name: 'ConfirmModal',
  props: {
    show: Boolean,
    title: String,
    content: String,
    confirmText: { type: String, default: '确认' },
    cancelText: { type: String, default: '取消' },
    confirmColor: { type: String, default: 'bg-cyan-500' }
  },
  emits: ['confirm', 'cancel'],
  template: `
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('cancel')"></div>
        
        <!-- 弹窗主体 -->
        <div class="relative bg-[#2c2c2c] border border-white/5 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-8 text-center animate-pop">
          <h3 class="text-xl font-bold text-white mb-2" v-html="title"></h3>
          <p class="text-gray-400 text-sm mb-8 leading-relaxed" v-html="content"></p>
          
          <div class="flex gap-4">
            <button 
              @click="$emit('cancel')"
              class="flex-1 py-3 rounded-lg bg-[#b2b2b2] hover:bg-[#a0a0a0] text-white font-bold transition-all active:scale-95"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="$emit('confirm')"
              class="flex-1 py-3 rounded-lg text-black font-bold transition-all active:scale-95 shadow-lg"
              :class="confirmColor"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  `,
  style: `
    .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }
    @keyframes pop {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop { animation: pop 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67); }
  `
};
