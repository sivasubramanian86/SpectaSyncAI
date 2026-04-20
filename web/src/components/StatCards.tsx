import { ReactNode, ReactElement } from 'react';
import { Users, AlertTriangle, Activity, Cpu, TrendingUp } from 'lucide-react';

/**
 * Props for the StatCards component.
 */
interface StatCardsProps {
  /** Average crowd density percentage (0-1) across the venue. */
  avgDensity: number;
  /** Number of zones currently in CRITICAL or EMERGENCY state. */
  criticalCount: number;
  /** Total number of monitored venue zones. */
  totalZones: number;
  /** Number of active AI-driven interventions in the field. */
  activeInterventions: number;
  /** Total number of active agents in the Google ADK mesh. */
  agentCount: number;
  /** Current system language. */
  language: string;
}

function StatCard({
  icon, label, value, unit, color, sublabel,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <article className="stat-card" aria-label={`${label}: ${value}${unit ?? ''}`}>
      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${color} mb-1`}>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      {sublabel && <p className="text-xs text-slate-600">{sublabel}</p>}
    </article>
  );
}

/**
 * Top-level summary metrics row for the Command Center.
 */
import { useTranslation } from 'react-i18next';

export function StatCards({ avgDensity, criticalCount, totalZones, activeInterventions, agentCount }: StatCardsProps): ReactElement {
  const { t } = useTranslation();
  return (
    <section aria-label="Venue summary statistics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        icon={<Users size={18} className="text-blue-300" aria-hidden="true" />}
        label={t('stats.density')}
        value={`${Math.round(avgDensity * 100)}`}
        unit="%"
        color="bg-blue-500/15"
      />
      <StatCard
        icon={<AlertTriangle size={18} className="text-red-300" aria-hidden="true" />}
        label={t('stats.critical')}
        value={`${criticalCount}`}
        unit={`/ ${totalZones}`}
        color={criticalCount > 0 ? 'bg-red-500/20' : 'bg-emerald-500/15'}
      />
      <StatCard
        icon={<Activity size={18} className="text-amber-300" aria-hidden="true" />}
        label={t('stats.interventions')}
        value={`${activeInterventions}`}
        color="bg-amber-500/15"
      />
      <StatCard
        icon={<Cpu size={18} className="text-purple-300" aria-hidden="true" />}
        label={t('stats.agents')}
        value={`${agentCount}`}
        color="bg-purple-500/15"
      />
      <StatCard
        icon={<TrendingUp size={18} className="text-emerald-300" aria-hidden="true" />}
        label="Predictions"
        value="Live"
        color="bg-emerald-500/15"
        sublabel="T+10/20/30 forecast"
      />
    </section>
  );
}
