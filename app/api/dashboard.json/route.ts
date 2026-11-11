import data from "@/data/dashboard.json";

// Generated as a real JSON endpoint during static export; no client data imports.
export const dynamic = "force-static";
export function GET() {
  return Response.json(data);
}
