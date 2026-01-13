import { z } from 'zod';

// Connection types for schema building
export const ConnectionTypeSchema = z.enum([
  'related',      // General relationship
  'prerequisite', // Source is required to understand target
  'example',      // Target is an example of source concept
  'contrast',     // Shows differences between concepts
]);
export type ConnectionType = z.infer<typeof ConnectionTypeSchema>;

// Connection between two cards
export const ConnectionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceCardId: z.string().uuid(),
  targetCardId: z.string().uuid(),
  connectionType: ConnectionTypeSchema.default('related'),
  description: z.string().max(500).nullable().optional(),
  strength: z.number().min(0).max(1).default(0.5),
  createdAt: z.string().datetime(),
});
export type Connection = z.infer<typeof ConnectionSchema>;

// Schema for creating a connection
export const CreateConnectionSchema = z.object({
  sourceCardId: z.string().uuid(),
  targetCardId: z.string().uuid(),
  connectionType: ConnectionTypeSchema.default('related'),
  description: z.string().max(500).optional(),
});
export type CreateConnection = z.infer<typeof CreateConnectionSchema>;

// Schema for updating a connection
export const UpdateConnectionSchema = z.object({
  connectionType: ConnectionTypeSchema.optional(),
  description: z.string().max(500).nullable().optional(),
  strength: z.number().min(0).max(1).optional(),
});
export type UpdateConnection = z.infer<typeof UpdateConnectionSchema>;

// Elaboration (user's deeper explanation)
export const ElaborationSchema = z.object({
  id: z.string().uuid(),
  cardId: z.string().uuid(),
  userId: z.string().uuid(),
  prompt: z.string().min(1),
  response: z.string().min(1),
  aiFeedback: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type Elaboration = z.infer<typeof ElaborationSchema>;

// Schema for creating an elaboration
export const CreateElaborationSchema = z.object({
  cardId: z.string().uuid(),
  prompt: z.string().min(1),
  response: z.string().min(1),
});
export type CreateElaboration = z.infer<typeof CreateElaborationSchema>;

// Elaboration prompts (pre-defined questions)
export const ELABORATION_PROMPTS = [
  'Why does this work?',
  'How does this relate to what you already know?',
  'Can you give a real-world example?',
  'What would happen if this were different?',
  'Explain this as if teaching someone else.',
  'What are the key components or steps?',
  'When would you use this?',
  'What are common mistakes related to this?',
] as const;

export type ElaborationPrompt = (typeof ELABORATION_PROMPTS)[number];
