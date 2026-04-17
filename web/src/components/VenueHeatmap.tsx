import React, { useState } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import type { VenueZone, DensityLevel } from '../types';

interface VenueHeatmapProps {
  zones: VenueZone[];
}

const LEVEL_COLORS: Record<DensityLevel, string> = {
  NORMAL: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30',
  MODERATE: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/30',
  HIGH: 'bg-amber-500/25 border-amber-500/40 text-amber-200 hover:bg-amber-500/35',
  CRITICAL: 'bg-red-500/30 border-red-500/50 text-red-200 hover:bg-red-500/40 animate-pulse-slow',
  EMERGENCY: 'bg-red-600/40 border-red-400/70 text-red-100 hover:bg-red-600/50 animate-pulse',
};

const LEVEL_BADGES: Record<DensityLevel, string> = {
  NORMAL: 'badge-normal',
  MODERATE: 'badge-moderate',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
  EMERGENCY: 'badge-critical',
};

/**
 * Enhanced VenueHeatmap — High Density Spatial Monitoring.
 */
export function VenueHeatmap({ zones }: VenueHeatmapProps): React.ReactElement {
  const [selectedZone, setSelectedZone] = useState<VenueZone | null>(null);

  return (
    <section className="glass p-5" aria-label="Spatial monitor">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">Tactical Asset Grid</h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Safe</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Warn</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Alert</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {/* The Grid */}
        <div className="lg:col-span-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
          {zones.map((zone) => (
            <button
              key={zone.zone_id}
              className={`zone-cell h-20 border ${LEVEL_COLORS[zone.level]} transition-all duration-700 flex flex-col items-center justify-center`}
              onClick={() => setSelectedZone(zone === selectedZone ? null : zone)}
            >
              <span className="text-[10px] font-bold opacity-60 uppercase">{zone.zone_id.split('_')[1]}</span>
              <span className="text-lg font-black">{Math.round(zone.density * 100)}%</span>
            </button>
          ))}
        </div>

        {/* Selected Data or Global Trend */}
        <div className="glass-dark p-4 flex flex-col justify-between">
           {selectedZone ? (
             <div className="animate-fade-in h-full flex flex-col justify-between">
                <div>
                   <h3 className="text-sm font-black text-white uppercase">{selectedZone.label}</h3>
                   <div className="mt-2 flex gap-2">
                      <span className={LEVEL_BADGES[selectedZone.level]}>{selectedZone.level}</span>
                      <span className="badge-normal bg-blue-500/10 text-blue-400 border-blue-500/30">AI Linked</span>
                   </div>
                </div>
                <div className="mt-4">
                   <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Compression Index</p>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[65%]" />
                   </div>
                </div>
                <div className="mt-4 p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                   <p className="text-[9px] text-blue-300 uppercase leading-tight font-bold">Recommended Staff Shift:</p>
                   <p className="text-xs text-white mt-1 underline decoration-blue-500/40">+2 Response Units</p>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <TrendingUp className="text-slate-700" size={32} />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">
                   Select a tactical zone <br/> for deep telemetry
                </p>
             </div>
           )}
        </div>
      </div>
    </section>
  );
}
