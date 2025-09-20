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

const ExplainMathProblemInputSchema = z.object({
  question: z.string().describe('A question containing a math problem to explain (e.g., "How do I compare 3/5 and 4/7?").')
});
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
  prompt: `You are a math tutor for a 6th grader. A student has asked you a question.
Your goal is to provide a clear, simple, step-by-step solution.

**IMPORTANT INSTRUCTIONS:**
- Your response MUST be a numbered list.
- Each step in the list MUST be on a new line. Use "\\n\\n" to separate steps.
- Do NOT use long paragraphs. Keep explanations for each step to one or two short sentences.
- Use bold formatting for important terms or numbers.

Here is the user's question:
"{{{question}}}"

1.  **Solve the problem:** Show the mathematical steps to arrive at the final answer.
2.  **Explain the steps:** Briefly explain each step in a way a 6th grader can easily understand.
3.  **Final Answer:** State the final answer clearly.
4.  **Practice Quiz:** After the explanation, provide a 3-question practice quiz based on the same concept.`,
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
