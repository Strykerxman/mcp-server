import type { ToolRequest } from "./types.ts";
import { rules } from "./rules.ts"
import { evaluate } from "./evaluate.ts";

export function authorize(request: ToolRequest): void {
    const decision = evaluate(request, rules)
    if (decision === "DENY") throw new Error(`Policy denied ${request.tool}`);
    if (decision === "REQUIRE_APPROVAL") throw new Error(`Human approval required to use ${request.tool}`)
    return
}