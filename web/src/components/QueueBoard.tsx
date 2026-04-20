import { ReactNode, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Utensils, DoorOpen, Shirt, Users } from 'lucide-react';
import type { VenueZone } from '../types';

interface QueueBoardProps {
  zones: VenueZone[];
}

const TYPE_ICONS: Record<VenueZone['type'], ReactNode> = {
  gate: <DoorOpen size={13} aria-hidden="true" />,
  food: <Utensils size={13} aria-hidden="true" />,
  restroom: <Users size={13} aria-hidden="true" />,
  section: <Users size={13} aria-hidden="true" />,
  merch: <Shirt size={13} aria-hidden="true" />,
};

function densityToWait(density: number): number {
  return Math.round(density * 22);
}

/**
 * QueueBoard — Real-time wait time estimates per venue service zone.
 * Sorted by wait time descending (most urgent first).
 */

export function QueueBoard({ zones }: QueueBoardProps): ReactElement {
  const { t } = useTranslation();
  const serviceZones = zones
    .filter(z => ['gate', 'food', 'restroom', 'merch'].includes(z.type))
    .map(z => ({ ...z, waitMins: densityToWait(z.density) }))
    .sort((a, b) => b.waitMins - a.waitMins);

  return (
    <section className="glass p-5" aria-label="Queue wait time board">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-cyan-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-200">{t('headers.queue')}</h2>
      </div>

      <ul className="space-y-2" aria-label="Service zone wait times">
        {serviceZones.map(zone => (
          <li
            key={zone.zone_id}
            className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors duration-500 ${
              zone.level === 'CRITICAL' || zone.level === 'EMERGENCY'
                ? 'bg-red-500/10 border-red-500/20'
                : zone.level === 'HIGH'
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-white/3 border-white/6'
            }`}
            aria-label={`${zone.label}: ${zone.waitMins} minute wait`}
          >
            <div className="flex items-center gap-2">
              <span className={`${
                zone.level === 'CRITICAL' || zone.level === 'EMERGENCY' ? 'text-red-400' :
                zone.level === 'HIGH' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {TYPE_ICONS[zone.type]}
              </span>
              <span className="text-sm text-slate-200">{zone.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                zone.waitMins >= 15 ? 'text-red-400' :
                zone.waitMins >= 8 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {zone.waitMins}m
              </span>
              <span className={`badge ${
                zone.level === 'CRITICAL' || zone.level === 'EMERGENCY' ? 'badge-critical' :
                zone.level === 'HIGH' ? 'badge-high' :
                zone.level === 'MODERATE' ? 'badge-moderate' : 'badge-normal'
              }`}>
                {zone.level}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-600 text-right">{t('status.attribution')}</p>
    </section>
  );
}
