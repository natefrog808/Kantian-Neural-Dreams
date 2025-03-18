# Guide to the CAR (Critique of Artificial Reason) Extension

Welcome to the guide for the **Critique of Artificial Reason (CAR)** extension! This extension brings a Kantian-inspired ethical framework to your AI agents, ensuring they make decisions that are not just smart, but also morally sound. Designed for use with the Daydreams framework, CAR is especially useful for blockchain applications or any scenario where transparency and ethics matter. Let’s get your AI a moral compass—and make sure it knows how to use it!

---

## 1. Introduction

The CAR extension enhances your Daydreams agent by adding a layered decision-making process inspired by Immanuel Kant’s philosophy. It processes inputs through four stages—sensibility, understanding, reason, and critique—to ensure ethical, transparent, and self-aware outcomes. Whether you're handling blockchain transactions or user interactions, CAR helps your AI act responsibly, deferring to humans when it’s unsure.

### Key Features
- **Layered Architecture**: Breaks down decision-making into sensible, understandable, reasoned, and critiqued steps.
- **Ethical Checks**: Applies Kant’s categorical imperative to evaluate actions.
- **Human Deferral**: Hands off decisions to humans when confidence is low or ethics are unclear.

---

## 2. Installation

### Prerequisites
- **Node.js**: Version 18 or higher.
- **Daydreams Framework**: Installed in your project.
- **LLM API Key**: Access to an LLM like Groq (via `@ai-sdk/groq`).
- **npm**: For package management.

### Steps
1. **Install Daydreams and Dependencies**:
   ```bash
   npm install daydreams @ai-sdk/groq
   ```
2. **Add the CAR Extension**:
   - Download the CAR extension files (`layers.ts`, `pipeline.ts`, `car-extension.ts`) from the official repository.
   - Place them in your project’s `extensions/` directory.
3. **Configure Your Agent**:
   Import and attach CAR to your Daydreams agent (see Usage below).

---

## 3. Usage

CAR integrates seamlessly into a Daydreams agent, modifying its decision-making process. It takes raw inputs—like user messages or blockchain transactions—and runs them through four layers:

- **Sensibility**: Structures and validates raw data.
- **Understanding**: Interprets and categorizes the data in context.
- **Reason**: Generates possible actions or responses.
- **Critique**: Evaluates the ethical implications and confidence level, deferring to humans if needed.

### Basic Setup
Here’s how to add CAR to your agent:

```javascript
import { Agent } from 'daydreams';
import { CarExtension } from './extensions/car-extension';

const agent = new Agent({
  extensions: [new CarExtension()],
});

agent.process('Send 100 tokens to Alice').then(console.log);
```

This example processes a command, evaluates its ethics, and outputs a decision or deferral.

---

## 4. Configuration

CAR offers several options to tailor its behavior. Adjust these in the `CarExtension` constructor:

| Option                  | Default   | Description                                      |
|-------------------------|-----------|--------------------------------------------------|
| `confidenceThreshold`   | `0.9`     | Minimum confidence before acting independently.  |
| `enableExplanations`    | `true`    | Provides reasoning for decisions.                |
| `enableDeferral`        | `true`    | Allows deferring to humans when uncertain.       |
| `logDecisions`          | `false`   | Logs decisions for debugging or auditing.        |
| `ethicalConstraints`    | `{}`      | Custom rules (e.g., `allowHighValueTransactions: false`). |

### Example Configuration
```javascript
const car = new CarExtension({
  confidenceThreshold: 0.95,
  enableExplanations: true,
  ethicalConstraints: { requireExplicitConsent: true },
});
const agent = new Agent({ extensions: [car] });
```

---

## 5. Examples

### Basic Example: Processing a Message
```javascript
const agent = new Agent({
  extensions: [new CarExtension()],
});

agent.process('Approve this transaction')
  .then(result => console.log(result));
// Output: { action: 'approve', explanation: 'No ethical violations detected', confidence: 0.92 }
```

### Blockchain Example: Transaction Evaluation
```javascript
const car = new CarExtension({
  ethicalConstraints: { allowHighValueTransactions: false },
});
const agent = new Agent({ extensions: [car] });

agent.process('Transfer 1000 tokens')
  .then(result => console.log(result));
// Output: { deferToHuman: true, reason: 'High-value transaction blocked' }
```

### Deferral Example: Low Confidence
```javascript
const car = new CarExtension({ confidenceThreshold: 0.95 });
const agent = new Agent({ extensions: [car] });

agent.process('Is this legal?')
  .then(result => console.log(result));
// Output: { deferToHuman: true, reason: 'Confidence below threshold: 0.87' }
```

---

## 6. Advanced Topics

### Customizing Layers
Modify the `layers.ts` file to tweak how sensibility, understanding, reason, or critique process data. For example, add custom validation in the sensibility layer:
```javascript
sensibilityLayer.process = (input) => {
  if (!input.amount) throw new Error('Missing amount');
  return { structuredInput: input };
};
```

### Ethical Fine-Tuning
Adjust the critique layer’s categorical imperative tests:
```javascript
critiqueLayer.evaluate = (action) => {
  return action.value < 500; // Only allow small transactions
};
```

### Performance Tips
- Enable caching for repeated inputs.
- Use async processing for large datasets.

---

## 7. Troubleshooting

- **Missing API Key**: Ensure your LLM API key is set (e.g., `process.env.GROQ_API_KEY`).
- **Pipeline Errors**: Enable `logDecisions` to debug the flow.
- **No Output**: Check if `enableExplanations` is off—turn it on for visibility.
- **Need Help?**: Open an issue on GitHub or ask the community.

---

## 8. Contributing

Love CAR and want to improve it? We welcome contributions! Here’s how:
- **Ideas**: Add new ethical checks or blockchain integrations.
- **Code**: Fork the repo, make changes, and submit a pull request.
- **Start Small**: Look for `good first issue` tasks in the repo.

---

That’s it! With this guide, you’re ready to integrate the CAR extension into your Daydreams agent. Your AI now has a moral backbone—and it’s not afraid to use it. For more details, check the [official docs](https://example.com/car-docs) or dive into the source code. Happy coding!
