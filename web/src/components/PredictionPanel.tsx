import React from 'react';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { SurgeForecast, DensityLevel } from '../types';

interface PredictionPanelProps {
  forecast: SurgeForecast;
}

const LEVEL_COLOR: Record<DensityLevel, string> = {
  NORMAL: '#10b981',
  MODERATE: '#eab308',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
  EMERGENCY: '#dc2626',
};

function buildChartData(forecast: SurgeForecast) {
  return [
    { time: 'Now', density: forecast.current_density * 100, label: 'Current' },
    { time: 'T+10', density: forecast.forecast['T+10_mins'].density * 100, label: forecast.forecast['T+10_mins'].level },
    { time: 'T+20', density: forecast.forecast['T+20_mins'].density * 100, label: forecast.forecast['T+20_mins'].level },
    { time: 'T+30', density: forecast.forecast['T+30_mins'].density * 100, label: forecast.forecast['T+30_mins'].level },
  ];
}

export const densityFormatter = (v: number) => [`${v.toFixed(1)}%`, 'Density'];

/**
 * PredictionPanel — AI surge forecast chart with recharts + actionable recommendations.
 */
export function PredictionPanel({ forecast }: PredictionPanelProps): React.ReactElement {
  const chartData = buildChartData(forecast);
  const peakColor = LEVEL_COLOR[forecast.surge_level];

  return (
    <section className="glass p-5" aria-label="AI surge prediction panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-purple-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">AI Surge Forecast — {forecast.location_id}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-critical text-xs flex items-center gap-1">
            <Clock size={10} aria-hidden="true" /> Peak in {forecast.predicted_peak_time_mins} mins
          </span>
          <span className="text-xs text-slate-500">Confidence: <span className="text-blue-400 font-semibold">{forecast.confidence_score}%</span></span>
        </div>
      </div>

      {/* Recharts forecast timeline */}
      <div className="h-44" role="img" aria-label={`Surge forecast chart for ${forecast.location_id}. Peak expected in ${forecast.predicted_peak_time_mins} minutes.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#020817', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={densityFormatter}
            />
            <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'High', fill: '#f59e0b', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="density"
              stroke={peakColor}
              strokeWidth={2.5}
              dot={{ fill: peakColor, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Actionable Recommendations */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle size={12} aria-hidden="true" className="text-amber-400" /> Agent Recommendations
        </h3>
        <ol className="space-y-1.5" aria-label="Actionable recommendations from Prediction Agent">
          {forecast.actionable_recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
