
import React, { useState } from 'react';
import { X, ChevronLeft, Globe } from 'lucide-react';

interface SettingsOverlayProps {
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('rules');

  const ruleOptions = {
    standard: ['波次订单'],
    builtIn: ['波次订单', '编码分拣', '随机分拣', '编码范围', '起止符'],
    custom: ['顺丰', '中通', '京东']
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0f0f0f] flex flex-col p-8 overflow-hidden">
      <div className="flex justify-between items-center mb-12">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">FlexiNode V1.0</h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">单机规则配置</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
            <Globe size={16} />
            <span className="text-sm font-mono">192.168.0.1</span>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-5 py-2 rounded-lg transition-colors"
          >
            返回
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-white/5">
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-12 py-5 font-bold transition-all relative ${activeTab === 'rules' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            单机规则
            {activeTab === 'rules' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('network')}
            className={`px-12 py-5 font-bold transition-all relative ${activeTab === 'network' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            网络设置
            {activeTab === 'network' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />}
          </button>
        </div>

        <div className="p-12 space-y-12 flex-1 overflow-y-auto">
          <div className="flex items-start">
            <span className="w-32 text-gray-500 font-bold py-3">当前规则</span>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-[#64C84C] text-black font-bold rounded-xl shadow-lg shadow-green-500/20">
                波次订单
              </button>
            </div>
          </div>

          <div className="flex items-start">
            <span className="w-32 text-gray-500 font-bold py-3">内设</span>
            <div className="flex flex-wrap gap-4">
              {ruleOptions.builtIn.map(rule => (
                <button 
                  key={rule}
                  className={`px-8 py-4 rounded-xl font-bold transition-all ${rule === '波次订单' ? 'bg-[#64C84C] text-black shadow-lg shadow-green-500/20' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'}`}
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start">
            <span className="w-32 text-gray-500 font-bold py-3">自定义</span>
            <div className="flex flex-wrap gap-4">
              {ruleOptions.custom.map(rule => (
                <button 
                  key={rule}
                  className="px-8 py-4 bg-[#2a2a2a] text-gray-400 font-bold rounded-xl hover:bg-[#333] transition-all"
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
