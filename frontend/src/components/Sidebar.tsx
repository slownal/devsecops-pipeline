import { Home, Shield, GitPullRequest, Settings, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const routes = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Pull Requests', icon: GitPullRequest, path: '/prs' },
    { label: 'Vulnerabilities', icon: Shield, path: '/vulns' },
    { label: 'Repositories', icon: Database, path: '/repos' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <div className="w-64 bg-darkBg border-r border-[#2A2E39] h-full flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-brandAccent/20 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-brandAccent" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SecurePR</span>
      </div>
      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        {routes.map(r => (
          <NavLink
            key={r.label}
            to={r.path}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#1C1F26] text-white border border-[#2A2E39] shadow-sm' 
                  : 'text-secondaryText hover:bg-[#1C1F26]/50 hover:text-white'
              }`
            }
          >
            <r.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{r.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
