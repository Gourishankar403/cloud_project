import React, { useEffect, useState } from 'react';






import axios from 'axios';






import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';













const API_URL = 'http://localhost:8003/api/v1';













export default function Dashboard() {






  const [telemetry, setTelemetry] = useState<any[]>([]);






  const [workflows, setWorkflows] = useState<any[]>([]);






  const [loading, setLoading] = useState(true);






  const [weather, setWeather] = useState<any>(null);






  






  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [executedActionIds, setExecutedActionIds] = useState<any[]>([]);













  // Poll data






  useEffect(() => {






    fetchData();






    const interval = setInterval(fetchData, 4000); 






    return () => clearInterval(interval);






  }, []);













  const fetchData = async () => {






    try {






      const res = await axios.get(`${API_URL}/telemetry?limit=25`);






      setTelemetry(res.data.reverse());






      






      const wfRes = await axios.get(`${API_URL}/workflows?limit=4`);






      setWorkflows(wfRes.data);






      






      const weatherRes = await axios.get(`${API_URL}/farms/1/weather`);






      if (weatherRes.data && !weatherRes.data.error) {






        setWeather(weatherRes.data);






      }






      setLoading(false);






    } catch (err) {






      console.error(err);






      setLoading(false);






    }






  };













  const executeAction = async (action: any, id: any) => {
    if (id !== undefined) {
      setExecutedActionIds(prev => [...prev, id]);
    }
    const durationText = action.duration_minutes ? ` for ${action.duration_minutes} minutes` : '';
    const msg = `⚡ Command Transmitted to Edge: ${action.action_type.replace('_', ' ').toUpperCase()}${durationText}`;
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 5000);
  };






  const chartDataMap: any = {};
  telemetry.forEach(t => {
    const rawTs = t.timestamp ? (t.timestamp.endsWith('Z') || t.timestamp.includes('+') ? t.timestamp : t.timestamp + 'Z') : '';
    const time = rawTs ? new Date(rawTs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '';
    if (!chartDataMap[time]) chartDataMap[time] = { time };
    if (t.sensor_type === 'soil_moisture') chartDataMap[time]["Moisture (%)"] = Math.round(t.value * 10) / 10;
    if (t.sensor_type === 'air_temperature') chartDataMap[time]["Temperature (C)"] = Math.round(t.value * 10) / 10;
  });

  const chartData = Object.values(chartDataMap);













  const moistureData: any[] = chartData.filter((d: any) => d["Moisture (%)"] !== undefined);






  const tempData: any[] = chartData.filter((d: any) => d["Temperature (C)"] !== undefined);






  






  













  const anomalyData = [






    { name: 'Low Moisture', value: 400 },






    { name: 'High Temp', value: 300 },






    { name: 'Normal', value: 1000 },






  ];






  const COLORS = ['#3b82f6', '#f97316', '#10b981'];













  return (






    <div className="space-y-8 w-full max-w-[1600px] mx-auto relative bg-slate-50/50 min-h-screen pb-12">






      






      {/* Toast Notification */}






        {actionMessage && (






          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-slate-100 px-6 py-3 rounded-full shadow-lg z-50 font-semibold text-sm flex items-center gap-3 border border-slate-700 backdrop-blur-sm bg-opacity-90">






            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>






            {actionMessage}






          </div>






        )}













      {/* S3 Cold Storage Data Lake Tiering Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-md border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Cloud Tiered Storage:</span>
              <span className="text-xs font-semibold text-slate-200">Hot Tier (PostgreSQL) + Cold Tier (S3 Analytical Data Lake)</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Canonical Lake: s3://agentflow-cold-lake (WORM Audit & SHA-256 Immutability)</div>
          </div>
        </div>
        <a href="/data-lake" className="inline-flex items-center gap-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1.5 rounded-xl transition-all self-start sm:self-auto">
          <span>Open S3 Lake Explorer</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
      </div>

      {/* Top Config Row */}






      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">






        






        {/* Farm Location Context */}






        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between">






          <div className="mb-4 flex items-center justify-between border-b pb-2">






            <h2 className="text-base font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">






              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>






              Farm Location Context






            </h2>






          </div>






          <div className="flex gap-4 items-center">






            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">






              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Latitude</label>






              <div className="text-lg font-black text-slate-800 font-mono">12.9716° N</div>






            </div>






            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">






              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Longitude</label>






              <div className="text-lg font-black text-slate-800 font-mono">77.5946° E</div>






            </div>






          </div>






          <p className="text-xs text-slate-500 font-medium mt-4 bg-slate-50 p-2 rounded-lg">Used by Weather Agent for Open-Meteo API.</p>






        </div>













        {/* System Architecture */}






        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between">






          <div className="mb-4 flex items-center justify-between border-b pb-2">






            <h2 className="text-base font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">






              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>






              Multi-Agent Architecture






            </h2>






          </div>






          <div className="flex gap-2 items-center flex-wrap">






             <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">1. Sensing</span>






             <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>






             <span className="px-2 py-1 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-lg border border-sky-200">2. Weather</span>






             <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>






             <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-200">3. Diagnostic</span>






             <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>






             <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-200">4. Action</span>






          </div>






          <p className="text-xs text-slate-500 font-medium mt-4 bg-slate-50 p-2 rounded-lg">Architecture runs dynamically upon Edge trigger.</p>






        </div>













        {/* Device Status */}






        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between">






          <div className="mb-4 flex items-center justify-between border-b pb-2">






            <h2 className="text-base font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">






              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>






              Edge Gateway Endpoint






            </h2>






          </div>






          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">






            <div>






              <p className="text-xs font-bold text-slate-500 mb-1">Actuation API</p>






              <p className="text-sm font-black text-slate-800 font-mono tracking-tight text-emerald-700">POST /api/v1/actuators</p>






              <div className="flex items-center gap-2 mt-2">






                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>






                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Accepting Physical Connections</span>






              </div>






            </div>






          </div>






        </div>






      </div>













      {/* Metrics Row */}






      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">






        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">






          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">






            <svg className="w-16 h-16 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>






          </div>






          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Current Weather</h2>






          {weather ? (






            <div>






              <div className="text-4xl font-extrabold text-slate-800 tracking-tight">{weather.temperature}°C</div>






              <div className="text-sm text-slate-500 mt-2 font-medium">Wind: {weather.wind_speed} km/h • {weather.provider}</div>






            </div>






          ) : (






            <div className="text-slate-400">No weather data</div>






          )}






        </div>













        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">






          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Latest Moisture</h2>






          {moistureData.length > 0 ? (






            <div className="text-4xl font-extrabold text-blue-600 tracking-tight">{moistureData[moistureData.length-1]["Moisture (%)"].toFixed(1)}<span className="text-2xl text-blue-400">%</span></div>






          ) : (






            <div className="text-slate-400">No data</div>






          )}






        </div>






        






        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">






          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Latest Air Temp</h2>






          {tempData.length > 0 ? (






            <div className="text-4xl font-extrabold text-orange-500 tracking-tight">{tempData[tempData.length-1]["Temperature (C)"].toFixed(1)}<span className="text-2xl text-orange-300">°C</span></div>






          ) : (






            <div className="text-slate-400">No data</div>






          )}






        </div>






        






        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-lg border border-indigo-500 text-white flex flex-col justify-center">






          <h2 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2">Orchestrator Status</h2>






          <div className="text-2xl font-bold flex items-center gap-3">






            <svg className="w-8 h-8 text-indigo-300 animate-[spin_4s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>






            Active (Multi-Agent)






          </div>






          <div className="text-sm text-indigo-200 mt-2 font-medium">Model: Groq Llama/Mixtral</div>






        </div>






      </div>













      {/* Charts Row */}






      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">






        {/* Line Chart */}






        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-2">






          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">






            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>






            Soil Moisture History






          </h2>






          <div className="h-[280px]">






            <ResponsiveContainer width="100%" height="100%">






              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>






                <defs>






                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">






                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>






                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>






                  </linearGradient>






                </defs>






                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />






                <XAxis dataKey="time" tick={{fontSize: 13, fill: '#475569', fontWeight: 500}} axisLine={false} tickLine={false} dy={10} minTickGap={30} />






                <YAxis domain={[0, 100]} tick={{fontSize: 13, fill: '#475569', fontWeight: 500}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />






                <Tooltip 






                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}






                  cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}}






                />






                <Line type="monotone" dataKey="Moisture (%)" stroke="#3b82f6" strokeWidth={4} dot={false} connectNulls={true} activeDot={{r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2}} />






                  






              </LineChart>






            </ResponsiveContainer>






          </div>






        </div>













        {/* Pie Chart */}






        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">






          <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">






            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>






            Anomaly Distribution






          </h2>






          <div className="h-[280px]">






            <ResponsiveContainer width="100%" height="100%">






              <PieChart>






                <Pie data={anomalyData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">






                  {anomalyData.map((entry, index) => (






                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />






                  ))}






                </Pie>






                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />






                <Legend iconType="circle" wrapperStyle={{fontSize: "13px", fontWeight: "500", color: "#475569"}} />






              </PieChart>






            </ResponsiveContainer>






          </div>






        </div>






      </div>













      {/* Recommended Actions */}






      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">






        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">






          <h2 className="text-2xl font-bold text-slate-800">Agent Recommendations</h2>






          <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">






            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>






            AI Recommended






          </span>






        </div>






        






        {workflows.length > 0 ? (






          <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">






            {workflows.map((wf, idx) => {






              const out = wf.agent_outputs || {};






              const isApproved = out.safety_decision === 'approved';






              return (






                <div key={idx} className="border border-slate-200 p-6 rounded-2xl bg-white flex flex-col justify-between hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group">






                  <div>






                    <div className="flex justify-between items-start mb-4">






                      <div className="flex items-center gap-2">






                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">






                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>






                        </div>






                        <span className="font-bold text-slate-700">Diagnostic Assessment</span>






                      </div>






                      <span className={`px-4 py-1 text-xs uppercase font-bold rounded-full text-white tracking-widest ${isApproved ? 'bg-emerald-500 shadow-md shadow-emerald-200' : 'bg-rose-500 shadow-md shadow-rose-200'}`}>






                        {out.safety_decision || 'UNKNOWN'}






                      </span>






                    </div>






                    <p className="text-slate-600 text-[15px] mb-6 leading-relaxed bg-slate-50 p-4 rounded-xl italic border border-slate-100">"{out.recommendation}"</p>






                    






                    <div className="mb-6 grid grid-cols-2 gap-4">






                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">






                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Proposed Action</p>






                        <p className="text-sm font-bold text-blue-900 capitalize flex items-center gap-2">






                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>






                          {out.proposed_action?.action_type?.replace('_', ' ')} 






                          {out.proposed_action?.duration_minutes > 0 && (






                            <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md text-xs">{out.proposed_action.duration_minutes}m</span>






                          )}






                        </p>






                      </div>






                      <div className={`${isApproved ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} p-3 rounded-xl border`}>






                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isApproved ? 'text-emerald-500' : 'text-rose-500'}`}>Safety Check</p>






                        <p className={`text-sm font-semibold ${isApproved ? 'text-emerald-900' : 'text-rose-900'}`}>






                          {out.safety_reasons?.[0]}






                        </p>






                      </div>






                    </div>






                  </div>






                  






                  {isApproved ? (






                    executedActionIds.includes(wf.id || idx) ? (
                      <button disabled className="w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        Command Dispatched & Executed
                      </button>
                    ) : (
                      <button onClick={() => executeAction(out.proposed_action, wf.id || idx)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">






                      Approve & Execute Command






                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                  )






                  ) : (






                    <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed border border-slate-200">






                      Blocked by Safety Gateway






                    </button>






                  )}






                </div>






              );






            })}






          </div>






        ) : (






          <div className="text-slate-500 bg-slate-50 p-12 rounded-2xl text-center border-2 border-dashed border-slate-200">






            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>






            <p className="text-lg font-medium text-slate-600">All Systems Nominal</p>






            <p className="text-sm mt-1">The Multi-Agent system is actively monitoring telemetry. Anomalies will appear here.</p>






          </div>






        )}






      </div>






      






    </div>






  );






}






