import OpenAI from "openai"
import { closeMcp, connect, listMcpTools, useTool } from "./client.ts"
import type { ResponseInputItem } from "openai/resources/responses/responses.js"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const MODEL = "gpt-5.4-nano"
const MAX_TOOL_ROUNDS = 5
const client = await connect()
const DEMO_PROMPT = [
    "Inspect this project using the available tools.",
    "First, run the test suite.",
    "Then read package.json.",
    "Summarize whether the tests passed and list the available npm scripts.",
    "Report each tool you called and its arguments.",
    "Do not request environment files, secrets or files outside of this project."
].join("\n")

try {
    const modelTools = await listMcpTools(client)

    let input: ResponseInputItem[] = [{
            role: "user",
            content: [{
                type: "input_text",
                text: DEMO_PROMPT
            }]
    }]

    let response = await openai.responses.create({
        model: MODEL,
        tools: modelTools,
        input
    })

    let function_calls = response.output.filter(item => item.type === "function_call")
    let toolRound = 0

    while(function_calls.length > 0) { // run tools until the model doesnt need to make function calls.
        if (toolRound >= MAX_TOOL_ROUNDS) throw new Error(`Model exceeded the maximum of ${MAX_TOOL_ROUNDS} tool rounds.`)
        toolRound++

        let toolOutputs: ResponseInputItem[] = [] // empty array for passing tool outputs as inputs

        for(const call of function_calls) {
            if(!modelTools.some(tool => tool.name === call.name)) throw new Error(`Unsupported tool: ${call.name}`)

            const args = parseToolArguments(call.name, call.arguments)
            const toolResult = await useTool(
                client,
                call.name,
                args
            )

            toolOutputs.push({
                type: "function_call_output",
                call_id: call.call_id,
                output: JSON.stringify(toolResult)
            })
        }

        response = await openai.responses.create({
            model: MODEL,
            tools: modelTools,
            previous_response_id: response.id,
            input: toolOutputs
        })

        function_calls = response.output.filter(item => item.type === "function_call")  
    }
    
    console.log(response.output_text)

} finally {
    await closeMcp(client)
}

function parseToolArguments(toolName: string, rawArgs: string): Record<string, unknown> {
    let parsed: unknown

    try {
        parsed = JSON.parse(rawArgs)
    }
    catch (error) {
        throw new Error(
            `Model returned invalid JSON arguments for tool "${toolName}".`,
            { cause: error }
        )
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error(`Model returned non-object arguments for tool "${toolName}".`)
    }

    return parsed as Record<string, unknown>
}