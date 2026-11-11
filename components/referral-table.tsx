"use client";

import type { Referral } from "@/lib/api";
import { Icon, Status } from "./ui";

export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
export const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function ReferralTable({
  referrals,
  onSelect,
  compact = false,
}: {
  referrals: Referral[];
  onSelect: (referral: Referral) => void;
  compact?: boolean;
}) {
  return (
    <div className={`referral-table-wrap ${compact ? "compact-table" : ""}`}>
      <table className="referral-table">
        <thead>
          <tr>
            <th>Business / Organization</th>
            <th className="date-cell">Referred On</th>
            <th>Status</th>
            <th>Commission</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((referral, index) => (
            <tr
              key={referral.id}
              className={
                compact && (index === 2 || index === 4)
                  ? "mobile-extra-row"
                  : ""
              }
            >
              <td>
                <button
                  className="business-cell"
                  onClick={() => onSelect(referral)}
                >
                  <span className={`initials initials-${index % 4}`}>
                    {referral.initials}
                  </span>
                  <span>
                    <strong>{referral.name}</strong>
                    <small>{referral.location}</small>
                  </span>
                </button>
              </td>
              <td className="date-cell">{dateLabel(referral.date)}</td>
              <td>
                <Status status={referral.status} />
              </td>
              <td className="commission-cell">
                {referral.commission === null
                  ? "—"
                  : `${money(referral.commission)}${referral.status === "Pending" ? " (est.)" : ""}`}
              </td>
              <td>
                <button
                  className="row-action"
                  aria-label={`View ${referral.name}`}
                  onClick={() => onSelect(referral)}
                >
                  <Icon name="more" size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {referrals.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={28} />
          <p>No referrals match your search.</p>
        </div>
      )}
    </div>
  );
}
