'use server';

/**
 * @fileOverview An AI agent for explaining math problems and generating practice quizzes.
 *
 * - explainMathProblem - A function that handles the explanation of math problems and quiz generation.
 * - ExplainMathProblemInput - The input type for the explainMathProblem function.
 * - ExplainMathProblemOutput - The return type for the explainMathProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainMathProblemInputSchema = z.string().describe('A question containing a math problem to explain (e.g., "How do I compare 3/5 and 4/7?").');
export type ExplainMathProblemInput = z.infer<typeof ExplainMathProblemInputSchema>;

const ExplainMathProblemOutputSchema = z.object({
  explanation: z.string().describe('Step-by-step explanation of the math problem.'),
  practiceQuiz: z.array(
    z.object({
      question: z.string().describe('A practice question related to the math problem.'),
      answer: z.string().describe('The answer to the practice question.'),
    })
  ).describe('A list of practice questions and answers.'),
});
export type ExplainMathProblemOutput = z.infer<typeof ExplainMathProblemOutputSchema>;

export async function explainMathProblem(input: ExplainMathProblemInput): Promise<ExplainMathProblemOutput> {
  return explainMathProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainMathProblemPrompt',
  input: {schema: ExplainMathProblemInputSchema},
  output: {schema: ExplainMathProblemOutputSchema},
  prompt: `You are a math tutor for students in grades 5-7. Your task is to analyze the user's question to find the core math problem, provide a step-by-step explanation for solving it, and then create a 3-question practice quiz based on the problem's concepts.

User's Question: {{{input}}}

Begin by explaining the solution to the math problem step-by-step. After the explanation, provide the practice quiz.`,
});

const explainMathProblemFlow = ai.defineFlow(
  {
    name: 'explainMathProblemFlow',
    inputSchema: ExplainMathProblemInputSchema,
    outputSchema: ExplainMathProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
