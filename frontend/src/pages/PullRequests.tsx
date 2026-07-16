import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { GitPullRequest, Activity, AlertTriangle, ShieldCheck, PlayCircle } from 'lucide-react';

const PullRequests = () => {
  const [prs, setPrs] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');

  const fetchData = async () => {
    try {
      const [prRes, repoRes] = await Promise.all([
        axios.get('http://localhost:8000/api/pull-requests'),
        axios.get('http://localhost:8000/api/repositories')
      ]);
      setPrs(prRes.data);
      setRepos(repoRes.data);
      if (repoRes.data.length > 0 && !selectedRepo) {
        setSelectedRepo(repoRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMockScan = async () => {
    if (!selectedRepo) return alert("Please register a repository first!");
    setIsScanning(true);
    try {
      await axios.post('http://localhost:8000/api/generate-mock-scan', {
        repository_id: parseInt(selectedRepo),
        title: "Mock PR Deep Scan",
        branch: "feature/auth-bypass"
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to generate scan");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Pull Request Scans</h1>
          <p className="text-secondaryText">View and trigger DevSecOps pipeline scans manually.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#1C1F26] border border-[#2A2E39] p-2 rounded-xl">
          <select 
            className="bg-darkBg border border-[#2A2E39] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-brandAccent"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
          >
            {repos.length === 0 && <option value="">No Repositories</option>}
            {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button 
            disabled={isScanning || repos.length === 0}
            onClick={handleMockScan}
            className={`flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors ${isScanning ? 'bg-secondaryText/50 cursor-not-allowed text-white' : 'bg-brandAccent hover:bg-brandAccent/80 text-white'}`}
          >
            {isScanning ? (
              <Activity className="w-4 h-4 animate-spin" /> 
            ) : (
              <PlayCircle className="w-4 h-4" /> 
            )}
            Trigger Mock Scan
          </button>
        </div>
      </div>

      <div className="bg-cardBg border border-[#2A2E39] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#2A2E39] flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-brandAccent" />
          <h2 className="text-lg font-semibold text-white">All Monitored Pull Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1C1F26]/50 text-secondaryText text-xs uppercase tracking-wider border-b border-[#2A2E39]">
                <th className="py-4 px-6 font-semibold">Pull Request</th>
                <th className="py-4 px-6 font-semibold">Repository</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Gate Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E39]">
              {prs.map((pr) => (
                <tr key={pr.id} className="hover:bg-[#1C1F26]/30 transition-colors">
                  <td className="py-4 px-6">
                    <Link to={`/pr/${pr.id}`} className="text-white hover:text-brandAccent font-medium flex-col flex gap-1">
                      <span>{pr.title}</span>
                      <span className="text-xs text-secondaryText">#{pr.pr_number} • Risk Score: {pr.risk_score}</span>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-secondaryText">{pr.repository}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#2A2E39] text-white capitalize">
                      {pr.latest_scan_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {pr.passed ? (
                       <span className="text-riskLow text-sm font-medium flex items-center justify-end gap-2">
                         Passed <ShieldCheck className="w-4 h-4" />
                       </span>
                    ) : (
                      <span className="text-riskCritical text-sm font-medium flex items-center justify-end gap-2">
                        Failed <AlertTriangle className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-[#1C1F26] rounded-full mb-4">
                      <GitPullRequest className="w-8 h-8 text-secondaryText/50" />
                    </div>
                    <p className="text-secondaryText font-medium">No pull requests scanned yet.</p>
                    <p className="text-sm text-secondaryText max-w-sm mx-auto mt-2">Create a repository and click the manual trigger button above to test the pipeline.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PullRequests;
