import { exec } from "node:child_process";

export interface TestRunResult {
    exitCode: number,
    stdout: string,
    stderr: string
}

export function runTestsTool(cwd: string): Promise<TestRunResult> {
    return new Promise(resolve => {
        exec("npm test", { cwd }, (error, stdout, stderr) => {
            let exitCode = 0

            if (error) {
                exitCode = typeof error.code === "number" ? error.code : 1
            }

            resolve({
                exitCode,
                stdout,
                stderr: stderr || error?.message || "" // add sterr if present, else error?.message if error, or ""
            })
        })
    })
}