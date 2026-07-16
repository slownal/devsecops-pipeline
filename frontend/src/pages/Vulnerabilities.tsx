import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Search } from 'lucide-react';

const Vulnerabilities = () => {
  const [vulns, setVulns] = useState<any[]>([]);

  useEffect(() => {
    const fetchVulns = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/vulnerabilities');
        setVulns(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVulns();
  }, []);

  const getSeverityIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-riskCritical flex-shrink-0" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-riskHigh flex-shrink-0" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-riskMedium flex-shrink-0" />;
      default: return <Info className="w-5 h-5 text-riskLow flex-shrink-0" />;
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-riskCritical bg-riskCritical/10 border-riskCritical/20';
      case 'high': return 'text-riskHigh bg-riskHigh/10 border-riskHigh/20';
      case 'medium': return 'text-riskMedium bg-riskMedium/10 border-riskMedium/20';
      default: return 'text-riskLow bg-riskLow/10 border-riskLow/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-[#2A2E39] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Vulnerability Triage</h1>
          <p className="text-secondaryText">Global view of all unresolved security findings.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search CVEs, files..." className="bg-[#1C1F26] border border-[#2A2E39] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brandAccent w-64 transition-colors shadow-inner" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vulns.map((v) => (
          <div key={v.id} className="bg-cardBg border border-[#2A2E39] rounded-xl p-5 hover:border-[#383E4C] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
            <div className="flex items-start justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getSeverityColor(v.severity)}`}>
                {getSeverityIcon(v.severity)}
                <span className="ml-1.5">{v.severity}</span>
              </span>
              <span className="text-xs font-medium text-secondaryText px-2 py-1 bg-[#1C1F26] rounded-md border border-[#2A2E39]">
                {v.source}
              </span>
            </div>
            
            <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-brandAccent transition-colors">{v.title}</h3>
            
            <div className="mb-4 text-sm text-secondaryText line-clamp-3 min-h-[60px]">
              {v.description}
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#2A2E39]/50 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondaryText truncate max-w-[150px]">{v.repository}</span>
                <span className="font-mono text-brandAccent/80">L{v.line_number}</span>
              </div>
              <div className="bg-[#1C1F26] px-2 py-1.5 rounded flex items-center gap-2 border border-[#2A2E39] overflow-hidden">
                <span className="font-mono text-xs text-secondaryText truncate">{v.file_path}</span>
              </div>
            </div>
          </div>
        ))}
        {vulns.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-[#2A2E39] rounded-2xl bg-[#1C1F26]/30">
            <ShieldAlert className="w-12 h-12 text-brandAccent mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-white text-lg mb-1">Clean Bill of Health!</h3>
            <p className="text-secondaryText">No vulnerabilities found across any monitored pull requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vulnerabilities;
