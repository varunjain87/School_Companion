'use server';

/**
 * @fileOverview A curriculum-locked question answering AI agent.
 * - askCurriculumQuestion - A function that handles the question answering process.
 * - CurriculumQuestionInput - The input type for the askCurriculumQuestion function.
 * - CurriculumQuestionOutput - The return type for the askCurriculumQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurriculumQuestionInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
});
export type CurriculumQuestionInput = z.infer<typeof CurriculumQuestionInputSchema>;

const CurriculumQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, grounded in the curriculum.'),
  citations: z.array(z.string()).describe('List of note IDs cited in the answer.'),
  subject: z.string().optional().describe('Subject of the question'),
  classLevel: z.number().optional().describe('Class level of the question'),
  chapter: z.string().optional().describe('Chapter of the question'),
  concepts: z.array(z.string()).optional().describe('Concepts related to the question'),
  imageUrl: z.string().optional().describe('URL of a generated image to explain the concept.'),
});
export type CurriculumQuestionOutput = z.infer<typeof CurriculumQuestionOutputSchema>;

export async function askCurriculumQuestion(input: CurriculumQuestionInput): Promise<CurriculumQuestionOutput> {
  return curriculumQAFlow(input);
}

const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: z.object({
    question: z.string(),
  })},
  output: {schema: z.object({
      answer: z.string().describe('The answer to the question.'),
      citations: z.array(z.string()).describe('List of sources cited in the answer.'),
  })},
  prompt: `You are a helpful assistant for CBSE classes 5-7.
Answer the following question.

Question: {{{question}}}

Answer:`,
});

const curriculumQAFlow = ai.defineFlow(
  {
    name: 'curriculumQAFlow',
    inputSchema: CurriculumQuestionInputSchema,
    outputSchema: CurriculumQuestionOutputSchema,
  },
  async (input) => {
    
    const [answer, image] = await Promise.all([
      answerQuestionPrompt({
        question: input.question,
      }),
      ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A simple, educational, and kid-friendly visual representation of: ${input.question}`,
      }),
    ]);
    
    return {
        ...answer.output!,
        imageUrl: image.media?.url,
    };
  }
);
