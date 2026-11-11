"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/api";
import { Icon } from "./ui";

export function GrowthChart({ growth }: { growth: DashboardData["growth"] }) {
  const [period, setPeriod] = useState("6");
  const [active, setActive] = useState<number | null>(null);
  const data = period === "3" ? growth.slice(-3) : growth;
  const x = (i: number) => 89 + i * (534 / Math.max(data.length - 1, 1));
  const y = (value: number) => 150 - value * 2.4;
  const line = data
    .map((point, i) => `${x(i)},${y(point.referrals)}`)
    .join(" ");
  return (
    <section className="panel growth-panel" aria-labelledby="growth-title">
      <div className="panel-heading">
        <h2 id="growth-title">
          <Icon name="badge" className="purple" />
          Referral &amp; Commission Growth
        </h2>
        <label className="period-select">
          <span className="sr-only">Chart period</span>
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setActive(null);
            }}
          >
            <option value="6">Last 6 Months</option>
            <option value="3">Last 3 Months</option>
          </select>
          <Icon name="chevron" size={15} />
        </label>
      </div>
      <div className="chart-legend">
        <span>
          <i />
          Referrals
        </span>
        <span>
          <i />
          Commission (USD)
        </span>
      </div>
      <div className="chart-wrap">
        <svg
          viewBox="0 15 748 163"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Referral and commission growth over the last ${period} months. ${data.map((d) => `${d.month}: ${d.referrals} referrals, $${d.commission}`).join("; ")}`}
        >
          <defs>
            <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8863ff" stopOpacity=".95" />
              <stop offset="100%" stopColor="#5351dd" stopOpacity=".3" />
            </linearGradient>
            <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d8f7" stopOpacity=".1" />
              <stop offset="100%" stopColor="#00d8f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 10, 20, 30, 40, 50].map((value) => (
            <g key={value}>
              <line
                x1="25"
                x2="684"
                y1={y(value)}
                y2={y(value)}
                stroke="#28465d"
              />
              <text x="12" y={y(value) + 4} textAnchor="end">
                {value}
              </text>
              <text x="698" y={y(value) + 4}>
                {value === 0
                  ? "$0"
                  : `$${(value * 50).toLocaleString("en-US")}`}
              </text>
            </g>
          ))}
          <polygon
            points={`${x(0)},150 ${line} ${x(data.length - 1)},150`}
            fill="url(#area-fill)"
          />
          {data.map((point, i) => (
            <g key={point.month}>
              <rect
                x={x(i) - 29}
                y={y(point.commission / 50)}
                width="58"
                height={150 - y(point.commission / 50)}
                rx="5"
                fill="url(#bar-fill)"
                stroke="#9177ff"
                strokeOpacity=".75"
              />
              <text x={x(i)} y="171" textAnchor="middle">
                {point.month}
              </text>
            </g>
          ))}
          <polyline
            points={line}
            fill="none"
            stroke="#00e5ff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {data.map((point, i) => (
            <g
              key={point.month}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <circle
                cx={x(i)}
                cy={y(point.referrals)}
                r="4.4"
                fill="#00c9ff"
                stroke="white"
                strokeWidth="2"
              />
              <rect
                x={x(i) - 35}
                y="20"
                width="70"
                height="134"
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${point.month}: ${point.referrals} referrals, $${point.commission}`}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(active === i ? null : i);
                  }
                }}
              />
            </g>
          ))}
        </svg>
        {active !== null && (
          <div className="chart-tooltip" role="status">
            <strong>{data[active].month}</strong>
            <span>{data[active].referrals} referrals</span>
            <span>
              ${data[active].commission.toLocaleString("en-US")} commission
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
