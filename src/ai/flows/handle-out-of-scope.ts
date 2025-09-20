'use server';

/**
 * @fileOverview A flow that handles out-of-scope queries by providing a friendly message suggesting relevant topics within the curriculum.
 *
 * - handleOutOfScopeQuery - A function that handles the out-of-scope query and suggests relevant topics.
 * - HandleOutOfScopeInput - The input type for the handleOutOfScopeQuery function.
 * - HandleOutOfScopeOutput - The return type for the handleOutOfScopeQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandleOutOfScopeInputSchema = z.object({
  query: z.string().describe('The user query that needs to be classified.'),
});
export type HandleOutOfScopeInput = z.infer<typeof HandleOutOfScopeInputSchema>;

const HandleOutOfScopeOutputSchema = z.object({
  isOutOfScope: z.boolean().describe('Whether the query is out of scope.'),
  suggestedTopics: z.array(z.string()).describe('Suggested topics within the curriculum.'),
  response: z.string().describe('A friendly message suggesting relevant topics.'),
});
export type HandleOutOfScopeOutput = z.infer<typeof HandleOutOfScopeOutputSchema>;

export async function handleOutOfScopeQuery(input: HandleOutOfScopeInput): Promise<HandleOutOfScopeOutput> {
  return handleOutOfScopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'handleOutOfScopePrompt',
  input: {schema: HandleOutOfScopeInputSchema},
  output: {schema: HandleOutOfScopeOutputSchema},
  prompt: `You are a helpful assistant for students in CBSE Class 5-7.

  A student has asked the following question:
  {{query}}

  Determine if the question is within the CBSE Class 5-7 syllabus. If not, respond with isOutOfScope set to true, a friendly message suggesting relevant topics within the curriculum in the response field, and a few relevant topics in the suggestedTopics field.
  If the question is within the scope of the curriculum, set isOutOfScope to false and leave the other fields empty.
  `,
});

const handleOutOfScopeFlow = ai.defineFlow(
  {
    name: 'handleOutOfScopeFlow',
    inputSchema: HandleOutOfScopeInputSchema,
    outputSchema: HandleOutOfScopeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
