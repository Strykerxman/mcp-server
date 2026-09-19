import { readFile } from "node:fs/promises"
import * as path from "path"

import { BLOCKED_FILES } from "../policy/rules.ts"

export async function readFileTool(workspace: string, filePath: string): Promise<string> {
    const filename = path.basename(filePath)

    if(BLOCKED_FILES.includes(filename.toLowerCase())) { // ensure not trying to find .env
        throw new Error("Access denied: Reading configuration or environment files is strictly prohibited.")
    }

    // ex. allowed workspace = C:/Users/user/MCP
    const targetPath = path.resolve(workspace, filePath) // if something supplies ../MCP-evil-path/evil.txt
    // resolves to C:/Users/user/MCP-evil-path/evil.txt

    if(targetPath !== workspace && !targetPath.startsWith(workspace + path.sep)) {
        // C:/Users/user/MCP-evil-path/evil.txt !== C:/Users/user/MCP && C:/Users/user/MCP-evil-path/evil.txt doesnt start with C:/Users/user/MCP/ so it escaped!
        throw new Error("Access denied: Path is outside the allowed workspace confinement.")
    }

    try { 
        return await readFile(targetPath, "utf-8")
    }
    catch (error) {
        throw new Error(`Failed to read file: ${error}`)
    }
}