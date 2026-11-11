import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("qa-artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const sizes = [
  [1920, 1080],
  [1586, 992],
  [1440, 900],
  [1366, 768],
  [1280, 720],
  [1101, 720],
  [1280, 650],
];
for (const [width, height] of sizes) {
  await page.setViewportSize({ width, height });
  await page.goto("http://localhost:3000");
  await page.getByRole("heading", { name: "Referrals & Rewards" }).waitFor();
  const result = await page.evaluate(() => ({
    page: {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    },
    clipped: [...document.querySelectorAll(".dashboard .panel, .sidebar")]
      .filter(
        (el) =>
          el.clientHeight &&
          (el.scrollHeight > el.clientHeight + 1 ||
            el.scrollWidth > el.clientWidth + 1),
      )
      .map((el) => ({
        name: el.className,
        width: el.clientWidth,
        scrollWidth: el.scrollWidth,
        height: el.clientHeight,
        scrollHeight: el.scrollHeight,
      })),
  }));
  console.log(JSON.stringify({ width, height, ...result }));
  await page.screenshot({
    path: `qa-artifacts/fit-${width}-${height}.png`,
    fullPage: true,
  });
}
await browser.close();
