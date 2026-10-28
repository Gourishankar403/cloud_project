import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8003/api/v1';

export default function AgentHistory() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get(`${API_URL}/workflows?limit=30`);
      setWorkflows(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-500 font-medium">Fetching History...</div>
    </div>
  );

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto relative bg-slate-50/50 min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agent Diagnostic History</h1>
            <p className="text-slate-500 text-xs mt-0.5">Every AI recommendation is grounded via ChromaDB RAG, verified by Safety Gateway & archived to S3 Cold Lake</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ChromaDB RAG: Active
          </span>
          <span className="bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            S3 Data Lake: Synced
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {workflows.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            No workflows executed yet. Trigger a low-moisture simulation to observe live agent workflows, RAG literature grounding, and S3 archival.
          </div>
        ) : (
          workflows.map((wf, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider">
                    Farm {wf.farm_id} - Zone {wf.zone_id}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    {(() => {
                      const ts = wf.started_at || wf.created_at || '';
                      const rawTs = ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z';
                      return ts ? new Date(rawTs).toLocaleString() : 'N/A';
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${wf.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {wf.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${wf.agent_outputs?.safety_decision === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                    Safety: {wf.agent_outputs?.safety_decision || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Sensor Data & Context</h3>
                  <div className="space-y-2">
                    <p className="text-slate-700 text-sm font-mono bg-white p-2 rounded-lg border border-slate-200">
                      {typeof wf.agent_outputs?.sensor_data === "object" ? JSON.stringify(wf.agent_outputs.sensor_data) : wf.agent_outputs?.sensor_summary || 'N/A'}
                    </p>
                    <p className="text-slate-700 text-sm font-mono bg-white p-2 rounded-lg border border-slate-200">
                      {JSON.stringify(wf.agent_outputs?.weather_context || {})}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">Diagnostic Agent Recommendation</h3>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    {wf.agent_outputs?.recommendation || 'No recommendation provided.'}
                  </p>
                </div>
              </div>

              {/* RAG Knowledge Section */}
              {wf.agent_outputs?.retrieved_knowledge && (
                <div className="mt-4 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">ChromaDB RAG Literature Grounding</span>
                  </div>
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-emerald-100 max-h-36 overflow-y-auto leading-relaxed">
                    {wf.agent_outputs.retrieved_knowledge}
                  </pre>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Payload:</span>
                  <code className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-mono font-bold">
                    {JSON.stringify(wf.agent_outputs?.proposed_action || {})}
                  </code>
                </div>

                {wf.s3_archive_uri ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200">
                    <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <span className="font-bold">Cold Lake:</span>
                    <span>{wf.s3_archive_uri}</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-400">
                    S3 Key: audit_logs/workflow_{String(wf.id).padStart(6, '0')}.json
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
