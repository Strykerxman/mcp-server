import { readFile } from "node:fs/promises"
import * as path from "path"
import * as cf from "../policy/confinement.ts"

export async function readFileTool(filePath: string): Promise<string> {
    const filename = path.basename(filePath)

    if(cf.BLOCKED_FILES.includes(filename.toLowerCase())) {
        throw new Error("Access denied: Reading configuration or environment files is strictly prohibited.")
    }

    const targetPath = path.resolve(cf.ALLOWED_WORKSPACE, filePath)

    if(!targetPath.startsWith(cf.ALLOWED_WORKSPACE)) {
        throw new Error("Access denied: Path is outside the allowed workspace confinement.")
    }

    try { 
        return await readFile(targetPath, "utf-8")
    }
    catch (error) {
        throw new Error(`Failed to read file: ${error}`)
    }
}