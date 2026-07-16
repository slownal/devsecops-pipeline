import { AlertTriangle, ShieldAlert, ShieldCheck, Flame } from 'lucide-react';

interface Props {
  severity: string;
}

const severityMap: Record<string, any> = {
  critical: { bg: 'bg-red-500/10', text: 'text-riskCritical', border: 'border-red-500/20', icon: Flame },
  high: { bg: 'bg-orange-500/10', text: 'text-riskHigh', border: 'border-orange-500/20', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-500/10', text: 'text-riskMedium', border: 'border-yellow-500/20', icon: ShieldAlert },
  low: { bg: 'bg-green-500/10', text: 'text-riskLow', border: 'border-green-500/20', icon: ShieldCheck },
};

const RiskBadge = ({ severity }: Props) => {
  const s = severity?.toLowerCase() || 'low';
  const conf = severityMap[s] || severityMap['low'];
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${conf.bg} ${conf.text} ${conf.border} border`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{s}</span>
    </span>
  );
};

export default RiskBadge;
