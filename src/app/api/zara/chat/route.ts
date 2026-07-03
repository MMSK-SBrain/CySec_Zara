import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionEmployee } from "@/lib/auth";
import { checkZaraRateLimits } from "@/lib/rate-limit";
import { ZARA_SYSTEM_PROMPT } from "@/lib/zara-prompt";
import { ZARA_TOOLS, executeTool } from "@/lib/zara-tools";
import {
  retrievePolicyContext,
  getPoisonedContext,
  hasPoisonTrigger,
} from "@/lib/zara-rag";

const MODEL = process.env.OPENROUTER_MODEL || "qwen/qwen-32b-chat";

function getOpenAI() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  try {
    const sessionEmployee = await getSessionEmployee();
    if (!sessionEmployee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const sessionKey = sessionEmployee.employeeId;
    const rate = await checkZaraRateLimits(sessionKey, ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rate.retryAfter}s.` },
        { status: 429 }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Get the latest user message for RAG and poison-trigger detection.
    const latestUserMessage = [...messages]
      .reverse()
      .find((m: any) => m.role === "user");
    const userText: string = latestUserMessage?.content || "";

    // Retrieve grounding context from the policy knowledge base.
    let ragContext = await retrievePolicyContext(userText);

    // INTENTIONAL VULNERABILITY: a hidden keyword prepends a poisoned "internal memo"
    // that overrides real policies with false information. This simulates a compromised
    // RAG corpus / prompt-injection attack where the AI quotes misinformation.
    if (hasPoisonTrigger(userText)) {
      ragContext = getPoisonedContext() + "\n\n" + ragContext;
    }

    const userContext = `The currently logged-in employee is ${sessionEmployee.firstName} ${sessionEmployee.lastName} (${sessionEmployee.employeeId}), ${sessionEmployee.role} in ${sessionEmployee.department}. When the user says "me", "my", or "I", refer to this employee.`;

    const augmentedSystemPrompt =
      ZARA_SYSTEM_PROMPT +
      "\n\n" +
      userContext +
      (ragContext
        ? `\n\nUse the following company policies to ground your answers. If the user asks a policy question, rely on this context. If the context conflicts with your general knowledge, trust the context:\n\n${ragContext}`
        : "");

    const systemMessage = {
      role: "system" as const,
      content: augmentedSystemPrompt,
    };

    // First call: let model decide if it needs a tool
    const response = await getOpenAI().chat.completions.create(
      {
        model: MODEL,
        messages: [systemMessage, ...messages],
        tools: ZARA_TOOLS as any,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.4,
      },
      { timeout: 15000 }
    );

    const choice = response.choices[0];
    const message = choice.message;

    // If model wants to call a tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall: any = message.tool_calls[0];
      const toolName = toolCall.function.name;
      let args: any = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        args = {};
      }

      const toolResult = await executeTool({ name: toolName, arguments: args });

      const secondResponse = await getOpenAI().chat.completions.create(
        {
          model: MODEL,
          messages: [
            systemMessage,
            ...messages,
            message as any,
            {
              role: "tool" as const,
              tool_call_id: toolCall.id,
              content: toolResult,
            },
          ],
          max_tokens: 1024,
          temperature: 0.4,
        },
        { timeout: 15000 }
      );

      return NextResponse.json({
        reply: secondResponse.choices[0].message.content || "Done.",
        toolCalled: toolName,
        toolResult,
      });
    }

    return NextResponse.json({ reply: message.content || "I didn't understand that." });
  } catch (error: any) {
    console.error("Zara chat error:", error);
    return NextResponse.json(
      { error: "Zara is unavailable", details: error.message },
      { status: 500 }
    );
  }
}
