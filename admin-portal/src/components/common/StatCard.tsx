import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'purple' | 'emerald' | 'amber' | 'rose' | 'blue';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
}: StatCardProps) {
  const colorMap = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex flex-col justify-between space-y-2.5 sm:space-y-4 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight">
          {title}
        </span>
        <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${colorMap[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xl sm:text-3xl font-black text-white tracking-tight truncate">{value}</div>
        <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-bold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
