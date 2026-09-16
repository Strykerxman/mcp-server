import test from "node:test"
import assert from "node:assert"

import { evaluate } from "../src/policy/evaluate.ts"
import { rules } from "../src/policy/rules.ts"

test("allows reading a normal local file", () => {
    const decision = evaluate({
        tool: "read_file",
        environment: "local",
        operation: "read",
        args: {
            path: "package.json"
        }
    },rules)

    assert.equal(decision, "ALLOW")
})

test("deny reading .env files", () => {
    const decision = evaluate({
        tool: "read_file",
        environment: "local",
        operation: "read",
        args: {
            path: ".env"
        }
    }, rules)

    assert.equal(decision, "DENY")
})

test("running tests in production requires approval", () => {
    const decision = evaluate({
        tool: "run_tests",
        environment: "production",
        operation: "execute"
    }, rules)

    assert.equal(decision, "REQUIRE_APPROVAL")
})