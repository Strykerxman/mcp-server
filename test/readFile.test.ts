import test from "node:test"
import assert from "node:assert/strict"
import * as path from "node:path"
import { readFileTool } from "../src/tools/readFile.ts"

const TEST_WORKSPACE = process.cwd()

test("[TOOL] readFileTool reads a file inside the workspace", async () => {
    const result = await readFileTool(TEST_WORKSPACE, "package.json")

    assert.match(result, /"name": "003_secure_dev_mcp"/)
})

test("[TOOL] readFileTool blocks environment files (.env)", async () => {
    await assert.rejects(
        () => readFileTool(TEST_WORKSPACE, ".env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})

test("[TOOL] readFileTool blocks environment files (.env.local)", async () => {
    await assert.rejects(
        () => readFileTool(TEST_WORKSPACE, ".env.local"),
        /Reading configuration or environment files is strictly prohibited/
    )
})

test("[TOOL] readFileTool blocks environment files in nested paths", async () => {
    await assert.rejects(
        () => readFileTool(TEST_WORKSPACE, "some/folder/.env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})

test("[TOOL] readFileTool rejects traversal outside workspace", async () => {
    await assert.rejects(
        () => readFileTool(TEST_WORKSPACE, "../outside.txt"),
        /Path is outside the allowed workspace confinement/
    )
})

test("[TOOL] readFileTool rejects a similarly named sibling workspace", async () => {
    const siblingPath = path.join(
        "..",
        `${path.basename(TEST_WORKSPACE)}_evil`,
        "secret.txt"
    )

    await assert.rejects(
        () => readFileTool(TEST_WORKSPACE, siblingPath),
        /Path is outside the allowed workspace confinement/
    )
})

test("[TOOL] blocked-file protection runs before path confinement", async () => {
    await assert.rejects(
        () => readFileTool(TEST_WORKSPACE, "../.env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})