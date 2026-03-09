import fs from "fs";
import { getProvider } from "../providers/index.js";
import { resolveProjectPath, getFileTreeAsString } from "../context/workspace.js";
/**
 * Generate file content for a single plan step by making an AI API call.
 * Only used for "create" and "edit" steps.
 */
export async function generateStepContent(step, planSummary, allSteps) {
    const provider = getProvider();
    const messages = [
        { role: "system", content: buildStepPrompt(step, planSummary, allSteps) },
        { role: "user", content: `Generate the complete file content for: ${step.description}` },
    ];
    let content = "";
    const stream = provider.chat(messages);
    for await (const event of stream) {
        if (event.type === "text_delta") {
            content += event.content;
        }
    }
    // Strip markdown code fences if the AI wraps the output
    content = stripCodeFences(content);
    return content;
}
function buildStepPrompt(step, planSummary, allSteps) {
    const parts = [];
    parts.push("You are a code generator. Output ONLY the complete file content. No explanations, no markdown fences, no comments about what you're doing. Just the raw file content.");
    parts.push(`\n## Overall Plan: ${planSummary}`);
    // Show all steps for context
    const stepsOverview = allSteps
        .map((s, i) => `${i + 1}. [${s.type.toUpperCase()}] ${s.target} -- ${s.description}`)
        .join("\n");
    parts.push(`\n## All Steps:\n${stepsOverview}`);
    parts.push(`\n## Current Step: [${step.type.toUpperCase()}] ${step.target}\n${step.description}`);
    // For edit steps, include the current file content
    if (step.type === "edit") {
        const absPath = resolveProjectPath(step.target);
        if (absPath && fs.existsSync(absPath)) {
            const currentContent = fs.readFileSync(absPath, "utf-8");
            parts.push(`\n## Current File Content (${step.target}):\n${currentContent}`);
        }
    }
    // Include file tree for import reference
    const fileTree = getFileTreeAsString();
    if (fileTree && fileTree !== "(file tree not loaded)") {
        const trimmed = fileTree.length > 3000 ? fileTree.slice(0, 3000) + "\n... (truncated)" : fileTree;
        parts.push(`\n## Project File Tree:\n${trimmed}`);
    }
    parts.push("\n## Instructions:\nOutput ONLY the complete file content. No markdown fences. No explanations. Start directly with the file content.");
    return parts.join("\n");
}
function stripCodeFences(content) {
    // Remove leading ```language and trailing ```
    const fenceRegex = /^```\w*\n([\s\S]*?)\n```$/;
    const match = content.trim().match(fenceRegex);
    if (match)
        return match[1];
    // Also handle if it starts with ``` but doesn't have clean ending
    if (content.trim().startsWith("```")) {
        const lines = content.trim().split("\n");
        // Remove first line (```lang) and last line if it's ```
        if (lines[0].match(/^```\w*$/))
            lines.shift();
        if (lines[lines.length - 1]?.trim() === "```")
            lines.pop();
        return lines.join("\n");
    }
    return content;
}
//# sourceMappingURL=step-generator.js.map