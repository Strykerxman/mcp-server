import test from "node:test"
import assert from "node:assert/strict"

import { authorize } from "../src/policy/authorize.ts"

test("[AUTH] allows permitted requests", () => {
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

test("[AUTH] throws for denied requests", () => {
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

test("[AUTH] throws for approval requests", () => {
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

test("[AUTH] returns allowed requests", () => {
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

test("[AUTH] allows reading a normal local file", () => {
    assert.doesNotThrow(
        () => {
            authorize({
                tool: "read_file",
                environment: "local",
                operation: "read",
                args: {
                    path: "package.json"
                }
            })
        }
    )
})

test("[AUTH] denies reading .env files", () => {
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
        }
    )
})

test("[AUTH] denies reading .env.local type files", () => {
    assert.throws(
        () => {
            authorize({
                tool: "read_file",
                environment: "local",
                operation: "read",
                args: {
                    path: ".env.local"
                }
            })
        }
    )
})

test("[AUTH] denies reading some/folder/.env.local type files", () => {
    assert.throws(
        () => {
            authorize({
                tool: "read_file",
                environment: "local",
                operation: "read",
                args: {
                    path: "some/folder/.env.local"
                }
            })
        }
    )
})

test("[AUTH] running tests in production requires approval", () => {
    assert.throws(
        () => {
            authorize({
                tool: "run_tests",
                environment: "production",
                operation: "execute"
            })
        }
    )
})