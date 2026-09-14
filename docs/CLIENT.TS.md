### What is its responsibility?
Provide communication for connecting to the server, list & use its tools and then disconnect.

### What data comes in?
A request like connect, list tools and calling a named tool with arguments.

### What goes out?
Functions the agent uses to communicate with the MCP server, tool definitions and tool-call outputs.

### What is it explicitly not allowed to do?
It is not allowed to authorize tool use or decide when to use it.

### Summary
The client enables communication with the MCP server. It can make a request to that server, get an answer and then pass it to the agent. 