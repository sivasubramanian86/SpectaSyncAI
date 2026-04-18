import React from 'react';
import { Maximize2, Layers, Map as MapIcon, Crosshair } from 'lucide-react';

interface VenueMapProps {
  className?: string;
}

export function VenueMap({ className = '' }: VenueMapProps): React.ReactElement {
  return (
    <div className={`glass overflow-hidden flex flex-col ${className}`}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapIcon size={14} className="text-blue-400" />
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satellite Venue Watch (Google Maps API)</h3>
        </div>
        <div className="flex gap-2">
           <button type="button" aria-label="Toggle venue layers" className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white">
             <Layers size={14} />
           </button>
           <button type="button" aria-label="Maximize venue map" className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white">
             <Maximize2 size={14} />
           </button>
        </div>
      </div>
      
      <div className="relative flex-grow min-h-[400px] bg-slate-900 overflow-hidden">
        {/* The generated satellite map */}
        <img 
          src="/assets/google_satellite_venue_map_1776449711784.png" 
          alt="Satellite Venue Map"
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Tactical Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 p-2 bg-navy-950/80 border border-blue-500/30 backdrop-blur rounded text-[9px] font-mono text-blue-400">
             LAT: 35.6895° N | LON: 139.6917° E
          </div>
          
          {/* Target Reticles */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
             <Crosshair size={24} className="text-red-500 animate-pulse opacity-50" />
             <div className="mt-2 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-[8px] font-bold text-red-300 uppercase">
                Zone B Peak
             </div>
          </div>
        </div>

        {/* Map UI Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
           <div className="flex flex-col bg-navy-950/80 border border-white/10 rounded overflow-hidden">
              <button type="button" aria-label="Zoom in" className="p-2 hover:bg-white/5 text-slate-400 font-bold">+</button>
              <div className="h-[1px] bg-white/5" />
              <button type="button" aria-label="Zoom out" className="p-2 hover:bg-white/5 text-slate-400 font-bold">-</button>
           </div>
        </div>
      </div>
    </div>
  );
}
