import { OrchestrationClient } from '@sap-ai-sdk/orchestration'

const orchestrationClient = new OrchestrationClient({
    llm: {
        model_name: 'gpt-4o'
    },
    templating: {
        template: [
            { role: 'system', content: `You are a quiz generator bot. 
                    You are given a topic and you need to generate a JSON with questions and answers. 
                    The schema is as follows.\n {{?schema}} \n\n
                    There should be 5 questions, each question has 4 answer options, 
                    and only 1 single answer should be correct (no multiple choice). 
                    Keep it short - each answer should not be longer than 80 characters.` },
            { role: 'user', content: 'Make me a quiz about {{?topic}}' }
        ]
    }
})

const response = await orchestrationClient.chatCompletion({
    inputParams: {
        schema: '[{ "text": "what is AIOps", "answers": [{ "text": "applying DevOps principles to AI", correct: false }, { "text": "applying AI to DevOps", correct: true }] },]',
        topic: 'AIOps'
    }
})

console.log(response.getContent())
