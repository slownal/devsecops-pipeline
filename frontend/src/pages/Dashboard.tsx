import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, ShieldCheck, Layers, GitPullRequest } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_repositories: 0,
    total_scans: 0,
    total_vulnerabilities: 0,
    pass_rate: 100
  });
  
  const [prs, setPrs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metApi = await axios.get('http://localhost:8000/api/dashboard/metrics');
        setMetrics(metApi.data);
        const prApi = await axios.get('http://localhost:8000/api/pull-requests');
        setPrs(prApi.data);
      } catch (err) {
        console.error("Failed to load dashboard data. Assuming local dev mode.");
        // Dummy data for visual development
        setMetrics({ total_repositories: 4, total_scans: 12, total_vulnerabilities: 24, pass_rate: 85.5 });
        setPrs([
          { id: 1, title: 'Update Authentication Flow', repository: 'org/auth-service', pr_number: 42, latest_scan_status: 'completed', passed: false, risk_score: 24 },
          { id: 2, title: 'Fix CSS typos', repository: 'org/frontend-ui', pr_number: 112, latest_scan_status: 'completed', passed: true, risk_score: 0 },
        ]);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Repositories', value: metrics.total_repositories, icon: Layers, color: 'text-blue-400' },
    { label: 'Total PR Scans', value: metrics.total_scans, icon: Activity, color: 'text-purple-400' },
    { label: 'Pass Rate', value: `${metrics.pass_rate}%`, icon: ShieldCheck, color: 'text-green-400' },
    { label: 'Total Vulns', value: metrics.total_vulnerabilities, icon: GitPullRequest, color: 'text-red-400' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Security Overview</h1>
        <p className="text-secondaryText">Monitor your organization's DevSecOps pipeline health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-cardBg border border-[#2A2E39] rounded-xl p-6 hover:border-brandAccent/50 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-secondaryText">{s.label}</span>
              <div className={`p-2 bg-[#1C1F26] rounded-md ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-cardBg border border-[#2A2E39] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#2A2E39]">
          <h2 className="text-lg font-semibold text-white">Recent Pull Requests</h2>
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
                      <span className="text-xs text-secondaryText">#{pr.pr_number}</span>
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
                  <td colSpan={4} className="py-8 text-center text-secondaryText text-sm">
                    No pull requests scanned yet.
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

// Also define AlertTriangle locally since it wasn't imported
import { AlertTriangle } from 'lucide-react';
export default Dashboard;
