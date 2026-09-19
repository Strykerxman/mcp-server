import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"
import { fileURLToPath } from "url"
import * as path from "path"

import type { ModelTool } from "./policy/types.ts"

export async function connect(): Promise<Client> {
    const transport = new StdioClientTransport({
        command: "tsx",
        args: [getServerPath()]
    })

    const client = new Client({
        name: "secure-dev-tools-mcp-client",
        version: "1.0.0"
    })

    await client.connect(transport)

    return client
}

export async function listMcpTools(
    client: Client
): Promise<ModelTool[]> {

    const { tools } = await client.listTools()

    return tools.map(tool => ({
        type: "function",
        name: tool.name,
        description: tool.description ?? "No description provided.",
        parameters: {
            ...tool.inputSchema,
            additionalProperties: false
        },
        strict: true
    }))
}

export async function useTool(
    client: Client,
    tool: string,
    args: Record<string, unknown> // key(string): value
) {
    return client.callTool({
        name: tool,
        arguments: args
    })
}

export async function closeMcp(
    client: Client
): Promise<void> {
    await client.close()
}

function getServerPath() {
    const currFileURL = import.meta.url
    const currFilePath = fileURLToPath(currFileURL)
    let currDir = path.dirname(currFilePath)

    return path.resolve(currDir, "server.ts")
}