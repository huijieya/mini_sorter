import React from 'react';
import { AlertCircle, Settings, Link2, Power } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="flex justify-between items-center px-4 py-2">
      <h1 className="text-xl font-bold tracking-tight text-gray-100">FlexiNode V1.0</h1>
      
      <div className="flex items-center gap-2">
        <button className="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors">
          <AlertCircle size={16} />
        </button>
        <button 
          onClick={onOpenSettings}
          className="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors"
        >
          <Settings size={16} />
        </button>
        <button className="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-[#64C84C] border border-white/5 transition-colors">
          <Link2 size={16} />
        </button>
        <button className="w-7 h-7 bg-[#2c2c2c] hover:bg-[#333] rounded-full flex items-center justify-center text-gray-400 border border-white/5 transition-colors">
          <Power size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;