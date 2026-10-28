import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8003/api/v1';

export default function DataLake() {
  const [lakeStatus, setLakeStatus] = useState<any>(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState<any>(null);
  const [inspectedObject, setInspectedObject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/cold-storage/status`);
      setLakeStatus(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleArchiveTelemetry = async () => {
    setArchiving(true);
    setArchiveResult(null);
    try {
      const res = await axios.post(`${API_URL}/cold-storage/archive-telemetry?limit=50`);
      setArchiveResult(res.data);
      fetchStatus();
    } catch (err: any) {
      alert("Failed to archive telemetry: " + (err.response?.data?.detail || err.message));
    } finally {
      setArchiving(false);
    }
  };

  const handleInspectLatest = async () => {
    if (!lakeStatus?.latest_archived_uri || lakeStatus.latest_archived_uri.includes("pending")) {
      alert("No archived objects available yet.");
      return;
    }
    const s3Uri = lakeStatus.latest_archived_uri;
    const s3Key = s3Uri.replace(`s3://${lakeStatus.bucket_name}/`, '');
    try {
      const res = await axios.get(`${API_URL}/cold-storage/inspect?s3_key=${encodeURIComponent(s3Key)}`);
      setInspectedObject(res.data);
    } catch (err: any) {
      alert("Could not load S3 object: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500 font-medium">Connecting to S3 Cold Storage Lake...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto relative bg-slate-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">S3 Cold Storage Data Lake</h1>
              <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Tiered Cloud Architecture</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Decoupled analytical storage adhering to the Cloud Well-Architected Framework</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleArchiveTelemetry}
            disabled={archiving}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            {archiving ? "Archiving Batch..." : "Archive Telemetry to S3 Lake"}
          </button>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-b md:border-b-0 md:border-r border-slate-700 pb-4 md:pb-0 md:pr-6">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">Hot Storage Tier</span>
            <h3 className="text-xl font-bold mt-1 text-slate-100">PostgreSQL</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Real-time operational queries, edge telemetry ingestion, and live dashboard graphs. Kept lean to avoid latency degradation.
            </p>
          </div>

          <div className="border-b md:border-b-0 md:border-r border-slate-700 pb-4 md:pb-0 md:pr-6">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">Cold Storage Tier</span>
            <h3 className="text-xl font-bold mt-1 text-slate-100">S3-Compatible Object Store</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Canonical bucket: <code className="text-cyan-300 font-mono">s3://{lakeStatus?.bucket_name || 'agentflow-cold-lake'}</code>.
              Stores partitioned JSON snapshots for long-term audit & analytical training.
            </p>
          </div>

          <div>
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">Data Governance</span>
            <h3 className="text-xl font-bold mt-1 text-slate-100">WORM & SHA-256</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Write Once, Read Many compliance. Every AI diagnostic decision is stamped with a cryptographic SHA-256 checksum for legal traceability.
            </p>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lake Status</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="text-2xl font-black text-slate-800">{lakeStatus?.status || 'ONLINE'}</div>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Tier: S3 Object Storage</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archived AI Decisions</span>
          <div className="text-3xl font-black text-cyan-600 mt-2">{lakeStatus?.total_archived_decisions ?? 0}</div>
          <span className="text-xs text-slate-400 mt-1 block">Immutable audit logs in S3</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telemetry Batches</span>
          <div className="text-3xl font-black text-blue-600 mt-2">{lakeStatus?.total_telemetry_batches ?? 0}</div>
          <span className="text-xs text-slate-400 mt-1 block">Cold parquet/JSON batches</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canonical Bucket</span>
          <div className="text-lg font-mono font-bold text-slate-800 truncate mt-2">{lakeStatus?.bucket_name}</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Auto-partitioned (year/month/day)</span>
        </div>
      </div>

      {/* Latest Archive Status Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Archived S3 Object</div>
            <code className="text-sm font-mono font-bold text-slate-800">{lakeStatus?.latest_archived_uri}</code>
          </div>
        </div>
        <button
          onClick={handleInspectLatest}
          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          Inspect S3 JSON Payload
        </button>
      </div>

      {/* Batch Archival Alert Feedback */}
      {archiveResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div>
            <span className="font-bold">✓ Lifecycle Event Triggered:</span> {archiveResult.message}
            <div className="text-xs font-mono text-emerald-700 mt-1">URI: {archiveResult.archive_details?.s3_uri} (SHA256: {archiveResult.archive_details?.checksum?.slice(0, 16)}...)</div>
          </div>
          <button onClick={() => setArchiveResult(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
        </div>
      )}

      {/* S3 JSON Inspector Modal / Card */}
      {inspectedObject && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl relative">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h3 className="font-mono text-sm font-bold text-cyan-300">S3 Object Payload Inspector (JSON)</h3>
            </div>
            <button
              onClick={() => setInspectedObject(null)}
              className="text-slate-400 hover:text-white font-bold text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 p-4 bg-black/40 rounded-xl border border-slate-800/80">
            {JSON.stringify(inspectedObject, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
