import * as path from "path"

import type { ToolRequest, Decision } from "./types.ts";
import { rules, specificity } from "./rules.ts"
import type { Rule } from "./rules.ts"

export function authorize(toolRequest: ToolRequest): void {
    // Runs the pipeline: find applicable rules, check most specific, return most important decision
    const matching: Rule[] = rules.filter(rule => matches(toolRequest, rule))
    const decision = decide(matching)

    if (decision === "DENY") throw new Error(`Policy denied ${toolRequest.tool}`);
    if (decision === "REQUIRE_APPROVAL") throw new Error(`Human approval required to use ${toolRequest.tool}`)
    return
}

export function decide(matching: Rule[]): Decision {
    // Denies if no rule matches, least-privilege
    if (matching.length === 0) return "DENY"
    if (matching.some(rule => rule.hardDeny && rule.decision == "DENY")) return "DENY"

    const maxSpecificity = Math.max(...matching.map(rule => specificity(rule)))
    const mostSpecificRules = matching.filter(rule => specificity(rule) === maxSpecificity)

    if (mostSpecificRules.some(rule => rule.decision === "DENY")) return "DENY"
    if (mostSpecificRules.some(rule => rule.decision === "REQUIRE_APPROVAL")) return "REQUIRE_APPROVAL"

    return "ALLOW"
}

function matches(toolRequest: ToolRequest, rule: Rule): boolean {
    if (rule.tool !== undefined && toolRequest.tool !== rule.tool)
        // check that a rule has a tool name and check if that name is the same as the given tool request
        // continues to next properties if name matches
        return false

    if (rule.environment !== undefined && toolRequest.environment !== rule.environment)
        return false

    if (rule.operation !== undefined && toolRequest.operation !== rule.operation)
        return false

    if (toolRequest.tool === "read_file") {
        const filename = path.basename(toolRequest.args.path).toLowerCase()

        if(rule.resource !== undefined && filename !== rule.resource) {
            return false
        }
    }

    return true
}