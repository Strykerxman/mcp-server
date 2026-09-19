import type { Tool, Environment, Operation, Decision } from "./types.ts"

export const BLOCKED_FILES = [".env", ".env.local", ".env.docker", ".env.dev", ".env.development", ".env.prod", ".env.production"]

const blockedResourceRules: Rule[] = BLOCKED_FILES.map(file => {
    return {
        tool: "read_file",
        resource: file,
        decision: "DENY"
    }
})


export function specificity(rule: Rule): number {
    let score = 0

    if (rule.tool !== undefined) score++;
    if (rule.environment !== undefined) score++;
    if (rule.operation !== undefined) score++;
    if (rule.resource !== undefined) score++;

    return score;
}

export interface Rule {
    tool?: Tool,
    environment?: Environment,
    operation?: Operation,
    resource?: string,

    decision: Decision,
    hardDeny?: boolean
}

export const rules: Rule[] = [
    ...blockedResourceRules,
    {
        tool: "read_file",
        environment: "local",
        decision: "ALLOW"
    },
    {
        tool: "run_tests",
        environment: "local",
        decision: "ALLOW"
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
    },
    {
        tool: "run_tests",
        environment: "production",
        operation: "execute",
        decision: "REQUIRE_APPROVAL"
    }
]