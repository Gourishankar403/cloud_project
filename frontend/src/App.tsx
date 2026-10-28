import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SimulationControl from './pages/SimulationControl';
import Device from './pages/Device';
import Instructions from './pages/Instructions';
import AgentHistory from './pages/AgentHistory';
import DataLake from './pages/DataLake';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
        {/* Top Navbar */}
        <header className="bg-slate-900 text-white grid grid-cols-3 items-center px-8 py-4 shadow-lg border-b border-slate-800">
          <div className="text-2xl font-black tracking-tight flex items-center gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            AgentFlow<span className="text-emerald-400 font-medium">Cloud</span>
          </div>
          
          <nav className="flex space-x-6 justify-center">
            <Link to="/" className="hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Dashboard</Link>
            <Link to="/device" className="hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Devices</Link>
            <Link to="/simulation" className="hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Simulation</Link>
            <Link to="/history" className="hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-300 transition-colors">Agent History</Link>
            <Link to="/data-lake" className="hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold text-cyan-400 transition-colors">S3 Cold Lake</Link>
            <Link to="/instructions" className="hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-400 transition-colors">Edge Payloads</Link>
          </nav>

          <div className="flex justify-end items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Live
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/device" element={<Device />} />
            <Route path="/simulation" element={<SimulationControl />} />
            <Route path="/history" element={<AgentHistory />} />
            <Route path="/data-lake" element={<DataLake />} />
            <Route path="/instructions" element={<Instructions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
