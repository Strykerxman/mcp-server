import test from "node:test"
import assert from "node:assert"
import * as path from "path"

import { runTestsTool } from "../src/tools/runTests.ts"

const FAILING_TEST_WORKSPACE = path.join(
    process.cwd(),
    "test",
    "fixtures",
    "failing-tests"
)

test("[TOOL] runTestsTool preserves output from failing tests",
    async () => {
        const result = await runTestsTool(FAILING_TEST_WORKSPACE)

        assert.equal(result.exitCode, 7)
        assert.match(result.stdout, /fixture stdout/)
        assert.match(result.stderr, /fixture stderr/)
    }
)