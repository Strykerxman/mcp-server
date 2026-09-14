import { runTestsTool } from "./runTests.ts"
import { readFileTool } from "./readFile.ts"

export const toolRegistry = {
    read_file: readFileTool,
    run_tests: runTestsTool
} as const

export type Tool = keyof typeof toolRegistry