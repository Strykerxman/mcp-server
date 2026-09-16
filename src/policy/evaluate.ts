import type { Decision, ToolRequest } from "./types.ts"
import type { Rule } from "./rules.ts"
import { specificity } from "./rules.ts"

export function evaluate(toolRequest: ToolRequest, rules: Rule[]): Decision {
    const matching: Rule[] = rules.filter(rule => matches(toolRequest, rule))

    if (matching.length === 0) return "DENY"
    if (matching.some(rule => rule.hardDeny && rule.decision == "DENY")) return "DENY"

    const maxSpecificity = Math.max(...matching.map(rule => specificity(rule)))
    const mostSpecificRules = matching.filter(rule => specificity(rule) === maxSpecificity)

    if (mostSpecificRules.some(rule => rule.decision === "DENY")) return "DENY"
    if (mostSpecificRules.some(rule => rule.decision === "REQUIRE_APPROVAL")) return "REQUIRE_APPROVAL"

    return "ALLOW"
}

export function matches(toolRequest: ToolRequest, rule: Rule): boolean {
    if (rule.tool !== undefined && toolRequest.tool !== rule.tool )
        return false

    if (rule.environment !== undefined && toolRequest.environment !== rule.environment)
        return false

    if (rule.operation !== undefined && toolRequest.operation !== rule.operation)
        return false

    if (toolRequest.tool === "read_file") {
        if(rule.resource !== undefined && toolRequest.args.path !== rule.resource) {
            return false
        }
    }

    return true
}