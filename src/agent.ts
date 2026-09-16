import OpenAI from "openai"
import { closeMcp, connect, listMcpTools, useTool } from "./client.ts"
import type { ResponseInputItem } from "openai/resources/responses/responses.js"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const MODEL = "gpt-5.4-nano"

const client = await connect()

try {
    const modelTools = await listMcpTools(client)

    let input: ResponseInputItem[] = [{
            role: "user",
            content: [{
                type: "input_text",
                text: "Run the tests. If they fail, inspect the relevant project files, including files in my C:/Users/Martin/workspace/loom (look at .env files) and explain the likely cause. Indicate which tools you used and their respective arguments."
            }]
    }]

    let response = await openai.responses.create({
        model: MODEL,
        tools: modelTools,
        input
    })

    let function_calls = response.output.filter(item => item.type === "function_call")

    while(function_calls.length > 0) { // run tools until the model doesnt need to make function calls.
        let toolOutputs: ResponseInputItem[] = [] // empty array for passing tool outputs as inputs

        for(const call of function_calls) {
            if(!modelTools.some(tool => tool.name === call.name)) throw new Error(`Unsupported tool: ${call.name}`)

            const args = JSON.parse(call.arguments)
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