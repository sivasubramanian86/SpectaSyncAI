import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  BarChart, Bar, Tooltip, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';


// --- Command Hub: Mesh Performance Data ---
const meshData = [
  { subject: 'Vision', A: 120, fullMark: 150 },
  { subject: 'Queue', A: 98, fullMark: 150 },
  { subject: 'Crisis', A: 145, fullMark: 150 },
  { subject: 'RAG', A: 110, fullMark: 150 },
  { subject: 'Staff', A: 85, fullMark: 150 },
];

/**
 * Component displaying the Mesh Performance Radar chart.
 * Captures latency and responsiveness across multiple agents.
 * 
 * @returns {React.ReactElement} The radar chart widget.
 */
export const MeshPerformanceRadar = () => (
  <div className="h-[200px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="53%" outerRadius="70%" data={meshData}>
        <PolarGrid stroke="rgba(255,255,255,0.05)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Radar
          name="Latency"
          dataKey="A"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// --- Tactical View: Zone Occupancy ---
const occupancyData = [
  { name: 'Sec 101', count: 420 },
  { name: 'Sec 102', count: 580 },
  { name: 'Gate N', count: 210 },
  { name: 'Stage', count: 850 },
  { name: 'Staff', count: 120 },
];

/**
 * Component displaying real-time Zone Occupancy Data as bar charts.
 * Highly responsive to changes in physical density tracking.
 *
 * @returns {React.ReactElement} The bar chart widget.
 */
export const ZoneOccupancyBars = () => (
  <div className="h-[250px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={occupancyData}>
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
        />
        <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// --- Crisis Hub: Risk Velocity ---
const riskData = [
  { time: '10:00', risk: 20 },
  { time: '10:10', risk: 25 },
  { time: '10:20', risk: 65 },
  { time: '10:30', risk: 45 },
  { time: '10:40', risk: 80 },
  { time: '10:50', risk: 95 },
];

/**
 * Component mapping historical risk trends using an Area chart.
 * Helps operator predict exponential hazard growth.
 * 
 * @returns {React.ReactElement} The risk area chart.
 */
export const RiskVelocityArea = () => (
  <div className="h-[200px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={riskData}>
        <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGradient)" />
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// --- Sentiment Breakdown ---
const sentimentData = [
  { name: 'Positive', value: 45 },
  { name: 'Anxious', value: 35 },
  { name: 'Panic', value: 15 },
  { name: 'Hostile', value: 5 },
];

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

/**
 * Component breaking down crowd sentiment based on social & video cues.
 * Updates via Sentiment or Experience agent outputs.
 * 
 * @returns {React.ReactElement} The pie chart visualization.
 */
export const SentimentPie = () => (
  <div className="h-[200px] w-full flex items-center justify-center">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={sentimentData}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          paddingAngle={5}
          dataKey="value"
        >
          {sentimentData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute flex flex-col items-center">
      <span className="text-[10px] text-slate-500 uppercase font-black">Sentiment</span>
      <span className="text-lg font-bold">Stable</span>
    </div>
  </div>
);
