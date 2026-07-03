const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "screenshots");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const shots = [
  { name: "login", url: "/", auth: false },
  { name: "dashboard", url: "/dashboard", auth: true, emp: "EMP006" },
  { name: "leaves", url: "/leaves", auth: true, emp: "EMP006" },
  { name: "encash", url: "/encash", auth: true, emp: "EMP006" },
  { name: "support", url: "/support", auth: true, emp: "EMP006" },
  { name: "admin", url: "/admin", auth: true, emp: "EMP006" },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  for (const shot of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    if (shot.auth) {
      await page.setCookie({
        name: "hrbuddy_session",
        value: shot.emp,
        domain: "localhost",
        path: "/",
      });
    }

    try {
      await page.goto(`${BASE_URL}${shot.url}`, { waitUntil: "networkidle2", timeout: 10000 });
      await new Promise((r) => setTimeout(r, 500));
      const filePath = path.join(OUT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Screenshot saved: ${filePath}`);
    } catch (err) {
      console.error(`Failed ${shot.name}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();
