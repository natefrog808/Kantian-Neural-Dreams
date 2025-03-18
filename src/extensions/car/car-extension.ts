import { carPipeline, checkEpistemicBoundaries, generateExplanation, CARPipelineOptions } from './pipeline';
import type { Extension } from '@daydreamsai/core/types';

/**
 * Options for configuring the CAR extension
 */
export interface CARExtensionOptions extends CARPipelineOptions {
  /** Minimum confidence threshold for epistemic humility checks (default: 0.7) */
  confidenceThreshold?: number;
  /** Whether to generate and include explanations in the output (default: true) */
  enableExplanations?: boolean;
  /** Whether to allow deferral to human judgment based on epistemic boundaries (default: true) */
  enableDeferral?: boolean;
  /** Custom logging function for decision transparency (default: console.log) */
  logDecisions?: (message: string) => void;
  /** Custom message to use when deferring to human judgment (default: "I need to defer to human judgment") */
  deferralMessage?: string;
}

/**
 * Creates a CAR extension for Daydreams agents, integrating ethical reasoning and epistemic humility
 * @param options Configuration options for the CAR extension
 * @returns An Extension object compatible with Daydreams agents
 */
export function car(options: CARExtensionOptions = {}): Extension {
  // Default configuration values
  const {
    confidenceThreshold = 0.7,
    enableExplanations = true,
    enableDeferral = true,
    logDecisions = (message: string) => console.log(message), // Default to console.log
    deferralMessage = 'I need to defer to human judgment',
    debug = false,
    ...pipelineOptions
  } = options;

  return {
    name: 'car',

    /**
     * Hook executed before the agent's main logic
     * Processes input through the CAR pipeline and checks for deferral
     */
    async beforeRun({ input, context, agent }) {
      try {
        // Process input through the CAR pipeline
        const carOutput = await carPipeline(input, context, {
          debug,
          confidenceThreshold,
          ...pipelineOptions,
        });

        // Check epistemic boundaries if deferral is enabled
        let deferred = false;
        let deferReason = '';
        if (enableDeferral) {
          const humilityCheck = checkEpistemicBoundaries(carOutput, confidenceThreshold);
          if (humilityCheck.shouldDefer) {
            deferred = true;
            deferReason = humilityCheck.reason;
          }
        }

        // Generate explanation if enabled
        const explanation = enableExplanations ? generateExplanation(carOutput) : undefined;

        // Update context with CAR output
        return {
          context: {
            ...context,
            car: {
              ...carOutput,
              deferred,
              deferReason,
              explanation,
            },
          },
        };
      } catch (error) {
        // Handle pipeline errors gracefully
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logDecisions(`[CAR] Error in pipeline: ${errorMessage}`);
        return {
          context: {
            ...context,
            car: {
              error: errorMessage,
              deferred: true,
              deferReason: 'Pipeline error occurred',
            },
          },
        };
      }
    },

    /**
     * Hook executed after the agent's main logic
     * Logs decisions and modifies output based on CAR analysis
     */
    async afterRun({ input, output, context, agent }) {
      if (!context.car) {
        return { output };
      }

      // Log decision details if enabled
      if (logDecisions) {
        logDecisions(`[CAR] Decision for input: ${JSON.stringify(input)}`);
        logDecisions(`[CAR] Confidence: ${context.car.confidence}`);
        logDecisions(`[CAR] Approved actions: ${context.car.approvedActions.length}`);
        if (context.car.deferred) {
          logDecisions(`[CAR] Deferred to human judgment: ${context.car.deferReason}`);
        }
      }

      // Handle pipeline errors
      if (context.car.error) {
        return {
          output: {
            ...output,
            message: `${deferralMessage}: ${context.car.deferReason}`,
            deferred: true,
          },
        };
      }

      // Handle deferral to human judgment
      if (context.car.deferred) {
        return {
          output: {
            ...output,
            message: `${deferralMessage}: ${context.car.deferReason}${enableExplanations && context.car.explanation ? `\n\n${context.car.explanation}` : ''}`,
            deferred: true,
          },
        };
      }

      // Add explanation to output if enabled and available
      if (enableExplanations && context.car.explanation) {
        return {
          output: {
            ...output,
            carExplanation: context.car.explanation,
          },
        };
      }

      // Return unchanged output if no modifications are needed
      return { output };
    },
  };
}
