import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, Layers, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/dashboard?timeframe=all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const salesTrend = data?.salesTrend || [];

  const categoryDistribution = [
    { name: 'Oversized Tees', value: 45, color: '#10b981' },
    { name: 'Printed Tees', value: 25, color: '#06b6d4' },
    { name: 'Birthday Hampers', value: 35, color: '#f59e0b' },
    { name: 'Couple Keepsakes', value: 20, color: '#ec4899' },
    { name: 'Custom Tees', value: 15, color: '#8b5cf6' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black font-syne text-zinc-900 dark:text-white tracking-tight">Business Analytics &amp; Trends</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Deep breakdown of sales momentum, order size distribution, and product categories.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Bars */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <h3 className="font-syne font-bold text-base text-zinc-900 dark:text-white">Revenue Momentum</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend}>
                  <XAxis dataKey="order_date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', color: '#18181b', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#18181b" radius={[6, 6, 0, 0]} className="dark:fill-white" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <h3 className="font-syne font-bold text-base text-zinc-900 dark:text-white">Sales by Category</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', color: '#18181b', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {categoryDistribution.map((c) => (
                <span key={c.name} className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
