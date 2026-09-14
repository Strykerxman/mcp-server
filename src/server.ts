import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4"
import { toolRegistry } from "./tools/toolRegistry.ts"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import type { ToolRequest } from "./policy/types.ts";
import { authorize } from "./policy/authorize.ts";

const WORKSPACE_ROOT = process.cwd()

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

        const testOutputs = await toolRegistry.run_tests(WORKSPACE_ROOT) // hardcoded workspace path where the server is running
        return { content: [{type: 'text', text: testOutputs}]}
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
        
        const fileContents = await toolRegistry.read_file(path)
        return { content: [{type: 'text', text: fileContents}]}
    }
)

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(error => {
    console.error("Server failed:", error);
    process.exit(1);
});