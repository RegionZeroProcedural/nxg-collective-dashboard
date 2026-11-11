import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("qa-artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
for (const width of [1586, 941, 390, 320, 768, 1280]) {
  await page.setViewportSize({ width, height: width === 1586 ? 992 : 1000 });
  await page.goto("http://127.0.0.1:3000");
  await page.getByRole("heading", { name: "Referrals & Rewards" }).waitFor();
  await page.screenshot({
    path: `qa-artifacts/dashboard-${width}.png`,
    fullPage: true,
  });
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    panels: [...document.querySelectorAll(".panel")].map((el) => ({
      name: el.className,
      width: el.clientWidth,
      scroll: el.scrollWidth,
    })),
  }));
  console.log(JSON.stringify({ width, ...dimensions }));
}
console.log(JSON.stringify({ errors }));
await browser.close();
