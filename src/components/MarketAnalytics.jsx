import React from 'react';
import { TrendingUp, BarChart3, CloudRain, PhoneCall, Building2, MapPin } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MarketAnalytics({ marketData }) {
  if (!marketData) return <div className="p-8 text-center text-slate-400">Loading government market data...</div>;

  const { agmarknet = [], nhb = [], pmfby = [], kcc = [] } = marketData;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Government & Market Data Layer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time feed from AGMARKNET 2.0, National Horticulture Board (NHB), PMFBY, and Kisan Call Centre (KCC).
          </p>
        </div>
        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
          Data.gov.in Synchronized
        </span>
      </div>

      {/* AGMARKNET Mandi Price Table & Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>AGMARKNET Mandi Price & Arrivals Stream</span>
          </h3>
        </div>

        {/* Price Chart */}
        <div className="h-64 w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agmarknet}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="commodity" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(value) => [`₹${value}`, 'Modal Price / Qtl']}
              />
              <Bar dataKey="modal_price" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mandi Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agmarknet.map((m, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">{m.commodity}</span>
                  <div className="text-sm font-bold text-white">{m.variety}</div>
                </div>
                <span className="text-xs text-slate-400">{m.district}</span>
              </div>
              <div className="my-1">
                <div className="text-xl font-extrabold text-white">₹{m.modal_price.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-400">Modal Mandi Price / {m.unit}</div>
              </div>
              <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
                <span>Arrivals: {m.arrivals_tonnes} MT</span>
                <span className="text-emerald-400">{m.mandi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NHB & PMFBY Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NHB Statistics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>NHB Horticulture District Yields</span>
          </h3>

          <div className="space-y-3">
            {nhb.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{item.district} ({item.crop})</span>
                  <span className="text-blue-400 font-semibold">{item.yield_benchmark_rating} Benchmark</span>
                </div>
                <div className="text-xs text-slate-400">
                  Avg Yield: <strong className="text-white">{item.avg_yield_mt_per_ha} MT/Ha</strong> | Annual Prod: {item.annual_production_mt.toLocaleString()} MT
                </div>
                <div className="text-xs text-slate-400">
                  Input Cost: ₹{item.input_cost_per_acre_inr}/acre | Exp Revenue: ₹{item.expected_gross_revenue_per_acre_inr}/acre
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kisan Call Centre (KCC) NLP Sentiment Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <span>Kisan Call Centre (KCC) NLP Analytics</span>
          </h3>

          <div className="space-y-3">
            {kcc.map((k, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{k.district} - {k.crop}</span>
                  <span className="text-amber-400 font-semibold">{k.query_volume_30d} Calls / Month</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">{k.top_query_category}</div>
                <div className="text-xs text-slate-400 italic">
                  "{k.advisory_status}"
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
