import { Baby, Accessibility, UserPlus, Eye, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

const DEMO_DATA = [
  { group: 'Women', count: 420, color: '#f472b6', alert: true },
  { group: 'Kids', count: 180, color: '#60a5fa', alert: false },
  { group: 'Elderly', count: 95, color: '#fbbf24', alert: true },
  { group: 'Men', count: 550, color: '#94a3b8', alert: false },
];

const PIE_DATA = [
  { name: 'Priority', value: 695, fill: '#3b82f6' },
  { name: 'Standard', value: 550, fill: '#1e293b' },
];

/**
 * DemographicInsights — Computer Vision Classification Dashboard.
 * Focuses on High-Risk groups (Women, Kids, Elderly).
 */
export function DemographicInsights() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Vision Stream Header */}
      <div className="flex items-center justify-between glass p-4 border-l-4 border-blue-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Eye className="text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Vision Demographic Intelligence</h2>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">GCP Video Intelligence API Pipeline</p>
          </div>
        </div>
        <div className="flex gap-2">
            <div className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                <Activity size={12} /> Pub/Sub Streaming
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Risk Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_DATA.filter(d => d.group !== 'Men').map(d => (
            <div key={d.group} className={`glass p-5 border-t-2 transition-all hover:scale-[1.02] ${d.alert ? 'border-red-500/50' : 'border-blue-500/30'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white/5">
                  {d.group === 'Women' && <UserPlus className="text-pink-400" size={20} />}
                  {d.group === 'Kids' && <Baby className="text-blue-400" size={20} />}
                  {d.group === 'Elderly' && <Accessibility className="text-amber-400" size={20} />}
                </div>
                {d.alert && (
                  <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-black animate-pulse">HIGH DENSITY</span>
                )}
              </div>
              <p className="text-3xl font-black text-white">{d.count}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">{d.group} Identified</p>
              <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                  style={{ width: `${(d.count / 1200) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Priority Split */}
        <div className="glass p-5 flex flex-col items-center justify-center">
            <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Priority vs Standard</h3>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={PIE_DATA}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {PIE_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#94a3b8', fontSize: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> VULNERABLE
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <div className="w-2 h-2 rounded-full bg-slate-800" /> GENERAL
                </div>
            </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="glass p-6 h-[300px]">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Demographic Distribution Velocity</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DEMO_DATA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
                dataKey="group" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {DEMO_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Live AI Reasoning Trace (Demographics) */}
      <div className="glass-dark p-4 rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-blue-400" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">ADK Live Agent Trace (Vision)</span>
        </div>
        <div className="space-y-2">
            <div className="flex gap-3 text-[10px] font-mono">
                <span className="text-slate-500">[08:42:11]</span>
                <span className="text-amber-400">VISION_AGENT:</span>
                <span className="text-slate-300">Classified surge in Zone 4 (West Gate). Demographic delta: +15% Elderly.</span>
            </div>
            <div className="flex gap-3 text-[10px] font-mono">
                <span className="text-slate-500">[08:42:12]</span>
                <span className="text-blue-400">PUBSUB_RELAY:</span>
                <span className="text-slate-300">Broadcasting TIER_2_VULNERABLE_SIGNAL to Mesh. Ack latency: 12ms.</span>
            </div>
            <div className="flex gap-3 text-[10px] font-mono">
                <span className="text-slate-500">[08:42:14]</span>
                <span className="text-emerald-400">RAG_MESH:</span>
                <span className="text-slate-300">Retrieving similar pattern: INC-2017-IND-01. Conclusion: Immediate soft-redirection required.</span>
            </div>
        </div>
      </div>
    </div>
  );
}
