// src/car-integration/pipeline.ts

import {
  sensibilityLayer,
  understandingLayer,
  reasonLayer,
  critiqueLayer,
  SensibilityInput,
  CritiqueOutput,
} from './layers';

/**
 * Options for configuring the CAR pipeline
 */
export interface CARPipelineOptions {
  debug?: boolean;
  confidenceThreshold?: number;
  ethicalConstraints?: {
    allowHighValueTransactions?: boolean;
    requireExplicitConsent?: boolean;
    preventMisleadingResponses?: boolean;
  };
  maxProcessingTime?: number; // in milliseconds
}

/**
 * The main CAR pipeline that processes inputs through all four Kantian layers:
 * 1. Sensibility: Converts raw input into structured data.
 * 2. Understanding: Categorizes and contextualizes the data.
 * 3. Reason: Proposes actions based on understanding.
 * 4. Critique: Evaluates actions for ethical compliance and confidence.
 *
 * @param rawInput - The raw input data (e.g., user request, blockchain transaction)
 * @param context - Optional Daydreams context (e.g., memory, history)
 * @param options - Configuration options for the pipeline
 * @returns The final critique output with evaluated actions and reasoning
 */
export async function carPipeline(
  rawInput: any,
  context?: Record<string, any>,
  options: CARPipelineOptions = {}
): Promise<CritiqueOutput> {
  const {
    debug = false,
    confidenceThreshold = 0.7,
    maxProcessingTime = 5000, // Default to 5 seconds
    ethicalConstraints = {
      allowHighValueTransactions: false,
      requireExplicitConsent: false,
      preventMisleadingResponses: true,
    },
  } = options;

  const startTime = Date.now();

  // Log input if debug is enabled
  if (debug) console.log('CAR Pipeline Input:', JSON.stringify(rawInput, null, 2));

  try {
    // Step 1: Sensibility Layer - Process raw input into structured data
    const sensibilityInput: SensibilityInput = { rawData: rawInput, context };
    const sensibilityOutput = await sensibilityLayer(sensibilityInput);
    if (debug) console.log('Sensibility Output:', JSON.stringify(sensibilityOutput, null, 2));

    // Step 2: Understanding Layer - Categorize and enrich the data
    const understandingOutput = await understandingLayer(sensibilityOutput);
    if (debug) console.log('Understanding Output:', JSON.stringify(understandingOutput, null, 2));

    // Step 3: Reason Layer - Propose actions based on understanding
    const reasonOutput = await reasonLayer(understandingOutput);
    if (debug) console.log('Reason Output:', JSON.stringify(reasonOutput, null, 2));

    // Step 4: Critique Layer - Evaluate actions for ethics and confidence
    const critiqueOutput = await critiqueLayer(reasonOutput);
    if (debug) console.log('Critique Output:', JSON.stringify(critiqueOutput, null, 2));

    // Check processing time
    const processingTime = Date.now() - startTime;
    if (processingTime > maxProcessingTime) {
      console.warn(`Processing time exceeded: ${processingTime}ms > ${maxProcessingTime}ms`);
    }

    return critiqueOutput;
  } catch (error) {
    console.error('Error in CAR Pipeline:', error);
    throw new Error(`Pipeline failed: ${error.message}`);
  }
}

/**
 * Checks if the agent should defer to human judgment based on epistemic boundaries
 * @param output - The critique output from the pipeline
 * @param confidenceThreshold - Minimum confidence level to proceed without deferring
 * @returns An object indicating whether to defer and the reason
 */
export function checkEpistemicBoundaries(
  output: CritiqueOutput,
  confidenceThreshold: number = 0.7
): { shouldDefer: boolean; reason: string } {
  // Check confidence level
  if (output.confidence < confidenceThreshold) {
    return {
      shouldDefer: true,
      reason: `Low confidence (${output.confidence.toFixed(2)}) below threshold of ${confidenceThreshold}`,
    };
  }

  // Check for limitations
  if (output.limitations.length > 0) {
    return {
      shouldDefer: true,
      reason: `Limitations detected: ${output.limitations.join(", ")}`,
    };
  }

  // Check for uncertainties
  if (output.uncertainties.length > 0) {
    return {
      shouldDefer: true,
      reason: `Uncertainties present: ${output.uncertainties.join(", ")}`,
    };
  }

  return { shouldDefer: false, reason: "Within epistemic boundaries" };
}

/**
 * Generates a detailed human-readable explanation of the decision-making process
 * @param output - The critique output from the pipeline
 * @returns A formatted string explaining the decision analysis
 */
export function generateExplanation(output: CritiqueOutput): string {
  const approvedActionsList = output.approvedActions
    .map((action) => `- ${action.action}: ${action.justification}`)
    .join('\n') || 'None';

  const rejectedActionsList = output.rejectedActions
    ? output.rejectedActions
        .map((action) => `- ${action.action}: Rejected due to ethical constraints`)
        .join('\n')
    : 'None';

  return `
**Decision Analysis**
- **Confidence Level**: ${output.confidence.toFixed(2)}
- **Approved Actions**:
${approvedActionsList}

- **Rejected Actions**:
${rejectedActionsList}

**Reasoning**:
${output.explanation}

${output.limitations.length > 0 ? `**Limitations**:\n- ${output.limitations.join('\n- ')}` : ''}
${output.uncertainties.length > 0 ? `**Uncertainties**:\n- ${output.uncertainties.join('\n- ')}` : ''}
  `.trim();
}

// Export all CAR components for easy access
export * from './layers';
