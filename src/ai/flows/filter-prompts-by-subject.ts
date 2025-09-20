'use server';
/**
 * @fileOverview Filters prompts based on subject relevance.
 *
 * - filterPromptsBySubject - A function that determines if a prompt is relevant to the curriculum.
 * - FilterPromptsBySubjectInput - The input type for the filterPromptsBySubject function.
 * - FilterPromptsBySubjectOutput - The return type for the filterPromptsBySubject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterPromptsBySubjectInputSchema = z.object({
  prompt: z.string().describe('The prompt to classify.'),
  history: z.array(z.string()).optional().describe('The user\'s study history (practiced chapters).'),
});
export type FilterPromptsBySubjectInput = z.infer<typeof FilterPromptsBySubjectInputSchema>;

const FilterPromptsBySubjectOutputSchema = z.object({
  isRelevant: z.boolean().describe('Whether the prompt is relevant to the curriculum.'),
  response: z.string().optional().describe('A friendly response if the prompt is not relevant.'),
});
export type FilterPromptsBySubjectOutput = z.infer<typeof FilterPromptsBySubjectOutputSchema>;

export async function filterPromptsBySubject(input: FilterPromptsBySubjectInput): Promise<FilterPromptsBySubjectOutput> {
  return filterPromptsBySubjectFlow(input);
}

const refusalResponses = [
    "Uh‑oh, that’s in the ‘after‑homework’ zone.",
    "Hmm, that question isn’t in my notebook.",
    "If I answer that, your parents will scold me. Better stick to studies, okay?",
];

const prompt = ai.definePrompt({
  name: 'filterPromptsBySubjectPrompt',
  input: {schema: FilterPromptsBySubjectInputSchema},
  output: {schema: FilterPromptsBySubjectOutputSchema},
  prompt: `You are an AI assistant that filters user prompts to ensure they are relevant to the CBSE curriculum for Classes 5-7.

Determine if the following prompt is relevant to subjects like Math, Science, Social Studies/EVS, and Languages for students in Classes 5-7.

If the prompt is not relevant, set isRelevant to false and generate a friendly 'response' from the provided list. Then, suggest a relevant topic they could ask about based on their study 'history'.
- Refusal responses: ${JSON.stringify(refusalResponses)}
- User's study history: {{#if history}}{{{history}}}{{else}}None{{/if}}

If the prompt is relevant, set isRelevant to true.

Prompt: {{{prompt}}}
`,
});


const filterPromptsBySubjectFlow = ai.defineFlow(
  {
    name: 'filterPromptsBySubjectFlow',
    inputSchema: FilterPromptsBySubjectInputSchema,
    outputSchema: FilterPromptsBySubjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
