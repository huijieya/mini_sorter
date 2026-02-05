import { AlertCircle, Settings, Link2, Power } from 'lucide-vue-next';

export default {
  name: 'Header',
  emits: ['open-settings'],
  components: { AlertCircle, Settings, Link2, Power },
  template: `
  <header class="flex justify-between items-center px-4 py-2">
    <h1 class="text-xl font-bold tracking-tight text-gray-100">FlexiNode V1.0</h1>
    <div class="flex items-center gap-2">
      <button class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors">
        <AlertCircle :size="16" />
      </button>
      <button 
        @click="$emit('open-settings')"
        class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors"
      >
        <Settings :size="16" />
      </button>
      <button class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-[#64C84C] border border-white/5 transition-colors">
        <Link2 :size="16" />
      </button>
      <button class="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors">
        <Power :size="16" />
      </button>
    </div>
  </header>
  `
};