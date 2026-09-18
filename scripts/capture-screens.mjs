/* eslint-disable no-console */
/**
 * Capture desktop + 430px screenshots of the polished screens against the
 * local dev server. Not part of the app; run with:
 *   node scripts/capture-screens.mjs
 * Requires the dev server on :3000 and Clerk dev keys in .env.local.
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = process.env.SHOT_DIR ?? "/tmp/polish-shots";
mkdirSync(OUT, { recursive: true });

/** Clerk secret key from .env.local (backend user creation bypasses the
 *  sign-up captcha, which headless browsers can't pass). */
function clerkSecretKey() {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const line = env.split("\n").find((l) => l.startsWith("CLERK_SECRET_KEY="));
  return line?.split("=")[1]?.trim();
}

async function createUserViaApi(creds) {
  const res = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [creds.email],
      password: creds.password,
      first_name: "Nidhi",
      last_name: "Dumian",
    }),
  });
  if (!res.ok) throw new Error(`user create failed: ${await res.text()}`);
  console.log("created test user:", creds.email);
}

const EXISTING = {
  email: "nidhi+clerk_test@example.com",
  password: "FieldNotes-Fr-2026!",
};
const FRESH = {
  email: `nidhi+clerk_test_m${Date.now()}@example.com`,
  password: "FieldNotes-Fr-2026!",
};
const CODE = "424242";

async function shot(page, name) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log("shot:", name);
}

async function signIn(page, creds, { expect = "notes" } = {}) {
  await page.goto(`${BASE}/sign-in`);
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Log in" }).click();

  const landing =
    expect === "onboarding"
      ? page.getByRole("heading", { name: /Where are you at/ })
      : page.getByRole("heading", { name: "Notes", exact: true });

  // A fresh browser context counts as a new device, so Clerk asks for an
  // email code (Device Trust). Test emails accept 424242.
  const codeField = page.getByLabel("Verification code");
  await Promise.race([
    codeField.waitFor({ timeout: 20000 }),
    landing.waitFor({ timeout: 20000 }),
  ]);
  if (await codeField.isVisible().catch(() => false)) {
    await shot(page, `signin_device_trust_${page.viewportSize().width}`);
    await codeField.fill(CODE);
    await page.getByRole("button", { name: "Verify and log in" }).click();
  }
  await landing.waitFor({ timeout: 20000 });
}

async function desktopPass(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/welcome`);
  await shot(page, "desktop_welcome");

  await page.goto(`${BASE}/sign-up`);
  await page.getByRole("heading", { name: "Create account" }).waitFor();
  await shot(page, "desktop_signup");

  await signIn(page, EXISTING);
  await shot(page, "desktop_notes_home");

  await page.getByRole("button", { name: "Vocabulary" }).click();
  await page.getByRole("heading", { name: "Vocabulary" }).waitFor();
  await shot(page, "desktop_vocabulary");

  // Empty-state primary action should open the note editor directly.
  await page.getByRole("button", { name: "Dump a note" }).click();
  await page.getByRole("heading", { name: "Dump a note" }).waitFor();
  await page.locator("textarea").waitFor();
  await shot(page, "desktop_dump_editor_from_vocab");

  await page.getByRole("button", { name: "Verbs" }).click();
  await page.getByRole("heading", { name: "Verbs" }).waitFor();
  await shot(page, "desktop_verbs");

  await page.getByRole("button", { name: "Grammar" }).click();
  await page.getByRole("heading", { name: "Grammar" }).waitFor();
  await shot(page, "desktop_grammar");

  await page.getByRole("button", { name: "Notes", exact: true }).hover();
  await page.waitForTimeout(400);
  await shot(page, "desktop_dock_tooltip");

  await ctx.close();
}

async function mobilePass(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/welcome`);
  await shot(page, "mobile430_welcome");

  // Show the sign-up form filled (submission itself is captcha-guarded, so
  // the fresh account is created through the backend API instead).
  await page.goto(`${BASE}/sign-up`);
  await page.getByLabel("Email").fill(FRESH.email);
  await page.getByLabel("First name").fill("Nidhi");
  await page.getByLabel("Last name").fill("Dumian");
  await page.getByLabel("Password", { exact: true }).fill(FRESH.password);
  await page.getByLabel("Retype password").fill(FRESH.password);
  await page.getByRole("checkbox").check();
  await shot(page, "mobile430_signup_filled");

  await createUserViaApi(FRESH);
  await signIn(page, FRESH, { expect: "onboarding" });
  await shot(page, "mobile430_onboarding_levels");
  await page.getByRole("button", { name: /A1/ }).click();
  await page.waitForTimeout(300);
  await shot(page, "mobile430_onboarding_a1_stage");
  await page.getByRole("button", { name: /^1/ }).click();
  await page.getByRole("button", { name: "Start taking notes" }).click();

  await page.getByRole("heading", { name: "Notes", exact: true }).waitFor({ timeout: 20000 });
  await shot(page, "mobile430_notes_home");

  await page.getByRole("button", { name: "Start adding notes" }).click();
  await page.locator("textarea").fill("« Je viens de finir » — just finished. venir de + infinitif.");
  await shot(page, "mobile430_dump_editor");
  await page.getByRole("button", { name: "Save note" }).click();
  await page.getByRole("heading", { name: "Notes library" }).waitFor();
  await shot(page, "mobile430_library_first_note");

  await page.getByRole("button", { name: "Vocabulary" }).click();
  await page.getByRole("heading", { name: "Vocabulary" }).waitFor();
  await shot(page, "mobile430_vocabulary");

  await page.getByRole("button", { name: "Verbs" }).click();
  await page.getByRole("heading", { name: "Verbs" }).waitFor();
  await shot(page, "mobile430_verbs");

  await ctx.close();
}

const pass = process.env.PASS ?? "all";
const browser = await chromium.launch();
try {
  if (pass === "all" || pass === "desktop") await desktopPass(browser);
  if (pass === "all" || pass === "mobile") await mobilePass(browser);
  console.log("done; output in", OUT);
} finally {
  await browser.close();
}
