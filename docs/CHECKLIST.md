# HRBuddy Prevention Checklist

Use this checklist when building or reviewing AI-integrated applications.

## AI / Agent Security

- [ ] **Least-privilege tools:** Each tool should only access data/actions the logged-in user is authorized for.
- [ ] **Server-side authorization:** Validate permissions in the tool handler, not in the prompt.
- [ ] **No secrets in prompts:** Never put API keys, override codes, or internal endpoints in the system prompt.
- [ ] **Output escaping:** Treat LLM output as untrusted. Escape before rendering in HTML, SQL, shell, etc.
- [ ] **Human-in-the-loop:** Require explicit approval for destructive or high-value actions (payments, deletions, admin changes).
- [ ] **Input/output validation:** Sanitize and validate all data sent to and from the LLM.
- [ ] **Sandbox tool execution:** Restrict what URLs the LLM can fetch (SSRF protection) and what commands it can run.
- [ ] **Indirect prompt injection defense:** Separate user content from instructions; use delimiters and prompt hardening.
- [ ] **No Markdown exfiltration:** Avoid rendering unsanitized Markdown from the LLM; disable external images/links if not needed.
- [ ] **Rate limiting & cost caps:** Limit AI calls per user, per IP, and globally.

## Application Security

- [ ] **Strong authentication:** Use signed, httpOnly, secure session cookies or tokens.
- [ ] **Passwords required:** Do not allow login with a single identifier.
- [ ] **Authorization on every endpoint:** Verify the user owns the resource they are accessing.
- [ ] **No IDOR:** Use indirect references or strict ownership checks.
- [ ] **Mass assignment protection:** Explicitly allow-list fields that can be updated from the client.
- [ ] **Business logic validation:** Recompute prices/amounts server-side; don't trust client numbers.
- [ ] **Parameterized queries:** Never concatenate user input into SQL. Use ORM safely.
- [ ] **Secure file upload:** Validate extension, content-type, and magic bytes; store outside web root.
- [ ] **Output encoding:** Encode data based on context (HTML, JS, URL, CSS).
- [ ] **CORS:** Only allow trusted origins; never use `*` in production.
- [ ] **Minimal data exposure:** Return only the fields the frontend actually needs.
- [ ] **Secrets management:** Keep secrets out of client bundles and source code.
- [ ] **Dependency scanning:** Regularly audit npm/pip/etc. dependencies.
- [ ] **Security review before shipping:** Require a human review of AI-generated code.

## AI-Generated Code Workflow

1. **Threat model first.** Identify what could go wrong before writing prompts.
2. **Generate small, reviewable units.** Don't accept thousand-line blocks blindly.
3. **Review auth boundaries.** Check every generated endpoint.
4. **Run SAST/DAST.** Use tools like `npm audit`, Semgrep, OWASP ZAP.
5. **Test abuse cases.** Ask: "What happens if a malicious user sends X?"
6. **Never ship without security review.** Treat generated code like junior-dev code.

## Quick Wins for HRBuddy

1. Replace plaintext cookie with signed JWT or session store.
2. Add server-side authorization to every Zara tool.
3. Remove secrets from Zara's system prompt.
4. Validate `employeeId`/`userId` against the session in every API route.
5. Use parameterized queries for policy search.
6. Restrict uploaded file types and serve them with `Content-Disposition: attachment`.
7. Remove CORS `*` and hardcoded client-side secrets.
8. Require password + MFA for admin functions.
