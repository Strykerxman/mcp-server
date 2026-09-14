### What is its responsibility?
The policy is responsible for deciding if a tool can go through given parameters like a path.
A tool is evaluated through a set of hardcoded rules and a decision is returned.

### What data comes in?
A tool request that has the name of the tool, its parameters and the desired environment.

### What goes out?
A decision, either `ALLOW`, `DENY` or `REQUIRE_APPROVAL`.

### What is it explicitly not allowed to do?
It is not allowed to authenticate the caller or if it exists in the server tool registry.
It is not allowed to run a tool or decide when it's ran. It simply authorizes its use given a request.
