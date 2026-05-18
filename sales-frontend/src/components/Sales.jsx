import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement,
} from 'chart.js';
import KpiCard from './KpiCard';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
);

// ── Palette ───────────────────────────────────────────────────────────────────
const PALETTE = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171',
  '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf',
];

// ── Chart defaults (white text for dark bg) ───────────────────────────────────
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255,255,255,0.7)',
        boxWidth: 12,
        padding: 16,
        font: { size: 11 },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(15,12,41,0.9)',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.75)',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    },
  },
};

const scaleDefaults = {
  grid: { color: 'rgba(255,255,255,0.06)' },
  ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
};

const fmt = (n) =>
  n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + Number(n).toFixed(0);

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-white">{children}</h2>
      {sub && <p className="text-sm text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Glass chart card ──────────────────────────────────────────────────────────
function ChartCard({ title, children, span2 }) {
  return (
    <div className={`glass p-5 ${span2 ? 'lg:col-span-2' : ''}`}>
      <p className="text-sm font-semibold text-white/70 mb-4">{title}</p>
      <div className="h-64">{children}</div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="h-full flex flex-col justify-center gap-3 px-4">
      {[75, 50, 65, 40].map((w, i) => (
        <div key={i} className="skeleton-line h-3" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────
function Badge({ label }) {
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{
        background: 'rgba(99,102,241,0.2)',
        border: '1px solid rgba(99,102,241,0.35)',
        color: '#a5b4fc',
      }}
    >
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesTable() {
  const [salesData, setSalesData]         = useState([]);
  const [summary, setSummary]             = useState(null);
  const [topProducts, setTopProducts]     = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [categories, setCategories]       = useState([]);
  const [regions, setRegions]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterRegion, setFilterRegion]     = useState('');
  const [filterStart, setFilterStart]       = useState('');
  const [filterEnd, setFilterEnd]           = useState('');
  const [search, setSearch]                 = useState('');
  const [sortField, setSortField]           = useState('SaleDate');
  const [sortDir, setSortDir]               = useState('desc');
  const [page, setPage]                     = useState(1);
  const PAGE_SIZE = 8;

  // meta
  useEffect(() => {
    Promise.all([axios.get('/api/categories'), axios.get('/api/regions')])
      .then(([c, r]) => { setCategories(c.data); setRegions(r.data); })
      .catch(() => {});
  }, []);

  // summary + charts
  useEffect(() => {
    Promise.all([
      axios.get('/api/summary'),
      axios.get('/api/top-products?limit=5'),
      axios.get('/api/monthly-sales-data'),
    ]).then(([s, t, m]) => {
      setSummary(s.data);
      setTopProducts(t.data);

      const monthly = m.data;
      const grouped = monthly.reduce((acc, item) => {
        if (!acc[item.ProductName]) acc[item.ProductName] = [];
        acc[item.ProductName].push(item);
        return acc;
      }, {});
      const allMonths = [...new Set(monthly.map(i => i.Month))];
      setLineChartData({
        labels: allMonths,
        datasets: Object.keys(grouped).map((name, idx) => ({
          label: name,
          data: allMonths.map(mo => {
            const f = grouped[name].find(i => i.Month === mo);
            return f ? f.QuantitiesSold : 0;
          }),
          fill: false,
          borderColor: PALETTE[idx % PALETTE.length],
          backgroundColor: PALETTE[idx % PALETTE.length] + '22',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: PALETTE[idx % PALETTE.length],
          borderWidth: 2,
        })),
      });
    }).catch(() => {});
  }, []);

  // filtered sales
  const fetchSales = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filterCategory) params.category  = filterCategory;
    if (filterRegion)   params.region    = filterRegion;
    if (filterStart)    params.startDate = filterStart;
    if (filterEnd)      params.endDate   = filterEnd;

    axios.get('/api/sales-data', { params })
      .then(res => { setSalesData(res.data); setPage(1); })
      .catch(() => setError('Failed to load sales data. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [filterCategory, filterRegion, filterStart, filterEnd]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  // derived
  const filtered = salesData.filter(row =>
    [row.ProductName, row.Category, row.Region]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortField], vb = b[sortField];
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const SortIcon = ({ field }) =>
    sortField === field
      ? <span className="ml-1 text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
      : <span className="ml-1 text-white/20">↕</span>;

  // chart data
  const barData = {
    labels: topProducts.map(p => p.ProductName),
    datasets: [{
      label: 'Revenue',
      data: topProducts.map(p => p.totalRevenue),
      backgroundColor: PALETTE.slice(0, topProducts.length).map(c => c + 'cc'),
      borderColor: PALETTE.slice(0, topProducts.length),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const catMap = summary?.categoryBreakdown || [];
  const doughnutData = {
    labels: catMap.map(c => c.Category),
    datasets: [{
      data: catMap.map(c => c.revenue),
      backgroundColor: PALETTE.slice(0, catMap.length).map(c => c + 'bb'),
      borderColor: PALETTE.slice(0, catMap.length),
      borderWidth: 2,
    }],
  };

  const regionData = {
    labels: (summary?.regionBreakdown || []).map(r => r.Region),
    datasets: [{
      label: 'Revenue',
      data: (summary?.regionBreakdown || []).map(r => r.revenue),
      backgroundColor: PALETTE.slice(0, 6).map(c => c + 'bb'),
      borderColor: PALETTE.slice(0, 6),
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const hasFilters = filterCategory || filterRegion || filterStart || filterEnd || search;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="pb-20">

      {/* ── Hero strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-1">
          Analytics
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text leading-tight">
          Sales Performance
        </h1>
        <p className="text-white/50 text-sm mt-2">
          Real-time overview of revenue, products, and regional performance.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <SectionHeading>Overview</SectionHeading>
        {summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={`$${Number(summary.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${summary.totalTransactions} transactions`}
              color="indigo"
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <KpiCard
              title="Units Sold"
              value={Number(summary.totalUnitsSold).toLocaleString()}
              subtitle="across all products"
              color="emerald"
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <KpiCard
              title="Avg Order Value"
              value={`$${Number(summary.avgOrderValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtitle="per transaction"
              color="amber"
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
            <KpiCard
              title="Top Product"
              value={summary.topProduct?.ProductName || '—'}
              subtitle={summary.topProduct ? `$${Number(summary.topProduct.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}
              color="rose"
              icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass p-5 h-24">
                <div className="skeleton-line h-2.5 w-1/2 mb-3" />
                <div className="skeleton-line h-6 w-3/4" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Charts ── */}
      <section id="charts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <SectionHeading sub="Visual breakdown of revenue, categories, and trends">
          Charts
        </SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <ChartCard title="Top 5 Products by Revenue" span2>
            {topProducts.length > 0
              ? <Bar data={barData} options={{
                  ...chartDefaults,
                  plugins: { ...chartDefaults.plugins, legend: { display: false } },
                  scales: {
                    x: scaleDefaults,
                    y: { ...scaleDefaults, beginAtZero: true, ticks: { ...scaleDefaults.ticks, callback: fmt } },
                  },
                }} />
              : <Skeleton />}
          </ChartCard>

          <ChartCard title="Revenue by Category">
            {catMap.length > 0
              ? <Doughnut data={doughnutData} options={{ ...chartDefaults, cutout: '62%' }} />
              : <Skeleton />}
          </ChartCard>

          <ChartCard title="Monthly Units Sold by Product" span2>
            {lineChartData
              ? <Line data={lineChartData} options={{
                  ...chartDefaults,
                  scales: {
                    x: scaleDefaults,
                    y: { ...scaleDefaults, beginAtZero: true },
                  },
                }} />
              : <Skeleton />}
          </ChartCard>

          <ChartCard title="Revenue by Region">
            {summary?.regionBreakdown?.length > 0
              ? <Bar data={regionData} options={{
                  ...chartDefaults,
                  plugins: { ...chartDefaults.plugins, legend: { display: false } },
                  scales: {
                    x: scaleDefaults,
                    y: { ...scaleDefaults, beginAtZero: true, ticks: { ...scaleDefaults.ticks, callback: fmt } },
                  },
                }} />
              : <Skeleton />}
          </ChartCard>

        </div>
      </section>

      {/* ── Top Products ── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <SectionHeading sub="Ranked by total revenue">Top Selling Products</SectionHeading>
        <div className="glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#', 'Product', 'Category', 'Units', 'Revenue'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr
                  key={i}
                  className="glass-row transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <td className="px-5 py-3.5 font-bold text-white/30">{i + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-white">{p.ProductName}</td>
                  <td className="px-5 py-3.5"><Badge label={p.Category} /></td>
                  <td className="px-5 py-3.5 text-white/60">{p.totalUnits.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-bold text-white">
                    ${Number(p.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── All Sales ── */}
      <section id="table" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
          <SectionHeading sub="Filter, sort, and paginate all transactions">
            All Sales
          </SectionHeading>
          <span className="text-sm text-white/40 mb-5">{filtered.length} records</span>
        </div>

        {/* Filter bar */}
        <div className="glass p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

            {/* Search */}
            <div className="relative lg:col-span-2">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search product, category, region…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="glass-input w-full pl-9 pr-3 py-2 text-sm"
              />
            </div>

            {/* Category */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="glass-input text-sm px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Region */}
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              className="glass-input text-sm px-3 py-2"
            >
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Date range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={filterStart}
                onChange={e => setFilterStart(e.target.value)}
                className="glass-input w-full text-sm px-2 py-2"
              />
              <input
                type="date"
                value={filterEnd}
                onChange={e => setFilterEnd(e.target.value)}
                className="glass-input w-full text-sm px-2 py-2"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setFilterCategory(''); setFilterRegion('');
                setFilterStart(''); setFilterEnd(''); setSearch('');
              }}
              className="mt-3 text-xs font-medium transition-colors"
              style={{ color: '#a5b4fc' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c7d2fe'}
              onMouseLeave={e => e.currentTarget.style.color = '#a5b4fc'}
            >
              ✕ Clear all filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="glass overflow-hidden">
          {error ? (
            <div className="p-10 text-center text-red-400 text-sm">{error}</div>
          ) : loading ? (
            <div className="p-10 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-line h-4" style={{ width: `${85 - i * 8}%` }} />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-10 text-center text-white/30 text-sm">
              No records match your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {[
                        { label: 'Product',  field: 'ProductName' },
                        { label: 'Category', field: 'Category'    },
                        { label: 'Region',   field: 'Region'      },
                        { label: 'Qty',      field: 'Quantity'    },
                        { label: 'Price',    field: 'Price'       },
                        { label: 'Total',    field: 'TotalSales'  },
                        { label: 'Date',     field: 'SaleDate'    },
                      ].map(col => (
                        <th
                          key={col.field}
                          onClick={() => handleSort(col.field)}
                          className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          {col.label}<SortIcon field={col.field} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, i) => (
                      <tr
                        key={row.id ?? i}
                        className="glass-row transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-5 py-3.5 font-semibold text-white">{row.ProductName}</td>
                        <td className="px-5 py-3.5"><Badge label={row.Category} /></td>
                        <td className="px-5 py-3.5 text-white/60">{row.Region}</td>
                        <td className="px-5 py-3.5 text-white/60">{row.Quantity}</td>
                        <td className="px-5 py-3.5 text-white/60">${Number(row.Price).toFixed(2)}</td>
                        <td className="px-5 py-3.5 font-bold text-white">
                          ${Number(row.TotalSales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-3.5 text-white/40">{row.SaleDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className="flex items-center justify-between px-5 py-3.5 text-sm"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-white/40">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </span>
                <div className="flex gap-1">
                  <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</PagBtn>
                  {[...Array(totalPages)].map((_, i) => (
                    <PagBtn key={i} onClick={() => setPage(i + 1)} active={page === i + 1}>
                      {i + 1}
                    </PagBtn>
                  ))}
                  <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</PagBtn>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Pagination button ─────────────────────────────────────────────────────────
function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          : 'rgba(255,255,255,0.07)',
        border: active
          ? '1px solid rgba(99,102,241,0.5)'
          : '1px solid rgba(255,255,255,0.1)',
        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
        boxShadow: active ? '0 0 12px rgba(99,102,241,0.35)' : 'none',
      }}
    >
      {children}
    </button>
  );
}
