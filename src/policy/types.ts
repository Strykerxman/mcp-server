import type { Tool } from "../tools/toolRegistry.ts"

export type { Tool }

export type Environment =
    | "local"
    | "test"
    | "staging"
    | "production"

export type Operation =
    | "read"
    | "write"
    | "execute"
    | "delete"

export type Decision =
    | "ALLOW"
    | "DENY"
    | "REQUIRE_APPROVAL"

export type ToolRequest =
    | {
        tool: "read_file"
        environment: Environment
        operation: "read"
        args: {
            path: string
        }
    }
    | {
        tool: "run_tests"
        environment: Environment
        operation: "execute"
    }

export interface ModelTool {
    type: "function"
    name: string
    description: string
    parameters: Record<string, unknown>
    strict: boolean
}