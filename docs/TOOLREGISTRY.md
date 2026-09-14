### What is its responsibility?
The tool registry is responsible for mapping tool names to executable functions.

### What data comes in?
Local written code, generally encapsulated in a function. E.g. in this codebase, functions are written in TypeScript.

### What goes out?
Access to a function through a tool name.

### What is it explicitly not allowed to do?
It is not allowed to authorize its use, expose interal details or decide when it's used.