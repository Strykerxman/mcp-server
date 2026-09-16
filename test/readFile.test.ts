import test from "node:test"
import assert from "node:assert/strict"

import { readFileTool } from "../src/tools/readFile.ts"

test("readFileTool reads a file inside the workspace", async () => {
    const result = await readFileTool("package.json")

    assert.match(result, /"name": "003_secure_dev_mcp"/)
})

test("readFileTool blocks environment files (.env)", async () => {
    await assert.rejects(
        () => readFileTool(".env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})

test("readFileTool blocks environment files (.env.local)", async () => {
    await assert.rejects(
        () => readFileTool(".env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})

test("readFileTool blocks environment files in nested paths", async () => {
    await assert.rejects(
        () => readFileTool("some/folder/.env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})

test("readFileTool rejects traversal outside workspace", async () => {
    await assert.rejects(
        () => readFileTool("../outside.txt"),
        /Path is outside the allowed workspace confinement/
    )
})

test("blocked-file protection runs before path confinement", async () => {
    await assert.rejects(
        () => readFileTool("../.env"),
        /Reading configuration or environment files is strictly prohibited/
    )
})