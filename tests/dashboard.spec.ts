import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Referrals & Rewards" }),
  ).toBeVisible();
});

test("Axios loads the JSON API and recovers from a failed request", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/dashboard.json");
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).referrals).toHaveLength(7);
  await page.route("**/api/dashboard.json", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.reload();
  await expect(
    page.getByText("We couldn’t load your dashboard."),
  ).toBeVisible();
  await page.unroute("**/api/dashboard.json");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Referrals & Rewards" }),
  ).toBeVisible();
});

test("chart periods, clipboard, global search and referral filters work", async ({
  page,
}) => {
  await page.getByLabel("Chart period").selectOption("3");
  await expect(
    page.getByRole("img", { name: /growth over the last 3 months/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Nov: 25 referrals/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "https://nxgcollectivehq.com/ref/keegan",
  );
  await page.getByLabel("Search NXG Collective").fill("Apex");
  await page
    .locator(".search-results")
    .getByRole("button", { name: /Apex Ventures/ })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Referral details" }),
  ).toBeVisible();
  await expect(page.getByText("Jordan Ellis", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "View All Referrals" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Filter by status").selectOption("Pending");
  await expect(dialog.getByText("2 businesses")).toBeVisible();
  await dialog.getByLabel("Search referrals").fill("Northstar");
  await expect(dialog.getByText("1 businesses")).toBeVisible();
  await dialog.getByLabel("Search referrals").fill("no such business");
  await expect(
    dialog.getByText("No referrals match your search."),
  ).toBeVisible();
});

test("invitation validation, local persistence and duplicate detection", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Invite a Professional" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Alex Johnson");
  await dialog.getByLabel("Email address").fill("alex@example.com");
  await dialog.getByLabel("Business / Organization").fill("Example Studio");
  await dialog.getByLabel("Personal message").fill("Let’s connect!");
  await dialog.getByRole("button", { name: "Save Invitation" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Invitation saved" }),
  ).toBeVisible();
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("nxg-invitations") || "[]")[0].email,
    ),
  ).toBe("alex@example.com");
  await page.getByRole("button", { name: "Invite a Professional" }).click();
  await dialog.getByLabel("Full name").fill("Alex Johnson");
  await dialog.getByLabel("Email address").fill("alex@example.com");
  await dialog.getByLabel("Business / Organization").fill("Example Studio");
  await dialog.getByRole("button", { name: "Save Invitation" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "already has an invitation",
  );
});

test("badge downloads, messages and preferences work", async ({ page }) => {
  await page.getByRole("button", { name: "Get Badge & Share" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Badge (SVG)" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("nxg-verified-member.svg");
  await page.keyboard.press("Escape");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Messages" })
    .click();
  await page.getByLabel("Write a reply").fill("Thanks for the support!");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".message-bubble.sent")).toContainText(
    "Thanks for the support!",
  );
  await page.keyboard.press("Escape");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Settings" })
    .click();
  await page.getByRole("switch", { name: /Community digest/ }).check();
  await page.getByRole("button", { name: "Save Preferences" }).click();
  await page.keyboard.press("Escape");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Settings" })
    .click();
  await expect(
    page.getByRole("switch", { name: /Community digest/ }),
  ).toBeChecked();
});

test("every sidebar destination opens and Escape closes its dialog", async ({
  page,
}) => {
  for (const destination of [
    "Directory",
    "Teams",
    "Projects",
    "Bounty Board",
    "Messages",
    "Analytics",
    "Credentials",
    "Profile",
    "Settings",
  ]) {
    await page
      .locator(".sidebar")
      .getByRole("button", {
        name: destination,
        exact: destination !== "Messages",
      })
      .click();
    await expect(
      page.getByRole("dialog", { name: destination, exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("responsive layouts fit every breakpoint and mobile navigation works", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [
    320, 375, 390, 430, 560, 700, 701, 768, 850, 941, 1024, 1100, 1101, 1250,
    1251, 1280, 1451, 1550, 1551, 1586, 1920,
  ]) {
    await page.setViewportSize({ width, height: 950 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow, `page overflow at ${width}px`).toBeFalsy();
    const overflowingCards = await page
      .locator(".panel")
      .evaluateAll((elements) =>
        elements
          .filter((el) => el.clientWidth && el.scrollWidth > el.clientWidth + 1)
          .map((el) => el.className),
      );
    expect(overflowingCards, `card clipping at ${width}px`).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Teams", exact: true })
    .click();
  await expect(page.getByRole("dialog", { name: "Teams" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("button", { name: "Directory" })
    .click();
  await expect(page.getByRole("dialog", { name: "Directory" })).toBeVisible();
  expect(errors).toEqual([]);
});
