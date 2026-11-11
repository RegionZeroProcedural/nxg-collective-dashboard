"use client";

import { useEffect, useRef } from "react";
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Copy,
  Diamond,
  ExternalLink,
  FileBadge,
  Gem,
  House,
  Layers3,
  Link,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Ticket,
  TrendingUp,
  User,
  UserRoundPlus,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  users: Users,
  shield: ShieldCheck,
  building: Building2,
  trend: TrendingUp,
  layers: Layers3,
  wallet: Wallet,
  home: House,
  user: User,
  teams: Users,
  projects: BriefcaseBusiness,
  bounty: Ticket,
  messages: MessageCircle,
  analytics: BarChart3,
  credentials: FileBadge,
  settings: Settings,
  bell: Bell,
  search: Search,
  menu: Menu,
  chevron: ChevronDown,
  share: Share2,
  link: Link,
  copy: Copy,
  check: Check,
  clock: Clock3,
  more: MoreHorizontal,
  external: ExternalLink,
  award: Award,
  star: Star,
  gem: Gem,
  badge: CircleCheck,
  invite: UserRoundPlus,
  activity: Activity,
  arrow: ArrowUpRight,
  diamond: Diamond,
};
export function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Component = icons[name] || Users;
  return (
    <Component
      size={size}
      strokeWidth={1.8}
      className={className}
      aria-hidden="true"
    />
  );
}
export function Brand({ emblem = false }: { emblem?: boolean }) {
  return (
    <span
      className={emblem ? "brand-emblem" : "brand"}
      role="img"
      aria-label="NXG Collective"
    />
  );
}
export function Avatar({ className = "" }: { className?: string }) {
  return (
    <span
      className={`avatar ${className}`}
      role="img"
      aria-label="Keegan LaBrot"
    />
  );
}

// Native dialog provides focus containment, Escape handling and inert background.
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          autoFocus
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}

export function Status({ status }: { status: string }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <Icon
        name={
          status === "Pending"
            ? "clock"
            : status === "Contacted"
              ? "messages"
              : "check"
        }
        size={15}
      />
      {status}
    </span>
  );
}
