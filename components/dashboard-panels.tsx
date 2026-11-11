"use client";

import type { DashboardData, Referral } from "@/lib/api";
import { Brand, Icon } from "./ui";
import { ReferralTable } from "./referral-table";

export function TierPanel({
  tier,
  onBenefits,
}: {
  tier: DashboardData["tier"];
  onBenefits: () => void;
}) {
  return (
    <section className="panel tier-panel">
      <div className="panel-heading bordered">
        <h2>
          <Icon name="award" className="aqua" />
          Partner Tier &amp; Progress
        </h2>
        <button className="text-button" onClick={onBenefits}>
          Tier Benefits <span>→</span>
        </button>
      </div>
      <div className="tier-content">
        <div className="tier-summary">
          <div className="silver-medal">
            <Icon name="star" size={26} />
          </div>
          <div>
            <h3>{tier.name}</h3>
            <p>{tier.description}</p>
          </div>
          <strong className="tier-goal">{tier.progress}% to Gold</strong>
        </div>
        <div className="tier-progress">
          <div className="tier-track">
            <span style={{ width: "73%" }} />
          </div>
          {tier.milestones.map((milestone, index) => (
            <div className={`milestone milestone-${index}`} key={milestone}>
              <Icon name="star" size={29} />
              <span>{milestone}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReferralLink({
  user,
  onCopy,
  copied,
}: {
  user: DashboardData["user"];
  onCopy: (value: string, key: string) => void;
  copied: string;
}) {
  return (
    <section className="panel referral-link-panel">
      <div className="link-side">
        <div className="link-heading">
          <span className="round-link">
            <Icon name="link" size={28} />
          </span>
          <div>
            <h2>Your Referral Link</h2>
            <p>
              Share this unique link to refer businesses, teams, or clients to
              NXG Collective.
            </p>
          </div>
        </div>
        <div className="copy-row">
          <input
            aria-label="Your referral link"
            readOnly
            value={user.referralUrl}
          />
          <button
            className="button primary"
            onClick={() => onCopy(user.referralUrl, "link")}
          >
            <Icon name={copied === "link" ? "check" : "copy"} size={18} />
            {copied === "link" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <div className="code-side">
        <h3>
          <Icon name="bounty" className="cyan" />
          Referral Code
        </h3>
        <button
          className="code-copy"
          onClick={() => onCopy(user.referralCode, "code")}
          aria-label="Copy referral code"
        >
          {user.referralCode}
          <Icon name={copied === "code" ? "check" : "copy"} size={17} />
        </button>
      </div>
    </section>
  );
}

export function RecentReferrals({
  referrals,
  onSelect,
  onViewAll,
}: {
  referrals: Referral[];
  onSelect: (referral: Referral) => void;
  onViewAll: () => void;
}) {
  return (
    <section className="panel recent-panel">
      <div className="panel-heading">
        <h2>
          <Icon name="building" className="purple" />
          <span className="desktop-referral-title">
            Recent Referred Businesses
          </span>
          <span className="mobile-referral-title">Recent Referrals</span>
        </h2>
        <button className="text-button" onClick={onViewAll}>
          View All Referrals <span>→</span>
        </button>
      </div>
      <ReferralTable
        referrals={referrals.slice(0, 5)}
        onSelect={onSelect}
        compact
      />
    </section>
  );
}

export function MetricsPanel({
  metrics,
}: {
  metrics: DashboardData["metrics"];
}) {
  return (
    <section className="panel metrics-panel">
      <div className="panel-heading">
        <h2>
          <Icon name="activity" className="aqua" />
          Key Performance Metrics
        </h2>
      </div>
      <div className="metric-list">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <div className="metric-value">
              <strong>{metric.value}</strong>
              <div
                className="metric-track"
                role="meter"
                aria-label={metric.label}
                aria-valuenow={metric.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${metric.progress}%` }} />
              </div>
            </div>
            <small>{metric.target}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VerifiedBadge() {
  return (
    <div className="verified-badge">
      <Brand emblem />
      <div>
        <strong>NXG Collective</strong>
        <span>
          Verified Member <Icon name="badge" size={13} />
        </span>
      </div>
    </div>
  );
}

export function BadgePanel({
  badge,
  onShare,
}: {
  badge: DashboardData["badge"];
  onShare: () => void;
}) {
  return (
    <section className="panel badge-panel">
      <div className="badge-copy">
        <span className="verified-seal">
          <Icon name="check" size={26} />
        </span>
        <h2>{badge.title}</h2>
        <p>{badge.description}</p>
        <button className="button primary" onClick={onShare}>
          Get Badge &amp; Share <Icon name="external" size={17} />
        </button>
      </div>
      <VerifiedBadge />
    </section>
  );
}
