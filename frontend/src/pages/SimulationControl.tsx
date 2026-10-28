import React, { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

export default function SimulationControl() {
  const [scenario, setScenario] = useState('normal');
  const [status, setStatus] = useState<string | null>(null);

  const startSim = async () => {
    try {
      await axios.post(`${API_URL}/telemetry/simulation/start`, {
        action: 'start',
        farm_id: 1,
        zone_id: 1,
        scenario: scenario,
        interval_seconds: 5
      });
      setStatus('Simulation Started: ' + scenario);
    } catch (err) {
      console.error(err);
      setStatus('Failed to start simulation');
    }
  };

  const stopSim = async () => {
    try {
      await axios.post(`${API_URL}/telemetry/simulation/stop`);
      setStatus('Simulation Stopped');
    } catch (err) {
      console.error(err);
      setStatus('Failed to stop simulation');
    }
  };

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto relative bg-slate-50/50 min-h-[80vh] p-4 md:p-8">
      <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Simulation Control Engine</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Select Environment Scenario
          </h2>
          <div className="relative">
            <select 
              value={scenario} 
              onChange={(e) => setScenario(e.target.value)} 
              className="appearance-none w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-semibold text-lg py-4 px-5 rounded-2xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="normal">Normal Conditions (Safe bounds)</option>
              <option value="gradually_decreasing_moisture">Drought: Gradually Decreasing Moisture</option>
              <option value="rapidly_decreasing_moisture">Heatwave: Rapidly Decreasing Moisture</option>
              <option value="high_temperature">Heatwave: High Temperature Spike</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-slate-500">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Selecting an extreme scenario will trigger the Multi-Agent anomaly pipeline on the dashboard.</p>
        </div>
        
        <div className="flex gap-4 border-t border-slate-100 pt-8 mt-4">
          <button 
            onClick={startSim} 
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Engage Simulator
          </button>
          
          <button 
            onClick={stopSim} 
            className="bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
            Halt
          </button>
        </div>

        {status && (
          <div className="mt-8 bg-slate-800 text-emerald-400 p-4 rounded-xl border border-slate-700 flex items-center gap-3 shadow-inner">
            <svg className="w-5 h-5 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span className="font-semibold tracking-wide">{status}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
           <div className="bg-sky-100 p-3 rounded-full text-sky-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <div>
             <h3 className="text-slate-800 font-bold mb-1">How Simulation Works</h3>
             <p className="text-sm text-slate-500 leading-relaxed">The simulation engine spawns a background asyncio task in the FastAPI backend that generates synthetic sensor telemetry every 5 seconds and pumps it through the same HTTP `POST /api/v1/telemetry` endpoint that physical Edge Devices use.</p>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
           <div className="bg-amber-100 p-3 rounded-full text-amber-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
           </div>
           <div>
             <h3 className="text-slate-800 font-bold mb-1">Testing the LangGraph Agents</h3>
             <p className="text-sm text-slate-500 leading-relaxed">To test the AI logic, switch to a drought or heatwave scenario. The edge processor will detect the threshold breach and immediately invoke the LangGraph Diagnostic and Action agents.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
