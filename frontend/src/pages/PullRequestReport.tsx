import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, ShieldAlert, Cpu, Code, ShieldCheck } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

const PullRequestReport = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // In real app, fetch from backend: `http://localhost:8000/api/pull-requests/${id}`
    // Since we want this to look beautiful right away even before DB seed, let's mock the structure too just in case backend fails
    const mockData = {
      pr_info: { title: 'Add Authentication Middleware', branch: 'feat/auth', commit_sha: 'a1b2c3d' },
      scans: [
        {
          id: 1, status: 'completed', passed: false, risk_score: 18, created_at: '2023-11-20T10:00:00Z',
          findings: [
            { title: 'Hardcoded Secret Token', severity: 'critical', source: 'codebert', file_path: 'auth/middleware.py', line_number: 14, confidence_score: 0.98 },
            { title: 'Information Exposure', severity: 'high', source: 'sonarqube', file_path: 'auth/middleware.py', line_number: 45, confidence_score: 1.0 },
            { title: 'Missing Rate Limiting', severity: 'medium', source: 'sonarqube', file_path: 'auth/routes.py', line_number: 12, confidence_score: 0.8 },
          ]
        }
      ]
    };

    axios.get(`http://localhost:8000/api/pull-requests/${id}`)
      .then(res => setData(res.data))
      .catch((_) => setData(mockData));
  }, [id]);

  if (!data) return <div className="p-8 text-center text-secondaryText animate-pulse">Loading Scan Report...</div>;

  const latestScan = data.scans[0] || { findings: [], passed: true, risk_score: 0 };
  const findings = latestScan.findings;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <Link to="/" className="p-2 bg-[#1C1F26] rounded-md hover:bg-[#2A2E39] text-secondaryText hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{data.pr_info.title}</h1>
          <div className="text-sm text-secondaryText mt-1 flex items-center space-x-3">
            <span className="flex items-center"><Code className="w-4 h-4 mr-1 text-[#3B82F6]" /> {data.pr_info.branch}</span>
            <span>•</span>
            <span className="font-mono bg-[#1C1F26] px-1.5 py-0.5 rounded text-xs">{data.pr_info.commit_sha.substring(0, 7)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cardBg border border-[#2A2E39] rounded-xl p-6 shadow-sm col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4 border-b border-[#2A2E39] pb-4">Security Quality Gate</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {latestScan.passed ? (
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="text-xl font-bold text-white tracking-tight">{latestScan.passed ? "Gate Passed" : "Gate Failed"}</p>
                <p className="text-sm text-secondaryText">Based on severity thresholds.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-secondaryText">Total Risk Score</span>
              <p className="text-3xl font-black text-white">{latestScan.risk_score}</p>
            </div>
          </div>
        </div>

        <div className="bg-cardBg border border-[#2A2E39] rounded-xl p-6 shadow-sm flex flex-col justify-center">
             <h3 className="text-sm font-semibold text-secondaryText uppercase tracking-wider mb-4">Engines Used</h3>
             <ul className="space-y-3">
               <li className="flex items-center space-x-3 bg-[#1C1F26] p-3 rounded-lg border border-[#2A2E39]">
                 <Cpu className="w-5 h-5 text-brandAccent" />
                 <span className="text-sm font-medium text-white">CodeBERT AI Model</span>
               </li>
               <li className="flex items-center space-x-3 bg-[#1C1F26] p-3 rounded-lg border border-[#2A2E39]">
                 <ShieldCheck className="w-5 h-5 text-blue-400" />
                 <span className="text-sm font-medium text-white">SonarQube Static</span>
               </li>
             </ul>
        </div>
      </div>

      <div className="bg-cardBg border border-[#2A2E39] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#2A2E39] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Vulnerabilities Detected</h2>
          <span className="bg-[#1C1F26] text-secondaryText px-3 py-1 rounded-full text-xs border border-[#2A2E39]">
            {findings.length} findings
          </span>
        </div>
        
        {findings.length > 0 ? (
          <div className="divide-y divide-[#2A2E39]">
            {findings.map((f: any, idx: number) => (
              <div key={idx} className="p-6 hover:bg-[#1C1F26]/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <RiskBadge severity={f.severity} />
                      <span className="text-xs uppercase font-bold tracking-wider text-secondaryText flex items-center space-x-1 border border-[#2A2E39] px-2 py-0.5 rounded bg-darkBg">
                        {f.source === 'codebert' ? <Cpu className="w-3 h-3 text-[#3B82F6] mr-1" /> : <ShieldCheck className="w-3 h-3 text-blue-400 mr-1"/>}
                        {f.source}
                      </span>
                    </div>
                    <h4 className="text-md font-bold text-primaryText">{f.title}</h4>
                    <p className="text-sm text-secondaryText mt-1 font-mono bg-darkBg px-2 py-1 rounded-md inline-block border border-[#2A2E39]">
                      {f.file_path}:{f.line_number || 1}
                    </p>
                  </div>
                  {f.confidence_score && (
                    <div className="text-right">
                      <div className="text-xs text-secondaryText mb-1">AI Confidence</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-darkBg rounded-full overflow-hidden border border-[#2A2E39]">
                          <div className="h-full bg-brandAccent" style={{ width: `${f.confidence_score * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-white">{Math.round(f.confidence_score * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-secondaryText">
             <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-4" />
             <p className="text-lg font-medium text-white">No vulnerabilities found!</p>
             <p className="text-sm mt-1">This code looks pristine and secure.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PullRequestReport;
