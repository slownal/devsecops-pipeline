import { useState } from 'react';
import { Save, Lock, Github, Bell, Code2 } from 'lucide-react';

const Settings = () => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Configuration</h1>
        <p className="text-secondaryText">Manage security tokens, engine settings, and notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* GitHub Integration */}
        <div className="bg-cardBg border border-[#2A2E39] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#2A2E39] bg-[#1C1F26]/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Github className="w-5 h-5 text-brandAccent" />
              GitHub Webhook Integration
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Webhook Secret Key</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" defaultValue="••••••••••••••••" className="w-full bg-darkBg border border-[#2A2E39] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brandAccent transition-colors" />
              </div>
              <p className="text-xs text-secondaryText mt-2">Used to cryptographically verify payload signatures from GitHub.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Personal Access Token (PAT)</label>
              <input type="password" placeholder="ghp_********************************" className="w-full bg-darkBg border border-[#2A2E39] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandAccent transition-colors" />
            </div>
          </div>
        </div>

        {/* Engine Settings */}
        <div className="bg-cardBg border border-[#2A2E39] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#2A2E39] bg-[#1C1F26]/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              Machine Learning Engines
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 border border-[#2A2E39] rounded-lg bg-darkBg">
              <div>
                <h3 className="text-white font-medium">CodeBERT Transformer</h3>
                <p className="text-sm text-secondaryText">Deep contextual vulnerability analysis</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[#2A2E39] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandAccent"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-[#2A2E39] rounded-lg bg-darkBg opacity-50">
              <div>
                <h3 className="text-white font-medium">SonarQube Static Analysis</h3>
                <p className="text-sm text-secondaryText">Traditional static AST analysis (Disconnected)</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input type="checkbox" className="sr-only peer" disabled />
                <div className="w-11 h-6 bg-[#2A2E39] peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-secondaryText/50 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-3">Failure Risk Threshold ({'>'} 75)</label>
              <input type="range" min="1" max="100" defaultValue="75" className="w-full h-2 bg-[#2A2E39] rounded-lg appearance-none cursor-pointer accent-brandAccent" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-cardBg border border-[#2A2E39] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#2A2E39] bg-[#1C1F26]/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-400" />
              Notifications
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center space-x-3 text-white">
              <input type="checkbox" className="w-4 h-4 rounded border-[#2A2E39] text-brandAccent focus:ring-brandAccent" defaultChecked />
              <span>Email alerts on Critical findings</span>
            </label>
            <label className="flex items-center space-x-3 text-white">
              <input type="checkbox" className="w-4 h-4 rounded border-[#2A2E39] text-brandAccent focus:ring-brandAccent" defaultChecked />
              <span>Slack webhook integration</span>
            </label>
            <input type="url" placeholder="https://hooks.slack.com/services/..." className="w-full bg-darkBg border border-[#2A2E39] rounded-lg px-4 py-2 mt-2 text-white focus:outline-none focus:border-brandAccent transition-colors" />
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-[#2A2E39] pt-6">
          <button type="submit" className="flex items-center gap-2 bg-brandAccent hover:bg-brandAccent/80 text-white font-medium py-2.5 px-8 rounded-lg transition-all shadow-md">
            <Save className="w-4 h-4" />
            {isSaved ? "Saved!" : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
