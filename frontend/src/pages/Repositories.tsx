import { useEffect, useState } from 'react';
import axios from 'axios';
import { Database, Plus, Search } from 'lucide-react';

const Repositories = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', full_name: '', url: '' });

  const fetchRepos = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/repositories');
      setRepos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/repositories', newRepo);
      setIsAdding(false);
      setNewRepo({ name: '', full_name: '', url: '' });
      fetchRepos();
    } catch (err) {
      console.error(err);
      alert("Failed to add repository: " + err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Monitored Repositories</h1>
          <p className="text-secondaryText">Manage your GitHub integration and pipeline targets.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-brandAccent hover:bg-brandAccent/80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1C1F26] border border-[#2A2E39] rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Register New Repository</h2>
          <form onSubmit={handleAdd} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-secondaryText mb-1">Display Name</label>
              <input required value={newRepo.name} onChange={e => setNewRepo({...newRepo, name: e.target.value})} type="text" className="w-full bg-darkBg border border-[#2A2E39] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandAccent transition-colors" placeholder="e.g. Auth Service" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondaryText mb-1">GitHub Identifier (org/repo)</label>
              <input required value={newRepo.full_name} onChange={e => setNewRepo({...newRepo, full_name: e.target.value})} type="text" className="w-full bg-darkBg border border-[#2A2E39] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandAccent transition-colors" placeholder="org/auth-service" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondaryText mb-1">Repository URL</label>
              <input required value={newRepo.url} onChange={e => setNewRepo({...newRepo, url: e.target.value})} type="url" className="w-full bg-darkBg border border-[#2A2E39] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brandAccent transition-colors" placeholder="https://github.com/..." />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="bg-brandAccent hover:bg-brandAccent/80 text-white font-medium py-2 px-6 rounded-lg transition-colors">Register</button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-transparent hover:bg-[#2A2E39] text-white font-medium py-2 px-6 rounded-lg transition-colors border border-transparent hover:border-[#2A2E39]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-cardBg border border-[#2A2E39] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#2A2E39] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-brandAccent" />
            Active Integrations
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search..." className="bg-darkBg border border-[#2A2E39] rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-brandAccent" />
          </div>
        </div>
        <div className="divide-y divide-[#2A2E39]">
          {repos.map(r => (
            <div key={r.id} className="p-6 hover:bg-[#1C1F26]/30 transition-colors flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium text-lg">{r.name}</h3>
                <div className="text-secondaryText text-sm mt-1">{r.full_name}</div>
              </div>
              <div className="flex items-center gap-4">
                <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-brandAccent hover:underline">View on GitHub</a>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  Webhook Active
                </span>
              </div>
            </div>
          ))}
          {repos.length === 0 && (
            <div className="p-8 text-center text-secondaryText">
              No repositories tracked. Register one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Repositories;
