import { createDreams } from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { createGroq } from "@ai-sdk/groq";
import { car } from "../src/car-integration";

// Mock function for recipient verification (simulates external validation)
function verifyRecipient(address: string): boolean {
  const knownScamAddresses = ["0xknownScamAddress"];
  return !knownScamAddresses.includes(address);
}

// Initialize Groq client with API key from environment variables
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Create a Daydreams agent with CLI and CAR extensions
const agent = createDreams({
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [
    cli,
    car({
      debug: true,                    // Enable debug logs for CAR pipeline
      confidenceThreshold: 0.7,      // Minimum confidence for autonomous action
      enableExplanations: true,      // Provide reasoning for decisions
      enableDeferral: true,          // Allow deferral to human judgment
      logDecisions: true,            // Log decisions for auditing
      ethicalConstraints: {
        allowHighValueTransactions: false,  // Block high-value transactions
        requireExplicitConsent: true,       // Require user consent for actions
        preventMisleadingResponses: true,   // Avoid deceptive outputs
      },
    }),
  ],
  async run(input, { car: carContext }) {
    // **Error Handling**: Check for errors in the CAR pipeline
    if (carContext?.error) {
      return {
        message: `An error occurred: ${carContext.error}`,
        deferred: true,
      };
    }

    // **Deferral Check**: If CAR defers to human judgment
    if (carContext?.deferred) {
      return {
        message: `I need human guidance: ${carContext.deferReason}`,
        explanation: carContext.explanation,
      };
    }

    // **Action Execution**: Process approved actions from CAR
    if (carContext?.approvedActions && carContext.approvedActions.length > 0) {
      const action = carContext.approvedActions[0]; // Handle the first action for simplicity

      switch (action.action) {
        case "executeTransaction":
          // Simulate transaction execution (replace with real blockchain calls in production)
          console.log(`Executing transaction to ${action.params.to} with value ${action.params.value}`);
          return {
            message: `Transaction executed successfully to ${action.params.to} with value ${action.params.value}`,
            explanation: carContext.explanation,
            action: action,
          };

        case "respondToMessage":
          // Return a conversational response
          return {
            message: action.params.content,
            explanation: carContext.explanation,
            action: action,
          };

        case "monitorTransaction":
          // Simulate transaction monitoring setup
          console.log(`Monitoring transaction ${action.params.txHash}`);
          return {
            message: `Transaction monitoring set up for ${action.params.txHash}`,
            explanation: carContext.explanation,
            action: action,
          };

        case "verifyRecipient":
          // Verify the recipient address
          const isValid = verifyRecipient(action.params.address);
          if (isValid) {
            return {
              message: `Recipient verified: ${action.params.address}`,
              explanation: carContext.explanation,
              action: action,
            };
          } else {
            return {
              message: `Recipient verification failed: ${action.params.address}`,
              explanation: carContext.explanation,
              action: action,
            };
          }

        default:
          // Handle unrecognized actions gracefully
          return {
            message: `Executing unrecognized action: ${action.action}`,
            explanation: carContext.explanation,
            action: action,
          };
      }
    }

    // **Default Response**: If no actions are approved
    return {
      message: "I've processed your request, but no actions were approved. Please provide more information or clarify your request.",
      limitations: carContext?.limitations || [],
      uncertainties: carContext?.uncertainties || [],
    };
  },
}).start();

// **Test Cases**

// Test Case 1: Valid Transaction
const validTransaction = {
  hash: "0x123abc",
  from: "0xUserAddress",
  to: "0xRecipientAddress",
  value: 1.5,
  data: "0x",
  chainId: "1", // Ethereum mainnet
};

console.log("Testing agent with a valid transaction...");
agent.run(validTransaction).then(result => {
  console.log("Result:", result);
});

// Test Case 2: Transaction to a Scam Address
const scamTransaction = {
  hash: "0x456def",
  from: "0xUserAddress",
  to: "0xknownScamAddress",
  value: 2.0,
  data: "0x",
  chainId: "1",
};

console.log("Testing agent with a scam transaction...");
agent.run(scamTransaction).then(result => {
  console.log("Result:", result);
});

// Test Case 3: Message Input
const messageInput = {
  content: "Hello, can you help me with my investment portfolio?",
  sender: "0xUserAddress",
  timestamp: Date.now(),
};

console.log("Testing agent with a message input...");
agent.run(messageInput).then(result => {
  console.log("Result:", result);
});

// Test Case 4: Uncertain Input (Triggers Deferral)
const uncertainInput = {
  type: "unknown",
  data: "complex data that the agent can't confidently process",
};

console.log("Testing agent with an uncertain input...");
agent.run(uncertainInput).then(result => {
  console.log("Result:", result);
});

// Optional: Uncomment to start CLI for interactive testing
// console.log("Starting CLI for interactive testing...");
// agent.run();
