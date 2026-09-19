import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4"
import * as path from "path"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { fileURLToPath } from "url"

import { toolRegistry } from "./tools/toolRegistry.ts"
import type { ToolRequest } from "./policy/types.ts";
import { authorize } from "./policy/authorize.ts";

export const server = new McpServer({
    name: "secure-dev-tools-mcp-server",
    version: "1.0.0"
})

server.registerTool(
    "run_tests",
    {
        description: "Run the predefined test suite for the current project",
        inputSchema: z.object({}),
    },
    async () => {
        const request: ToolRequest = {
            tool: "run_tests",
            environment: "local",
            operation: "execute"
        }

        authorize(request) // returns silently when allowed, throws if denied or approval is required

        const result = await toolRegistry.run_tests(getWorkspacePath())
        const output = [
            `Exit code: ${result.exitCode}`,
            "",
            "STDOUT:",
            result.stdout || "(empty)",
            "",
            "STDERR:",
            result.stderr || "(empty)"
        ].join("\n")

        return { content: [{ type: 'text', text: output }] }
    }
)

server.registerTool(
    "read_file",
    {
        description: "Read the contents of a file in UTF-8",
        inputSchema: z.object({ path: z.string() }),
    },
    async ({path}) => {
        const request: ToolRequest = {
            tool: "read_file",
            environment: "local",
            operation: "read",
            args: {
                path: path
            }
        }

        authorize(request)
        
        const fileContents = await toolRegistry.read_file(getWorkspacePath(), path)
        return { content: [{type: 'text', text: fileContents}]}
    }
)

function getWorkspacePath() {
    const currFileURL = import.meta.url
    const currFilePath = fileURLToPath(currFileURL)
    let currDir = path.dirname(currFilePath) // src

    return path.resolve(currDir, "..") // project root
}

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(error => {
    console.error("Server failed:", error);
    process.exit(1);
})