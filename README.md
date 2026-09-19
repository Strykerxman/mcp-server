# Secure Dev MCP — learning project

A small TypeScript project for learning the basic boundaries of an MCP system: an agent, an MCP client, an MCP server, a policy layer, a tool registry, and two deliberately simple local tools.

> [!IMPORTANT]
> This is an educational project, not a production security boundary or a general-purpose development agent. The word **secure** describes the ideas being explored—default-deny policy, authorization before execution, workspace confinement, and tests—not a claim that the implementation is hardened.

The scope is intentionally frozen. The project exists to explain and test the current design, not to accumulate features.

## What it demonstrates

- exposing local capabilities as MCP tools;
- connecting an MCP client and server over standard input/output;
- translating MCP tool definitions into OpenAI function tools;
- keeping model orchestration separate from tool execution;
- authorizing every server-side tool call before dispatch;
- resolving overlapping rules with explicit precedence;
- adding capability-specific checks inside a file-reading tool; and
- testing the policy, authorization wrapper, tool implementation, and MCP boundary.

The server exposes only:

| Tool | Input | Current behavior |
| --- | --- | --- |
| `run_tests` | none | Runs the fixed command `npm test` in the project directory derived from `src/server.ts`, then returns its exit code, stdout, and stderr. |
| `read_file` | `{ "path": string }` | Reads a UTF-8 file after policy and file-confinement checks. |

## Architecture

The central server pipeline is:

```text
MCP request -> validate arguments -> authorize -> dispatch -> execute -> MCP result
```

### Responsibility boundaries

| Part | Responsibility | Explicitly does not do |
| --- | --- | --- |
| `src/agent.ts` | Gives the model the available tools, validates requested calls, forwards valid calls through the MCP client, returns tool results or call errors to the model, and prints the final answer. | It does not import or execute local tool implementations and does not make policy decisions. |
| `src/client.ts` | Starts the server process, connects over stdio, lists tools, converts their schemas to OpenAI function definitions, calls tools, and closes the connection. | It does not decide when a tool should be used or whether a call is authorized. |
| `src/server.ts` | Registers MCP tools, constructs typed authorization requests, enforces authorization, and dispatches allowed calls. | It does not choose tools or generate an AI response. |
| `src/policy/*` | Represents requests and rules, evaluates matching rules, and turns non-allow decisions into errors. | It does not authenticate callers, validate registry membership, or execute tools. |
| `src/tools/toolRegistry.ts` | Maps stable tool names to local implementations. | It does not perform policy evaluation or model orchestration. |
| `src/tools/*` | Performs the actual local capability. `read_file` also applies capability-specific checks as a second layer. | It should not decide whether the model needs the capability. |

This separation is the main lesson of the project: the model may **request** a capability, but only the server may authorize and execute it.

## Request flow

1. `agent.ts` connects through `client.ts`.
2. `client.ts` starts `src/server.ts` with a stdio transport.
3. The client asks the server for its MCP tool definitions.
4. The agent presents those definitions to the OpenAI Responses API.
5. When the model emits a function call, the agent checks that the advertised tool name exists and parses its arguments as a JSON object.
6. Valid calls are sent through MCP; call-processing errors are instead converted into `function_call_output` messages so the model can correct and retry them.
7. For an MCP call, the server creates a `ToolRequest` and calls `authorize`.
8. `authorize` matches that request against the rules and resolves the policy decision.
9. Only an `ALLOW` decision reaches the registry and local implementation.
10. The MCP result is returned to the model as a `function_call_output`.
11. The loop continues until the model returns no further function calls, then the final text is printed. Attempting a sixth tool-call round terminates the demo with an error.

The prompt currently hardcoded in `agent.ts` is a portable project-inspection demonstration: it asks the model to run the tests, read `package.json`, summarize the result and available scripts, and report its tool calls. Malformed or non-object arguments become error outputs rather than terminating the whole loop, allowing the model to retry within the round limit.

## Policy model

A request contains a tool, environment, operation, and—when required—arguments. A rule may constrain the tool, environment, operation, and resource, then returns one of:

- `ALLOW`
- `DENY`
- `REQUIRE_APPROVAL`

Evaluation follows these rules:

1. no matching rule means `DENY`;
2. any matching hard-deny rule wins immediately;
3. otherwise, only the matching rules with the highest specificity are considered; and
4. ties resolve in the order `DENY`, `REQUIRE_APPROVAL`, then `ALLOW`.

Specificity is the number of constrained fields on a rule. This makes a narrow rule override a broad one without relying on array order.

