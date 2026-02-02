
import React from 'react';
import { AlertTriangle, Settings, Link2, Power } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="flex justify-between items-center px-6 py-1.5 bg-[#1a1a1a] border-b border-white/5">
      <div className="flex flex-col">
        <h1 className="text-base font-bold tracking-tight leading-tight">FlexiNode V1.0</h1>
        <span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase opacity-80">MINI SORTER</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-1 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
          <AlertTriangle size={18} />
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-1 hover:bg-white/5 rounded-full text-gray-500 transition-colors"
        >
          <Settings size={18} />
        </button>
        <button className="p-1 hover:bg-green-500/10 rounded-full text-green-500 transition-colors">
          <Link2 size={18} />
        </button>
        <button className="p-1 hover:bg-red-500/10 rounded-full text-red-500 transition-colors">
          <Power size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
