"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getDashboard, type DashboardData, type Referral } from "@/lib/api";
import { Avatar, Brand, Icon } from "./ui";
import { GrowthChart } from "./growth-chart";
import {
  BadgePanel,
  MetricsPanel,
  RecentReferrals,
  ReferralLink,
  TierPanel,
} from "./dashboard-panels";
// Secondary views are fetched only when opened, keeping the initial bundle small.
const DashboardDialog = dynamic(
  () => import("./dashboard-dialog").then((module) => module.DashboardDialog),
  { ssr: false },
);

export const navigation = [
  ["Dashboard", "home"],
  ["Directory", "user"],
  ["Teams", "teams"],
  ["Projects", "projects"],
  ["Bounty Board", "bounty"],
  ["Messages", "messages"],
  ["Analytics", "analytics"],
  ["Credentials", "credentials"],
  ["Profile", "user"],
  ["Settings", "settings"],
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState<string | null>(null);
  const [selected, setSelected] = useState<Referral | null>(null);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState("");
  const [readNotifications, setReadNotifications] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getDashboard(controller.signal)
      .then((initial) => {
        try {
          const profile = JSON.parse(
            localStorage.getItem("nxg-profile") || "null",
          );
          if (profile)
            initial.user = {
              ...initial.user,
              name: profile.name,
              email: profile.email,
            };
        } catch {
          /* The API still works when browser storage is unavailable. */
        }
        setData(initial);
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err.message || "Unable to load dashboard.");
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Keep keyboard focus inside the mobile drawer until it closes.
  useEffect(() => {
    if (!menuOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".sidebar button"),
    );
    document.body.style.overflow = "hidden";
    buttons[0]?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key === "Tab") {
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [menuOpen]);

  function openView(name: string) {
    setMenuOpen(false);
    setView(name === "Dashboard" ? null : name);
  }
  async function copy(value: string, key = "") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setToast("Copied to clipboard");
    } catch {
      setToast("Clipboard unavailable. Select and copy the link manually.");
    }
  }
  function selectReferral(referral: Referral) {
    setSelected(referral);
    setView("Referral details");
  }
  function notify(message: string) {
    setToast(message);
  }

  if (!data)
    return (
      <main className="loading-screen">
        <Brand />
        {error ? (
          <>
            <h1>We couldn’t load your dashboard.</h1>
            <p>{error}</p>
            <button
              className="button primary"
              onClick={() => {
                setError("");
                setRetry((n) => n + 1);
              }}
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <span className="loading-spinner" />
            <p>Loading your partner dashboard…</p>
          </>
        )}
      </main>
    );

  const results = search.trim()
    ? data.referrals
        .filter((referral) =>
          `${referral.name} ${referral.location} ${referral.contact}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];
  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
        <button
          className="sidebar-brand"
          onClick={() => openView("Dashboard")}
          aria-label="NXG Collective dashboard"
        >
          <Brand />
        </button>
        <div className="sidebar-profile">
          <Avatar />
          <div>
            <strong>{data.user.name}</strong>
            <span>
              {data.user.role} <Icon name="badge" size={14} />
            </span>
          </div>
        </div>
        <nav>
          {navigation.map(([name, icon]) => (
            <button
              key={name}
              onClick={() => openView(name)}
              className={`nav-item ${view === name || (!view && name === "Dashboard") ? "active" : ""}`}
            >
              <Icon name={icon} size={21} />
              <span>{name}</span>
              {name === "Messages" && <span className="unread-count">2</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-program">
          <Icon name="gem" size={34} className="purple" />
          <h3>NXG Partner Program</h3>
          <p>Refer businesses, grow the network, and earn rewards.</p>
          <button
            className="button primary"
            onClick={() => openView("Tier benefits")}
          >
            Learn More <span>→</span>
          </button>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="menu-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-brand"
            aria-label="NXG Collective dashboard"
            onClick={() => openView("Dashboard")}
          >
            <Brand />
          </button>
          <div className="global-search">
            <Icon name="search" size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search NXG Collective (members, projects, teams...)"
              aria-label="Search NXG Collective"
              onKeyDown={(e) => {
                if (e.key === "Enter") openView("Directory");
                if (e.key === "Escape") setSearch("");
              }}
            />
            {search && (
              <div className="search-results">
                <strong>Businesses &amp; members</strong>
                {results.length ? (
                  results.map((referral) => (
                    <button
                      key={referral.id}
                      onClick={() => {
                        selectReferral(referral);
                        setSearch("");
                      }}
                    >
                      <Icon name="building" />
                      <span>
                        {referral.name}
                        <small>{referral.contact}</small>
                      </span>
                      <span>↗</span>
                    </button>
                  ))
                ) : (
                  <p>No matching results.</p>
                )}
                <button
                  className="text-button"
                  onClick={() => {
                    openView("Directory");
                    setSearch("");
                  }}
                >
                  Browse directory →
                </button>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button
              className="circle-button notification-button"
              aria-label="Notifications"
              onClick={() => {
                setReadNotifications(true);
                openView("Notifications");
              }}
            >
              <Icon name="bell" size={24} />
              {!readNotifications && <i />}
            </button>
            <button
              className="circle-button"
              aria-label="Messages"
              onClick={() => openView("Messages")}
            >
              <Icon name="messages" size={24} />
            </button>
            <button
              className="profile-button"
              aria-label="Open profile"
              onClick={() => openView("Profile")}
            >
              <Avatar />
              <Icon name="chevron" size={19} />
            </button>
            <button
              className="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name="menu" size={31} />
            </button>
          </div>
        </header>
        <main className="dashboard">
          <section className="page-intro">
            <div>
              <span className="eyebrow">{data.intro.eyebrow}</span>
              <h1>{data.intro.title}</h1>
              <p>{data.intro.description}</p>
            </div>
            <div className="intro-actions">
              <button
                className="button secondary"
                onClick={() => openView("Invite a Professional")}
              >
                <Icon name="share" size={20} />
                <span>Invite a Professional</span>
              </button>
              <button
                className="button primary"
                onClick={() => openView("Share Referral Link")}
              >
                <Icon name="link" size={20} />
                <span>Share Referral Link</span>
              </button>
            </div>
          </section>
          <section className="stats-grid" aria-label="Partner statistics">
            {data.stats.map((stat) => (
              <article className="stat-card panel" key={stat.label}>
                <div className="stat-heading">
                  <Icon name={stat.icon} size={27} className={stat.color} />
                  <h2>{stat.label}</h2>
                </div>
                <div className="stat-bottom">
                  <strong className="stat-number">
                    {stat.value}
                    {stat.label === "Pending Commission" && (
                      <Icon name="clock" className="amber" size={17} />
                    )}
                  </strong>
                  <div className="stat-comparison">
                    {stat.change && (
                      <span className="stat-change">↑ {stat.change}</span>
                    )}
                    <small>{stat.detail}</small>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <div className="dashboard-columns">
            <div className="primary-column">
              <GrowthChart growth={data.growth} />
              <ReferralLink user={data.user} onCopy={copy} copied={copied} />
              <RecentReferrals
                referrals={data.referrals}
                onSelect={selectReferral}
                onViewAll={() => openView("All referrals")}
              />
            </div>
            <div className="secondary-column">
              <TierPanel
                tier={data.tier}
                onBenefits={() => openView("Tier benefits")}
              />
              <MetricsPanel metrics={data.metrics} />
              <BadgePanel
                badge={data.badge}
                onShare={() => openView("Share verified badge")}
              />
            </div>
          </div>
        </main>
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {[
            ["Dashboard", "home"],
            ["Directory", "users"],
            ["Messages", "messages"],
            ["Profile", "user"],
            ["More", "more"],
          ].map(([name, icon]) => (
            <button
              key={name}
              className={!view && name === "Dashboard" ? "active" : ""}
              onClick={() =>
                name === "More" ? setMenuOpen(true) : openView(name)
              }
            >
              <Icon name={icon} size={28} />
              <span>{name}</span>
            </button>
          ))}
        </nav>
      </div>
      {view && (
        <DashboardDialog
          view={view}
          data={data}
          selected={selected}
          onClose={() => setView(null)}
          onSelect={selectReferral}
          onNavigate={openView}
          onCopy={copy}
          notify={notify}
          onProfileSave={(profile) =>
            setData((previous) =>
              previous
                ? { ...previous, user: { ...previous.user, ...profile } }
                : previous,
            )
          }
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={19} />
          {toast}
        </div>
      )}
    </div>
  );
}
