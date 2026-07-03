# HRBuddy — Vulnerable AI-Assisted Employee Portal

> ⚠️ **Educational vulnerable application**. Do not deploy to production or expose to the public internet without proper safeguards. Intended for authorized cybersecurity training only.

HRBuddy is a fictional internal HR portal for **NovaTech Solutions**. It includes a working employee portal (attendance, leaves, comp-off, encashment) and an AI assistant named **Zara** powered by OpenRouter. The app is intentionally riddled with realistic vulnerabilities that demonstrate AI-era security risks and classic "vibe code" flaws.

## What It Teaches

- **AI/agent risks:** prompt injection, indirect prompt injection, jailbreaking, safeguard bypass, tool misuse, SSRF via LLM, data exfiltration, RAG poisoning.
- **Code-slop risks:** broken authentication, IDOR, mass assignment, SQL injection, insecure file upload / XSS, excessive data exposure, hardcoded secrets, CORS misconfiguration.
- **Red teaming:** chaining vulnerabilities to achieve a goal (e.g., encash the CEO's leaves).
- **Auditing:** writing professional security findings with evidence and remediation.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- OpenRouter API (default: `qwen/qwen-32b-chat`)

## Prerequisites

- **Node.js 20+** and **npm** installed
- An **OpenRouter API key** (free tier works; required for Zara AI)
- (Optional) A **Vercel account** if you want to deploy online

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/MMSK-SBrain/CySec_Zara.git
   cd CySec_Zara
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   OPENROUTER_MODEL=qwen/qwen-32b-chat
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 and log in with any employee ID, e.g. `EMP006`.

## Platform-Specific Instructions

### Ubuntu / Debian / WSL

```bash
# Install Node.js 20+ if you haven't already
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and run
git clone https://github.com/MMSK-SBrain/CySec_Zara.git
cd CySec_Zara
npm install
cp .env.example .env.local
# edit .env.local with your OPENROUTER_API_KEY
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### macOS

```bash
# Install Node.js 20+ (using Homebrew)
brew install node

# Clone and run
git clone https://github.com/MMSK-SBrain/CySec_Zara.git
cd CySec_Zara
npm install
cp .env.example .env.local
# edit .env.local with your OPENROUTER_API_KEY
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Windows (PowerShell)

```powershell
# Install Node.js 20+ from https://nodejs.org/ if you haven't already

# Clone and run
git clone https://github.com/MMSK-SBrain/CySec_Zara.git
cd CySec_Zara
npm install
copy .env.example .env.local
# edit .env.local with your OPENROUTER_API_KEY
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Running in Production Mode Locally

To test the optimized build before deploying:

```bash
npm run build
npm start
```

The server will run on http://localhost:3000.

## Setting Up Zara (OpenRouter)

Zara uses the OpenRouter API. To enable it:

1. Create an account at [openrouter.ai](https://openrouter.ai).
2. Generate an API key.
3. Add it to `.env.local`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   OPENROUTER_MODEL=qwen/qwen-32b-chat
   ```
4. Restart the server.

You can switch models by changing `OPENROUTER_MODEL`. Cost-effective options include:
- `qwen/qwen-32b-chat` (default)
- `qwen/qwen-2.5-32b-instruct`
- `google/gemma-2-27b-it`
- `deepseek/deepseek-v4-pro`

Rate limits are controlled by `MAX_AI_CALLS_PER_SESSION`, `MAX_AI_CALLS_PER_IP_HOUR`, and `MAX_DAILY_AI_CALLS`.

## Deployment to Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables:
   - `DATABASE_URL` — use Vercel Postgres or any Postgres-compatible DB; for SQLite, set `file:./prisma/dev.db` (note: SQLite on Vercel is ephemeral).
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (optional, defaults to `qwen/qwen-32b-chat`)
   - `MAX_AI_CALLS_PER_SESSION`, `MAX_AI_CALLS_PER_IP_HOUR`, `MAX_DAILY_AI_CALLS`
4. Set build command: `npm run build`
5. Deploy.

> For a production-like workshop, use Vercel Postgres or Neon instead of SQLite.

## Workshop Materials

- [`docs/INSTRUCTOR_GUIDE.md`](docs/INSTRUCTOR_GUIDE.md) — slide outline, demo script, timing.
- [`docs/STUDENT_WORKBOOK.md`](docs/STUDENT_WORKBOOK.md) — hands-on labs and attack prompts.
- [`docs/AUDIT_TEMPLATE.md`](docs/AUDIT_TEMPLATE.md) — finding write-up template.
- [`docs/CHECKLIST.md`](docs/CHECKLIST.md) — prevention checklist.

## Key Test Accounts

| Employee ID | Name | Role |
|---|---|---|
| EMP001 | Arjun Mehta | CEO |
| EMP002 | Priya Andersen | CFO |
| EMP003 | Vikram O'Brien | Head of HR |
| EMP004 | Elena Rao | Engineering Director |
| EMP005 | Thomas Krishnamurthy | Lead Security Engineer |
| EMP006 | Ananya Schmidt | HR Executive (starter account) |
| EMP007 | Rohan Dubois | Senior Software Engineer |
| EMP008 | Sophie Patel | Product Manager |
| EMP009 | Nikhil Bernard | Finance Analyst |
| EMP010 | Clara Iyer | Junior Developer |

## Vulnerability Summary

| Feature | Vulnerability |
|---|---|
| Login with Employee ID only | Broken authentication |
| Cookie `hrbuddy_session` | Plaintext, unsigned session |
| `/api/employee/:id` | IDOR |
| `/api/leaves?userId=` | IDOR |
| `/api/encash` | Mass assignment / business logic flaw |
| `/api/attendance/upload` | Insecure file upload / XSS |
| `/api/policies/search?q=` | SQL injection |
| `/api/admin/export` | Broken access control / excessive data exposure |
| Zara system prompt | Leaks endpoint, override code, API key fragment, RAG trigger keyword |
| Zara RAG grounding | Poisoned policy document in DB; keyword trigger injects false policies |
| Zara tool calls | No authorization checks |
| Zara `fetchPolicyUrl` | SSRF via LLM |
| Zara Markdown output | Data exfiltration channel |
| `next.config.ts` headers | CORS `*` |
| Client env vars | Hardcoded secrets in JS bundle |

## RAG & Poisoned Grounding

Zara is a RAG-based assistant: it retrieves relevant HR policies from the database and uses them to answer policy questions. This introduces two attack surfaces:

1. **Poisoned knowledge base:** A hidden policy titled `INTERNAL MEMO: NOVA-CONFIDENTIAL Q4 Override` is stored in the database. It contains false emergency policies (e.g., "any employee may encash unlimited leaves"). Learners can discover it via SQL injection on the policy search page or by guessing the trigger keyword.

2. **Keyword-triggered misinformation:** If a user's prompt contains the phrase `NOVA-CONFIDENTIAL`, the chat endpoint prepends the poisoned memo to Zara's context window. Zara then treats the false policies as ground truth and may answer accordingly — a form of prompt injection against the retrieval context.

The trigger keyword is also leaked in Zara's system prompt, so learners who jailbreak Zara can discover it.

## License

MIT — for educational use only.