The current policy allows local file reads and local test execution. `rules.ts` also defines the blocked environment-file basenames and generates a deny rule for each one. Both authorization and `readFileTool` normalize requested basenames to lowercase and use this shared list. The policy also includes production examples for approval and hard denial. The write/delete production examples are not reachable through the current `ToolRequest` union because no write or delete tool exists; they demonstrate policy vocabulary rather than an exposed capability.

`REQUIRE_APPROVAL` is also only a decision value in this project. There is no interactive approval workflow: `authorize` turns that decision into an error, so the operation does not run.

## File layout

```text
.
├── docs/                       # Original responsibility notes
├── src/
│   ├── agent.ts                # Optional model/tool orchestration demo
│   ├── client.ts               # MCP client and OpenAI tool adaptation
│   ├── server.ts               # MCP server and authorization boundary
│   ├── policy/
│   │   ├── authorize.ts        # Matches rules, resolves decisions, and enforces them
│   │   ├── rules.ts            # Declarative rules and blocked basenames
│   │   └── types.ts            # Request, decision, and model-tool types
│   └── tools/
│       ├── readFile.ts          # UTF-8 file reader with local checks
│       ├── runTests.ts          # Fixed npm test command
│       └── toolRegistry.ts      # Name-to-implementation map
├── test/
│   ├── fixtures/
│   │   └── failing-tests/      # Deliberately failing npm test fixture
│   ├── authorize.test.ts
│   ├── mcpIntegration.test.ts
│   ├── readFile.test.ts
│   └── runTests.test.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Requirements and commands

The installed OpenAI SDK requires Node.js 22 or newer. The MCP v2 packages require Node.js 20 or newer, so **Node.js 22+** is the effective project requirement.

```bash
npm install
npm test
npm run typecheck
```

Start only the stdio server with:

```bash
npm run dev
```

A stdio MCP server normally appears idle when started by itself; it expects protocol messages from an MCP client, and stdout is reserved for those messages.

Run the optional agent demo with an API key in the environment:

```bash
OPENAI_API_KEY=your_key_here npm exec tsx -- src/agent.ts
```

PowerShell equivalent:

```powershell
$env:OPENAI_API_KEY = "your_key_here"
npm exec tsx -- src/agent.ts
```

Do not commit API keys or place them in source code.

## Tests

The test suite currently checks:

- allowed, denied, and approval authorization outcomes;
- policy decisions for representative requests;
- reading a file inside the workspace;
- blocking selected environment-file basenames;
- rejecting basic traversal and similarly named sibling-workspace paths;
- preserving the exit code, stdout, and stderr from a deliberately failing test command; and
- successful and denied `read_file` calls across a real MCP stdio connection.

Run it with `npm test`. Type-check source and tests with `npm run typecheck`.

Passing tests show that the covered examples behave as expected; they do not prove that the process is sandboxed or that all path forms are safe.

## Security boundaries and known limitations

The project deliberately keeps its threat model small:

- The server is a local child process using stdio. It has no remote transport, caller authentication, user isolation, or network authorization layer.
- Tools run with the same operating-system permissions as the Node.js process.
- `run_tests` executes project-controlled package scripts. Although its command is fixed, those scripts are code execution and should only be run in a trusted workspace.
- Workspace confinement resolves the target and accepts only the workspace root or paths beginning with the root plus a platform path separator. This prevents lexical `..` traversal and similarly named sibling-directory escapes.
- This lexical check does not prevent an in-workspace symbolic link from pointing outside the workspace. Symbolic-link confinement is intentionally not implemented in this learning project.
- Policy authorization and `readFileTool` share the blocked basename list from `rules.ts`; the tool repeats the check as a capability-specific safeguard.
- A blocklist of environment filenames is not a general secret-detection mechanism. Other credentials, configuration files, and unlisted dotenv variants remain readable.
- `REQUIRE_APPROVAL` does not obtain human approval; it rejects the call.
- The agent returns per-call validation and invocation errors to the model so it may retry, but the agent itself does not repair arguments and stops after five tool-call rounds.

These limitations are reasons to describe the repository as a learning model, not as a hardened sandbox.

## Packaging note

The runtime dependencies—MCP client, MCP server, OpenAI SDK, and Zod—are declared directly in `package.json`. The development dependencies—`tsx`, TypeScript, and the Node.js type declarations—are declared separately. This avoids relying on transitive, global, or parent-directory installations.

`package-lock.json` is generated by npm and records the reproducible dependency tree. To verify a clean installation, use `npm ci`, followed by `npm test` and `npm run typecheck`.

## Further reading

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
- [MCP server tools guide](https://ts.sdk.modelcontextprotocol.io/v2/servers/tools)
- [MCP client guide](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Node.js test runner](https://nodejs.org/api/test.html)

The short notes in [`docs/`](docs/) record the original responsibility exercise that led to this architecture.
