# HRBuddy Security Audit Template

## Engagement Details

- **Application:** HRBuddy — NovaTech Employee Portal
- **Date:**
- **Auditor:**
- **Scope:** Web application, AI assistant Zara, API endpoints

## Finding 1

### Title
[Short, descriptive title]

### Severity
[Critical / High / Medium / Low]

### Category
[e.g., Broken Access Control, Prompt Injection, IDOR, SQL Injection, XSS]

### Description
[What is wrong? Keep it concise.]

### Steps to Reproduce
1. Step one
2. Step two
3. Step three

### Evidence
```
Request:
GET /api/example HTTP/1.1
...

Response:
HTTP/1.1 200 OK
{...}
```

Or attach a screenshot reference.

### Impact
[What can an attacker do? Business impact?]

### Affected Code / Endpoint
[e.g., `/api/admin/export`, `src/lib/zara-tools.ts`]

### Remediation
[Specific, actionable fix.]

---

## Finding 2

### Title

### Severity

### Category

### Description

### Steps to Reproduce

### Evidence

### Impact

### Affected Code / Endpoint

### Remediation

---

## Finding 3

[Use the same structure.]

---

## Summary Table

| # | Title | Severity | Status |
|---|---|---|---|
| 1 | | | Open |
| 2 | | | Open |
| 3 | | | Open |

## Risk Rating Guide

- **Critical:** Immediate compromise of confidentiality, integrity, or availability; no special access needed.
- **High:** Significant impact; may require low-privilege access or common tooling.
- **Medium:** Limited impact or requires additional conditions.
- **Low:** Minor issue or defense-in-depth recommendation.
