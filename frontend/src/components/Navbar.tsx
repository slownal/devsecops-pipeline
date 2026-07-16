import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 border-b border-[#2A2E39] px-6 flex items-center justify-between bg-darkBg/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center bg-[#1C1F26] rounded-full px-4 py-2 border border-[#2A2E39] w-96">
        <Search className="w-4 h-4 text-secondaryText" />
        <input 
          type="text" 
          placeholder="Search repositories, findings..." 
          className="bg-transparent border-none outline-none text-sm ml-3 w-full text-white placeholder-secondaryText"
        />
      </div>
      
      <div className="flex items-center space-x-6 text-secondaryText">
        <button className="hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brandAccent rounded-full border-2 border-darkBg"></span>
        </button>
        <div className="w-px h-6 bg-[#2A2E39]"></div>
        <button className="hover:text-white flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brandAccent to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
