import type { Tool, Environment, Operation, Decision } from "./types.ts"

export interface Rule {
    tool?: Tool,
    environment?: Environment,
    operation?: Operation,
    resource?: string,

    decision: Decision,
    hardDeny?: boolean
}

export function specificity(rule: Rule): number {
    let score = 0

    if (rule.tool !== undefined) score++;
    if (rule.environment !== undefined) score++;
    if (rule.operation !== undefined) score++;
    if (rule.resource !== undefined) score++;

    return score;
}

export const rules: Rule[] = [
    {
        tool: "read_file",
        environment: "local",
        decision: "ALLOW"
    },

    {
        tool: "read_file",
        resource: ".env",
        decision: "DENY"
    },

    {
        tool: "run_tests",
        environment: "local",
        decision: "DENY"
    },

    {
        environment: "production",
        operation: "write",
        decision: "REQUIRE_APPROVAL"
    },

    {
        environment: "production",
        operation: "delete",
        decision: "DENY",
        hardDeny: true
    }
]