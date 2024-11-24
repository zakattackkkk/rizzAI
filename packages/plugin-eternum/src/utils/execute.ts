const stepTemplate = `

{{allSteps}}

{{currentStepTitle}}

{{currentStepReasoning}}

{{worldState}}

Based on the above decide what information you need to fetch from the game. Use the schema examples and format the query accordingly to match the schema.

Decide to either invoke a query or an action.

These are the available actions you can use:
{{availableActions}}

Return the action you want to invoke and the parameters as an object like this:
\`\`\`json
{
  actionType: "invoke",
  data: {
    "tokenAddress": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    "recipient": "0x1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF",
    "amount": "0.001"
  },
  "steps": [
  { name: "1", reasoning: "this is an example" },
    {{allSteps}}
    + add any other steps or change the steps if you think it's necessary, only change steps after the current step
  ]
}
\`\`\`

Or if you want to query the game, these are the available queries you can use:
{{queriesAvailable}}

Return the query you want to invoke and the variables as an object like this:

\`\`\`json
{
  "actionType": "query",
  "data": {
    "query": "<query>",
    "variables": {
      // variables go here
    }
  },
  "steps": [
  { name: "1", reasoning: "this is an example" },
    {{allSteps}}
    + add any other steps or change the steps if you think it's necessary, only change steps after the current step
  ]
}
\`\`\`

Make sure to only return one object like above depending on the action you want to take.

`;

const defineSteps = `

Based on the goals and world state, decide what steps you need to execute to achieve the goals.

{{worldState}}

{{queriesAvailable}}

{{availableActions}}

You should return an array of steps to execute. 

Return something like this:

\`\`\`json
[
  { name: "1", reasoning: "Need to check for resources" },
  { name: "2", reasoning: "Need to check the base" },
  { name: "3", reasoning: "Need to build calldata" },
]
\`\`\`

`;

export { defineSteps, stepTemplate };
