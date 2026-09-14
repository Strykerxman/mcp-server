import { exec } from "node:child_process";
import { promisify } from "node:util";

const execPromise = promisify(exec);

export async function runTestsTool(cwd: string): Promise<string> { 
    const { stdout, stderr } = await execPromise(
        "npm test",
        { cwd }
    );

    if (stderr) {
        console.error(stderr);
    }

    return stdout;
}