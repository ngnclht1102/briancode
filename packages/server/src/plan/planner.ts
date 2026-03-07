import type { Plan, PlanStep } from "./types.js";

const VALID_TYPES = new Set(["create", "edit", "delete", "shell"]);

export interface ParseResult {
  plan: Plan | null;
  textBefore: string;
  textAfter: string;
  error?: string;
}

/**
 * Extract a JSON plan from AI response text.
 * Expects the plan wrapped in ```json ... ``` markers.
 */
export function parsePlan(response: string): ParseResult {
  // Find JSON code block
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/;
  const match = response.match(jsonBlockRegex);

  if (!match) {
    return { plan: null, textBefore: response, textAfter: "", error: "No JSON plan block found" };
  }

  const jsonStr = match[1];
  const matchIndex = match.index!;
  const textBefore = response.slice(0, matchIndex).trim();
  const textAfter = response.slice(matchIndex + match[0].length).trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    return { plan: null, textBefore: response, textAfter: "", error: `Invalid JSON: ${String(err)}` };
  }

  const validated = validatePlan(parsed);
  if (typeof validated === "string") {
    return { plan: null, textBefore: response, textAfter: "", error: validated };
  }

  return { plan: validated, textBefore, textAfter };
}

function validatePlan(data: unknown): Plan | string {
  if (!data || typeof data !== "object") return "Plan must be an object";

  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== "string") return "Plan must have a 'summary' string";
  if (!Array.isArray(obj.steps)) return "Plan must have a 'steps' array";
  if (obj.steps.length === 0) return "Plan must have at least one step";

  const steps: PlanStep[] = [];

  for (let i = 0; i < obj.steps.length; i++) {
    const step = obj.steps[i] as Record<string, unknown>;
    if (!step || typeof step !== "object") return `Step ${i} is not an object`;
    if (!VALID_TYPES.has(step.type as string)) {
      return `Step ${i} has invalid type: ${String(step.type)}. Must be: create, edit, delete, shell`;
    }
    if (typeof step.description !== "string") return `Step ${i} missing description`;
    if (typeof step.target !== "string") return `Step ${i} missing target`;

    steps.push({
      id: String(step.id ?? `step-${i + 1}`),
      type: step.type as PlanStep["type"],
      description: step.description,
      target: step.target,
      content: typeof step.content === "string" ? step.content : undefined,
    });
  }

  return { summary: obj.summary as string, steps };
}

/**
 * System prompt addition for plan mode.
 */
export const PLAN_MODE_PROMPT = `
When the user asks you to make changes to the codebase, follow this process:

1. First, use your tools to read relevant files and understand the current code.
2. Then, generate a structured plan as a JSON block.

Your plan MUST be wrapped in \`\`\`json markers and follow this exact format:
\`\`\`json
{
  "summary": "Brief description of what this plan does",
  "steps": [
    {
      "id": "step-1",
      "type": "create",
      "description": "Create the new component file",
      "target": "src/components/Login.tsx",
      "content": "// full file content here..."
    },
    {
      "id": "step-2",
      "type": "edit",
      "description": "Update the router to include login route",
      "target": "src/App.tsx",
      "content": "// full new file content after edits..."
    },
    {
      "id": "step-3",
      "type": "shell",
      "description": "Install required dependency",
      "target": "npm install react-hook-form"
    },
    {
      "id": "step-4",
      "type": "delete",
      "description": "Remove deprecated auth file",
      "target": "src/old-auth.ts"
    }
  ]
}
\`\`\`

Step types:
- "create": Create a new file. Include full content in the "content" field.
- "edit": Edit an existing file. Include the full new file content in the "content" field.
- "delete": Delete a file. No content needed.
- "shell": Run a shell command. The "target" field is the command.

Rules:
- Keep steps small and focused — one file per step.
- For "edit" steps, always provide the COMPLETE new file content, not just the diff.
- Explain your reasoning before the JSON block.
- The user will review and approve the plan before execution.
`.trim();
