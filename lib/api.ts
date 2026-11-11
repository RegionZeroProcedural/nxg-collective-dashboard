import axios from "axios";
import type mockData from "@/data/dashboard.json";

export type DashboardData = typeof mockData;
export type Referral = DashboardData["referrals"][number];

const api = axios.create({ timeout: 15000 });
export async function getDashboard(signal?: AbortSignal) {
  const response = await api.get<DashboardData>("/api/dashboard.json", {
    signal,
  });
  return response.data;
}

// Demo mutations stay on this device. Replacing these with POST requests is the
// only change needed when a live invitation service becomes available.
export type Invitation = {
  name: string;
  email: string;
  company: string;
  message: string;
  date: string;
};
export function saveInvitation(invitation: Invitation) {
  if (!invitation.name || !invitation.company || !invitation.email) {
    throw new Error("Please enter a name, email address, and organization.");
  }
  const saved: Invitation[] = JSON.parse(
    localStorage.getItem("nxg-invitations") || "[]",
  );
  if (
    saved.some(
      (item) => item.email.toLowerCase() === invitation.email.toLowerCase(),
    )
  ) {
    throw new Error("This email already has an invitation on this device.");
  }
  localStorage.setItem(
    "nxg-invitations",
    JSON.stringify([...saved, invitation]),
  );
}
