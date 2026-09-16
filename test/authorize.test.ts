import test from "node:test"
import assert from "node:assert/strict"

import { authorize } from "../src/policy/authorize.ts"

test("authorize allows permitted requests", () => {
    assert.doesNotThrow(() => {
        authorize({
            tool: "read_file",
            environment: "local",
            operation: "read",
            args: {
                path: "package.json"
            }
        })
    })
})

test("authorize throws for denied requests", () => {
    assert.throws(
        () => {
            authorize({
                tool: "read_file",
                environment: "local",
                operation: "read",
                args: {
                    path: ".env"
                }
            })
        },
        /denied/i
    )
})

test("authorize throws for approval requests", () => {
    assert.throws(
        () => {
            authorize({
                tool: "run_tests",
                environment: "production",
                operation: "execute"
            })
        },
        /approval/i
    )
})

test("authorize returns allowed requests", () => {
    assert.doesNotThrow(
        () => {
            authorize({
                tool: "run_tests",
                environment: "local",
                operation: "execute"
            })
        }
    )
})