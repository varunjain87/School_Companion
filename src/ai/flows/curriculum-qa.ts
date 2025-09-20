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
  config: {
    safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
  },
  prompt: `You are a helpful assistant for CBSE classes 5-7. Your primary goal is to answer questions related to school subjects like Science, Math, Social Studies, English, and Hindi.

**IMPORTANT INSTRUCTIONS:**
- If the user's question is NOT about a school subject (e.g., it's about movies, music, video games, or personal questions), you MUST respond with: "That does not sound like a question about your studies. I can only answer questions about school subjects."
- Otherwise, provide a helpful, text-based answer to the question based on the curriculum.
- Your response MUST be a numbered list. Each step in the list MUST be on a new line. Use "\\n\\n" to separate steps.
- Do NOT use long paragraphs. Keep explanations for each step to one or two short sentences.
- Use bold formatting for important terms or numbers.

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
    
    // First, get the text answer.
    const answer = await answerQuestionPrompt({
      question: input.question,
    });

    if (!answer.output) {
      throw new Error("Failed to generate a text answer.");
    }
    
    return answer.output;
  }
);
