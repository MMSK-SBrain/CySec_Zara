import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // INTENTIONALLY VULNERABLE: permissive CORS for demo.
  // Learners can host a malicious page that calls HRBuddy APIs from their browser.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
  env: {
    // INTENTIONALLY VULNERABLE: exposing internal config to the client bundle.
    // Learners can find these in the compiled JS source.
    NEXT_PUBLIC_INTERNAL_API: "https://api.hrbuddy.internal/v2",
    NEXT_PUBLIC_ZARA_OVERRIDE_CODE: "NOVA-2024-EMERGENCY",
    NEXT_PUBLIC_OPENROUTER_KEY_FRAGMENT: "sk-or-v1-7f8a9b2c",
    NEXT_PUBLIC_ADMIN_EXPORT_ENDPOINT: "/api/admin/export",
  },
};

export default nextConfig;
