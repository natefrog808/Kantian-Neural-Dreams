/**
 * Critique of Artificial Reason (CAR) Integration for Daydreams
 * 
 * This module provides a Kantian-inspired framework for ethical decision-making,
 * epistemic humility, and transparency in AI agents. It includes:
 * - Layered architecture: Sensibility, Understanding, Reason, Critique
 * - Ethical evaluation via Kant's categorical imperative
 * - Epistemic boundary checks for self-awareness
 * - Seamless integration with Daydreams agents via extensions
 * 
 * @module car-integration
 * @version 1.0.0
 */

// Export all components for easy access
export * from './layers';
export * from './pipeline';
export * from './car-extension';

// Re-export the car extension as the default export for easy importing
import { car } from './car-extension';
export default car;

// Export types for better type safety and clarity
export type {
  SensibilityInput,
  UnderstandingOutput,
  ReasonOutput,
  CritiqueOutput,
} from './layers';

export type { CARPipelineOptions } from './pipeline';
export type { CARExtensionOptions } from './car-extension';

// Example usage of the CAR extension in a Daydreams agent
/**
 * @example
 * import createDreams from '@daydreamsai/core';
 * import car from './car-integration';
 * 
 * const agent = createDreams({
 *   model: groq("deepseek-r1-distill-llama-70b"),
 *   extensions: [car({ confidenceThreshold: 0.8, debug: true })],
 * }).start();
 * 
 * agent.run({ input: 'Should I invest all my money in one stock?' });
 */
