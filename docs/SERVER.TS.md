### What is its responsibility?
It is responsible for exposing local capabilities through an MCP server. It handles the tool request creation, the authorization and the execution -- the `request` -> `authorize` -> `run` pipeline.

### What data comes in?
MCP tool-call requests containing a tool name and arguments. The server is configured with tool schemas, policy logic and local tool implementations.

### What goes out?
MCP tool definitions and MCP responses containing tool outputs or authorization/errors during execution.

### What is it explicitly not allowed to do?
It is not allowed to decide whether a model should use a tool or generate the final AI response. It only handles requested MCP operations and enforces authorization before execution.

### Summary
The `server.ts` file is responsible for running a pipeline that takes a tool request, authorizes it and runs it if allowed. It takes in a tool request and returns the tool's output. It basically exposes capabilities and enforces authorization.