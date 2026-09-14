### What is its responsibility?
It is responsible for orchestrating the interaction between the user prompt, the AI model and the MCP tools. It sends available tools to the model, handles requested tool calls, returns tool results and produces AI's final output.

### What data comes in?
A user prompt (currently hardcoded) and a list of tools coming from the MCP server's API 

### What goes out?
The AI model's response to a prompt

### What is it explicitly not allowed to do?
It is not allowed to execute local tool implementations, bypass MCP or make authorization decisions.

### Summary (own words w/o looking again)
The `agent.ts` file is responsible for managing how an AI agent uses MCP tools to respond to a user prompt. It gives the model access to a list of tools, it handles tool calls if needed and adds the tool's output to the agent's context. The AI model then makes a final response given new context provided by tools.
This file does not directly run local tool implementations, it does not authorize tool calls and it does not leave MCP.