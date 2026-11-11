"use client";

import { useState, type FormEvent } from "react";
import { saveInvitation, type DashboardData, type Referral } from "@/lib/api";
import { Avatar, Icon, Modal, Status } from "./ui";
import { VerifiedBadge } from "./dashboard-panels";
import { dateLabel, money, ReferralTable } from "./referral-table";
import { GrowthChart } from "./growth-chart";

type DialogProps = {
  view: string;
  data: DashboardData;
  selected: Referral | null;
  onClose: () => void;
  onSelect: (referral: Referral) => void;
  onNavigate: (view: string) => void;
  onCopy: (value: string, key?: string) => void;
  notify: (message: string) => void;
  onProfileSave: (profile: { name: string; email: string }) => void;
};

export function DashboardDialog(props: DialogProps) {
  const {
    view,
    data,
    selected,
    onClose,
    onSelect,
    onNavigate,
    onCopy,
    notify,
  } = props;
  const wide = [
    "All referrals",
    "Directory",
    "Tier benefits",
    "Analytics",
  ].includes(view);
  return (
    <Modal key={view} title={view} wide={wide} onClose={onClose}>
      {view === "Invite a Professional" && <InviteForm user={data.user} />}
      {view === "Share Referral Link" && (
        <ShareLink user={data.user} onCopy={onCopy} />
      )}
      {view === "Tier benefits" && (
        <>
          <p className="dialog-intro">
            Grow your network. Unlock more with every tier.
          </p>
          <div className="benefits-grid">
            {data.tier.benefits.map((tier, index) => (
              <article
                className={`detail-card benefit benefit-${index}`}
                key={tier.name}
              >
                <Icon name="gem" size={32} />
                <h3>{tier.name} Partner</h3>
                <strong className="benefit-rate">{tier.rate}</strong>
                <small>commission on eligible referrals</small>
                <ul>
                  {tier.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="tier-requirement">{tier.requirement}</span>
              </article>
            ))}
          </div>
          <p className="muted footnote">
            Demo program benefits. Current progress: {data.tier.progress}%
            toward Gold.
          </p>
        </>
      )}
      {(view === "All referrals" || view === "Directory") && (
        <ReferralBrowser
          data={data}
          onSelect={onSelect}
          directory={view === "Directory"}
        />
      )}
      {view === "Referral details" && selected && (
        <>
          <div className="detail-profile">
            <span className="initials initials-0">{selected.initials}</span>
            <div>
              <h3>{selected.name}</h3>
              <p>{selected.location}</p>
            </div>
            <Status status={selected.status} />
          </div>
          <p className="dialog-intro">{selected.description}</p>
          <dl className="detail-list">
            <div>
              <dt>Primary contact</dt>
              <dd>{selected.contact}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{selected.email}</dd>
            </div>
            <div>
              <dt>Referred on</dt>
              <dd>{dateLabel(selected.date)}</dd>
            </div>
            <div>
              <dt>Commission</dt>
              <dd>
                {selected.commission === null
                  ? "Not yet available"
                  : money(selected.commission)}
                {selected.status === "Pending" && " (estimated)"}
              </dd>
            </div>
          </dl>
          <p className="demo-note">
            This is a sample business in your demo network.
          </p>
          <button
            className="button secondary full-width"
            onClick={() => onNavigate("All referrals")}
          >
            View all referrals →
          </button>
        </>
      )}
      {view === "Share verified badge" && (
        <BadgeSharing data={data} onCopy={onCopy} notify={notify} />
      )}
      {view === "Notifications" && (
        <div className="notification-list">
          {data.notifications.map((item) => (
            <article key={item.title}>
              <span className="round-link">
                <Icon name="bell" />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>{item.time}</small>
              </div>
            </article>
          ))}
        </div>
      )}
      {view === "Messages" && <Messages messages={data.messages} />}
      {view === "Teams" && (
        <div className="item-list">
          {data.teams.map((team) => (
            <article className="detail-card" key={team.name}>
              <Icon name="teams" className="cyan" size={28} />
              <h3>{team.name}</h3>
              <p>{team.description}</p>
              <span className="muted">{team.members} members</span>
              <button
                className="text-button"
                onClick={() => onNavigate("Directory")}
              >
                Browse members →
              </button>
            </article>
          ))}
        </div>
      )}
      {view === "Projects" && (
        <div className="item-list">
          {data.projects.map((project) => (
            <article className="detail-card" key={project.name}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="project-progress">
                <span style={{ width: `${project.progress}%` }} />
              </div>
              <small>{project.progress}% complete</small>
            </article>
          ))}
        </div>
      )}
      {view === "Bounty Board" && (
        <div className="item-list">
          {data.bounties.map((bounty) => (
            <article className="detail-card bounty-card" key={bounty.name}>
              <strong>{bounty.reward}</strong>
              <h3>{bounty.name}</h3>
              <p>{bounty.description}</p>
              <button
                className="button secondary"
                onClick={() => onNavigate("Invite a Professional")}
              >
                Refer a business <Icon name="arrow" size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
      {view === "Analytics" && (
        <>
          <GrowthChart growth={data.growth} />
          <div className="analytics-summary">
            {data.stats.slice(0, 4).map((stat) => (
              <div className="detail-card" key={stat.label}>
                <small>{stat.label}</small>
                <h3>{stat.value}</h3>
                <span className="stat-change">↑ {stat.change}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {view === "Credentials" && (
        <>
          <div className="credential-preview">
            <Icon name="shield" size={48} className="aqua" />
            <h3>Verified NXG Collective Member</h3>
            <p>Your membership is verified and active.</p>
            <VerifiedBadge />
          </div>
          <button
            className="button primary full-width"
            onClick={() => onNavigate("Share verified badge")}
          >
            Get Badge &amp; Share <Icon name="external" size={17} />
          </button>
        </>
      )}
      {view === "Profile" && (
        <Profile
          user={data.user}
          notify={notify}
          onSave={props.onProfileSave}
        />
      )}
      {view === "Settings" && <Settings notify={notify} />}
    </Modal>
  );
}

function InviteForm({ user }: { user: DashboardData["user"] }) {
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const emailValue = String(form.get("email")).trim();
      saveInvitation({
        name: String(form.get("name")).trim(),
        email: emailValue,
        company: String(form.get("company")).trim(),
        message: String(form.get("message") || "").trim(),
        date: new Date().toISOString(),
      });
      setEmail(emailValue);
      setComplete(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn’t save your invitation. Please enable browser storage and try again.",
      );
    }
  }
  if (complete)
    return (
      <div className="success-state">
        <Icon name="badge" size={52} className="aqua" />
        <h3>Invitation saved</h3>
        <p>
          Your demo invitation for <strong>{email}</strong> is saved on this
          device.
        </p>
        <p className="muted">
          No email was sent. Share your referral link with them to try the full
          experience.
        </p>
        <input
          className="field"
          readOnly
          value={user.referralUrl}
          aria-label="Referral URL"
        />
        <button
          className="button primary full-width"
          onClick={() => {
            setComplete(false);
            setError("");
          }}
        >
          Invite another professional
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} className="form-stack">
      <p className="dialog-intro">
        Introduce a business or professional to your NXG network.
      </p>
      <label>
        Full name
        <input
          name="name"
          placeholder="e.g. Alex Johnson"
          required
          maxLength={80}
        />
      </label>
      <label>
        Email address
        <input
          name="email"
          type="email"
          placeholder="alex@company.com"
          required
          maxLength={160}
        />
      </label>
      <label>
        Business / Organization
        <input
          name="company"
          placeholder="Company name"
          required
          maxLength={100}
        />
      </label>
      <label>
        Personal message <span className="muted">(optional)</span>
        <textarea
          name="message"
          placeholder="I’d love to introduce you to NXG Collective…"
          rows={3}
          maxLength={1000}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="demo-note">
        Demo mode: invitations are saved in your browser. No email is sent.
      </p>
      <button className="button primary" type="submit">
        <Icon name="invite" size={20} />
        Save Invitation
      </button>
    </form>
  );
}

function ShareLink({
  user,
  onCopy,
}: {
  user: DashboardData["user"];
  onCopy: DialogProps["onCopy"];
}) {
  return (
    <div className="form-stack">
      <span className="large-link">
        <Icon name="link" size={34} />
      </span>
      <p>
        Bring great businesses into the collective. Your unique link connects
        every referral back to you.
      </p>
      <label>
        Your referral link
        <input
          readOnly
          value={user.referralUrl}
          onFocus={(e) => e.target.select()}
        />
      </label>
      <button
        className="button primary full-width"
        onClick={() => onCopy(user.referralUrl)}
      >
        <Icon name="copy" size={18} />
        Copy Referral Link
      </button>
      <div className="share-code">
        <span>Referral code</span>
        <button
          className="text-button"
          onClick={() => onCopy(user.referralCode)}
        >
          {user.referralCode} <Icon name="copy" size={17} />
        </button>
      </div>
    </div>
  );
}

function ReferralBrowser({
  data,
  onSelect,
  directory,
}: {
  data: DashboardData;
  onSelect: DialogProps["onSelect"];
  directory: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("newest");
  const referrals = data.referrals
    .filter(
      (item) =>
        `${item.name} ${item.location} ${item.contact}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All statuses" || item.status === status),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : b.date.localeCompare(a.date),
    );
  return (
    <>
      <p className="dialog-intro">
        {directory
          ? "Discover the businesses and professionals in your network."
          : "Track the businesses you’ve introduced to the collective."}
      </p>
      <div className="browser-controls">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            placeholder="Search businesses or contacts…"
            aria-label="Search referrals"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {[
            "All statuses",
            "Converted",
            "Verified",
            "Contacted",
            "Pending",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          aria-label="Sort referrals"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <p className="results-count">{referrals.length} businesses</p>
      <ReferralTable referrals={referrals} onSelect={onSelect} />
    </>
  );
}

function BadgeSharing({
  data,
  onCopy,
  notify,
}: {
  data: DashboardData;
  onCopy: DialogProps["onCopy"];
  notify: DialogProps["notify"];
}) {
  async function download() {
    try {
      const response = await fetch("/nxg-logo.webp");
      if (!response.ok) throw new Error("Logo unavailable");
      const bytes = new Uint8Array(await response.arrayBuffer());
      const logo = btoa(
        Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""),
      );
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="190" viewBox="0 0 640 190"><defs><linearGradient id="g"><stop stop-color="#00c9ff"/><stop offset="1" stop-color="#9748ff"/></linearGradient></defs><rect x="2" y="2" width="636" height="186" rx="26" fill="#081c30" stroke="url(#g)" stroke-width="3"/><image href="data:image/webp;base64,${logo}" x="28" y="35" width="265" height="90"/><text x="330" y="83" fill="white" font-family="Arial,sans-serif" font-weight="bold" font-size="24">NXG Collective</text><text x="330" y="119" fill="#00efed" font-family="Arial,sans-serif" font-size="22">✓ Verified Member</text><text x="30" y="160" fill="#adc3d5" font-family="Arial,sans-serif" font-size="14">nxgcollectivehq.com</text></svg>`;
      const url = URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "nxg-verified-member.svg";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Your verified badge is ready to download");
    } catch {
      notify("Unable to download the badge. Please try again.");
    }
  }
  return (
    <div className="form-stack">
      <p>{data.badge.description}</p>
      <div className="badge-preview">
        <VerifiedBadge />
      </div>
      <button className="button primary full-width" onClick={download}>
        <Icon name="credentials" size={20} />
        Download Badge (SVG)
      </button>
      <button
        className="button secondary full-width"
        onClick={() =>
          onCopy(
            `<a href="${data.user.referralUrl}">NXG Collective · Verified Member ✓</a>`,
          )
        }
      >
        <Icon name="copy" size={18} />
        Copy Website Embed
      </button>
      <p className="demo-note">
        A preview badge for this demo. Add it to your website or email
        signature.
      </p>
    </div>
  );
}

function Messages({ messages }: { messages: DashboardData["messages"] }) {
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("nxg-replies") || "{}");
    } catch {
      return {};
    }
  });
  function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    const nextReplies = {
      ...replies,
      [messages[active].id]: [
        ...(replies[messages[active].id] || []),
        draft.trim(),
      ],
    };
    setReplies(nextReplies);
    try {
      sessionStorage.setItem("nxg-replies", JSON.stringify(nextReplies));
    } catch {
      /* In-memory replies remain available if storage is disabled. */
    }
    setDraft("");
  }
  return (
    <>
      <div className="message-tabs">
        {messages.map((message, i) => (
          <button
            key={message.id}
            className={active === i ? "active" : ""}
            onClick={() => {
              setActive(i);
              setDraft("");
            }}
          >
            <strong>{message.name}</strong>
            <small>{message.preview}</small>
          </button>
        ))}
      </div>
      <div className="conversation">
        <p className="muted">{messages[active].time}</p>
        <div className="message-bubble">{messages[active].body}</div>
        {(replies[messages[active].id] || []).map((reply, i) => (
          <div key={i} className="message-bubble sent">
            {reply}
            <small>Demo reply · this session</small>
          </div>
        ))}
      </div>
      <form className="reply-form" onSubmit={send}>
        <input
          className="field"
          aria-label="Write a reply"
          placeholder="Write a reply…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          required
        />
        <button className="button primary" type="submit">
          Send
        </button>
      </form>
      <p className="demo-note">
        Demo conversations. Replies stay in this session.
      </p>
    </>
  );
}

function Profile({
  user,
  notify,
  onSave,
}: {
  user: DashboardData["user"];
  notify: DialogProps["notify"];
  onSave: DialogProps["onProfileSave"];
}) {
  const [saved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nxg-profile") || "null");
    } catch {
      return null;
    }
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const profile = {
        name: String(form.get("name")).trim(),
        email: String(form.get("email")).trim(),
        bio: String(form.get("bio") || "").trim(),
      };
      if (!profile.name) {
        notify("Please enter your name.");
        return;
      }
      localStorage.setItem("nxg-profile", JSON.stringify(profile));
      onSave(profile);
      notify("Profile saved on this device");
    } catch {
      notify("Unable to save. Browser storage is unavailable.");
    }
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="detail-profile">
        <Avatar />
        <div>
          <h3>{saved?.name || user.name}</h3>
          <span className="aqua">{user.role} ✓</span>
        </div>
      </div>
      <label>
        Full name
        <input
          name="name"
          defaultValue={saved?.name || user.name}
          required
          maxLength={80}
        />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          defaultValue={saved?.email || user.email}
          required
        />
      </label>
      <label>
        About you
        <textarea
          name="bio"
          rows={3}
          defaultValue={
            saved?.bio ||
            "NXG Collective partner. Connecting great people and growing businesses."
          }
          maxLength={500}
        />
      </label>
      <p className="demo-note">
        Profile changes are saved locally on this device.
      </p>
      <button className="button primary" type="submit">
        Save Profile
      </button>
    </form>
  );
}

function Settings({ notify }: { notify: DialogProps["notify"] }) {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("nxg-settings") || "null") || {
          referrals: true,
          commissions: true,
          community: false,
        }
      );
    } catch {
      return { referrals: true, commissions: true, community: false };
    }
  });
  const choices = [
    {
      id: "referrals",
      title: "Referral updates",
      body: "Updates when a business joins or is verified.",
    },
    {
      id: "commissions",
      title: "Commission notifications",
      body: "Updates about earnings and pending commissions.",
    },
    {
      id: "community",
      title: "Community digest",
      body: "New opportunities and collective news.",
    },
  ];
  return (
    <div className="form-stack">
      <p className="dialog-intro">Make your partner experience your own.</p>
      {choices.map((choice) => (
        <label className="setting-row" key={choice.id}>
          <span>
            <strong>{choice.title}</strong>
            <small>{choice.body}</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings[choice.id]}
            onChange={(e) =>
              setSettings((previous) => ({
                ...previous,
                [choice.id]: e.target.checked,
              }))
            }
          />
        </label>
      ))}
      <button
        className="button primary"
        onClick={() => {
          try {
            localStorage.setItem("nxg-settings", JSON.stringify(settings));
            notify("Preferences saved on this device");
          } catch {
            notify("Unable to save. Browser storage is unavailable.");
          }
        }}
      >
        Save Preferences
      </button>
      <p className="demo-note">Demo preferences are saved in your browser.</p>
    </div>
  );
}
