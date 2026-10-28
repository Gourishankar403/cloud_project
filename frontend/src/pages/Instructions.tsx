import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

export default function Instructions() {
  const [payloads, setPayloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayloads();
    const interval = setInterval(fetchPayloads, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchPayloads = async () => {
    try {
      const res = await axios.get(`${API_URL}/workflows?limit=10`);
      
      // Filter for approved workflows to simulate edge transmission
      const approvedWorkflows = res.data.filter((wf: any) => 
        wf.agent_outputs && wf.agent_outputs.safety_decision === 'approved'
      );

      // Map to edge device payload format
      const mappedPayloads = approvedWorkflows.map((wf: any) => ({
        timestamp: wf.created_at,
        edge_device_id: 'esp32-field-sensor-1',
        protocol: 'HTTP',
        topic: 'farm/zone1/actuators',
        payload: {
          command_id: `CMD-${wf.id}`,
          action: wf.agent_outputs.proposed_action?.action_type || 'idle',
          duration_m: wf.agent_outputs.proposed_action?.duration_minutes || 0,
          qty: wf.agent_outputs.proposed_action?.quantity || 0,
          safety_override: false
        }
      }));

      setPayloads(mappedPayloads);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-500 font-medium">Fetching Edge Payloads...</div>
    </div>
  );

  return (
    <div className="space-y-8 w-full max-w-[1200px] mx-auto relative bg-slate-50/50 min-h-screen pb-12">
      <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-6 pt-4">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edge Device Instructions Queue</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Transmitted JSON Payloads</h2>
            <p className="text-sm text-slate-500">This log simulates the raw MQTT/HTTP JSON payloads parsed and executed by the physical edge microcontrollers.</p>
          </div>
          <div className="bg-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Syncing
          </div>
        </div>

        {payloads.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No approved instructions transmitted yet.
          </div>
        ) : (
          <div className="space-y-6">
            {payloads.map((item, idx) => (
              <div key={idx} className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-xs">POST /api/v1/actuators/esp32-field-sensor-1</span>
                  </div>
                  <span className="text-slate-500 font-mono text-xs">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
