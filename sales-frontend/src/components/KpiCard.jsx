import React from 'react';

const gradients = {
  indigo: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  emerald: 'linear-gradient(135deg, #10b981, #059669)',
  amber: 'linear-gradient(135deg, #f59e0b, #d97706)',
  rose: 'linear-gradient(135deg, #ef4444, #ec4899)',
};

const glows = {
  indigo: 'rgba(99,102,241,0.45)',
  emerald: 'rgba(16,185,129,0.45)',
  amber: 'rgba(245,158,11,0.45)',
  rose: 'rgba(239,68,68,0.45)',
};

export default function KpiCard({ title, value, subtitle, icon, color }) {
  return (
    <div
      className="glass glass-hover p-5 flex items-center gap-4"
    >
      {/* Icon bubble */}
      <div
        className="rounded-2xl p-3 flex-shrink-0"
        style={{
          background: gradients[color] || gradients.indigo,
          boxShadow: `0 0 20px ${glows[color] || glows.indigo}`,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-xs text-white/50 font-semibold uppercase tracking-widest truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-white mt-0.5 truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-white/40 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
