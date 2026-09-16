import test from "node:test"
import assert from "node:assert/strict"
import { closeMcp, connect, useTool } from "../src/client.ts"

test("MCP read_file returns package.json", async () => {
    const client = await connect()

    try {
        const result = await useTool(
            client,
            "read_file",
            { path: "package.json" }
        )

        const first = result.content[0]

        if (first.type !== "text") {
            assert.fail("Expected text content")
        }

        assert.match(first.text, /"version": "1\.0\.0"/)
    }
    finally {
        await closeMcp(client)
    }
})

test("MCP read_file denies .env read", async () => {
    const client = await connect()

    try {
        const result = await useTool(
            client,
            "read_file",
            { path: ".env"}
        )
        
        assert.equal(result.isError, true)
        assert.match(JSON.stringify(result.content), /denied/i)
    }
    finally {
        await closeMcp(client)
    }
})