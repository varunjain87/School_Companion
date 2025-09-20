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

const ExplainMathProblemInputSchema = z.string().describe('The math problem to explain (e.g., \"Compare 3/5, 3/6, 3/7, 9/14, 6/19\").');
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
  prompt: `You are a math tutor specialized in explaining math problems to students in grades 5-7.  Provide a step-by-step explanation of the problem, highlighting the general rule being applied.  Also, create a 3-question practice quiz related to the problem.

Math Problem: {{{$input}}}

Explanation and Quiz:
`,
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
