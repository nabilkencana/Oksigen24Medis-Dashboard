'use client';

import React from 'react';

interface ChartDataItem {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: ChartDataItem[];
  height?: number;
  color?: string;
  gridLines?: boolean;
}

export function AreaChart({ data, height = 200, color = '#3b82f6', gridLines = true }: AreaChartProps) {
  if (data.length === 0) return null;

  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height;

  const maxVal = Math.max(...data.map(d => d.value), 100);
  const minVal = 0;
  const range = maxVal - minVal;

  // Map values to coordinates
  const points = data.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
    const y = chartHeight - padding - ((d.value - minVal) * (chartHeight - padding * 2)) / range;
    return { x, y, label: d.label, value: d.value };
  });

  // SVG path construction
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  // Generate grid values (e.g. 4 divisions)
  const gridSteps = 4;
  const gridVals = Array.from({ length: gridSteps + 1 }, (_, i) => {
    return Math.round(minVal + (range * i) / gridSteps);
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {gridLines &&
          gridVals.map((v, i) => {
            const y = chartHeight - padding - (i * (chartHeight - padding * 2)) / gridSteps;
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeDasharray="4 4"
                  className="text-foreground"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="500"
                  className="fill-muted-foreground font-sans"
                >
                  {v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                </text>
              </g>
            );
          })}

        {/* X Axis Labels */}
        {points.map((p, i) => {
          // Show every 2nd label if there are too many to avoid crowding
          if (data.length > 8 && i % 2 !== 0) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={chartHeight - padding + 18}
              textAnchor="middle"
              fontSize="9"
              fontWeight="500"
              className="fill-muted-foreground font-sans"
            >
              {p.label}
            </text>
          );
        })}

        {/* Filled Area */}
        {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

        {/* Line */}
        {linePath && <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
              className="transition-all duration-150 hover:r-5 dark:stroke-zinc-950"
            />
            {/* Simple SVG tooltip overlay on hover */}
            <title>{`${p.label}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.value)}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: ChartDataItem[];
  height?: number;
  color?: string;
  colors?: string[];
  isRupiah?: boolean;
}

export function BarChart({ data, height = 200, color = '#10b981', colors, isRupiah = false }: BarChartProps) {
  if (data.length === 0) return null;

  const padding = 55; // Increase padding to accommodate Rupiah labels
  const chartWidth = 500;
  const chartHeight = height;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const minVal = 0;
  const range = maxVal - minVal;

  const barWidth = Math.max(12, (chartWidth - padding * 2) / data.length - 16);

  // Generate grid values
  const gridSteps = 4;
  const gridVals = Array.from({ length: gridSteps + 1 }, (_, i) => {
    return Math.round(minVal + (range * i) / gridSteps);
  });

  const formatValue = (v: number) => {
    if (isRupiah) {
      if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1)} jt`;
      if (v >= 1000) return `Rp ${(v / 1000).toFixed(0)} rb`;
      return `Rp ${v}`;
    }
    return String(v);
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
        {/* Grid Lines */}
        {gridVals.map((v, i) => {
          const y = chartHeight - padding - (i * (chartHeight - padding * 2)) / gridSteps;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
                className="text-foreground"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fontWeight="500"
                className="fill-muted-foreground font-sans"
              >
                {formatValue(v)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, index) => {
          const x = padding + (index * (chartWidth - padding * 2)) / data.length + 10;
          const y = chartHeight - padding - ((d.value - minVal) * (chartHeight - padding * 2)) / range;
          const barHeight = chartHeight - padding - y;
          const barColor = colors ? colors[index % colors.length] : color;

          return (
            <g key={index} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                fill={barColor}
                opacity="0.85"
                className="transition-all duration-150 hover:opacity-100"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - padding + 18}
                textAnchor="middle"
                fontSize="9"
                fontWeight="500"
                className="fill-muted-foreground font-sans"
              >
                {d.label}
              </text>
              <title>{`${d.label}: ${isRupiah ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(d.value) : `${d.value} unit`}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface DonutChartProps {
  data: ChartDataItem[];
  colors?: string[];
}

export function DonutChart({
  data,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280']
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  let accumulatedAngle = 0;

  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const center = 80;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.05} strokeWidth={strokeWidth} />
          {data.map((d, i) => {
            if (d.value === 0 || total === 0) return null;
            const percentage = d.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += percentage * circumference;

            const color = colors[i % colors.length];

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{total.toLocaleString('id-ID')}</span>
          <span className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">Total</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 max-w-[200px]">
        {data.map((d, i) => {
          const color = colors[i % colors.length];
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : '0';
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground truncate w-24" title={d.label}>{d.label}</span>
              <span className="font-semibold text-right w-10">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
