import * as path from "path"
export { ALLOWED_WORKSPACE, BLOCKED_FILES}

const ALLOWED_WORKSPACE = path.resolve(process.cwd())
const BLOCKED_FILES = [".env", ".env.local", ".env.docker", ".env.dev", ".env.development", ".env.prod", ".env.production"]
