import React, { useState } from 'react';

export default function Device() {
  const [endpointName, setEndpointName] = useState<string>("esp32-field-sensor-1");
  const [status, setStatus] = useState<string>("Disconnected");

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto relative bg-slate-50/50 min-h-[80vh] p-4 md:p-8">
      <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Device Management</h1>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Connect New Endpoint
        </h2>
        
        <div className="space-y-6 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Device Endpoint ID</label>
            <input 
              type="text" 
              value={endpointName} 
              onChange={(e) => setEndpointName(e.target.value)} 
              className="appearance-none w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold text-lg py-3 px-4 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors" 
              placeholder="e.g., esp32-node-a"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Connection Protocol</label>
            <div className="relative">
              <select className="appearance-none w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold text-lg py-3 px-4 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors cursor-pointer">
                <option>HTTP (REST API) - Port 8003</option>
                <option>MQTT (Port 1883) - Coming Soon</option>
                <option>CoAP - Coming Soon</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={() => {
                setStatus("Establishing Handshake...");
                setTimeout(() => setStatus("Connected (Waiting for telemetry stream)"), 1500);
              }} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              Register & Connect Device
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Active Devices
        </h2>
        <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.includes('Connected') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            </div>
            <div>
              <p className="font-black text-lg text-slate-800 tracking-tight">{endpointName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white border text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">HTTP</span>
                <span className="bg-white border text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Zone 1</span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.includes('Connected') ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100 border border-slate-200'}`}>
              {status.includes('Connected') && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
              <p className={`font-bold text-sm ${status.includes('Connected') ? 'text-emerald-700' : 'text-slate-500'}`}>
                {status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
