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

**IMPORTANT INSTRUCTION:**
- If the user's question is NOT about a school subject (e.g., it's about movies, music, video games, or personal questions), you MUST respond with: "That does not sound like a question about your studies. I can only answer questions about school subjects."
- Otherwise, answer the question based on the curriculum.

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
    
    // Do not generate an image if the question was off-topic.
    if (answer.output.answer.startsWith("That does not sound like a question")) {
        return {
            ...answer.output,
            imageUrl: undefined,
        };
    }

    let imageUrl: string | undefined = undefined;
    try {
      // After getting the answer, try to generate an image.
      const image = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A simple, educational, and kid-friendly visual representation of: ${input.question}`,
        config: {
            safetySettings: [
                {
                  category: 'HARM_CATEGORY_HATE_SPEECH',
                  threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                  category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                  threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                  category: 'HARM_CATEGORY_HARASSMENT',
                  threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                  category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                  threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
              ],
        }
      });
      imageUrl = image.media?.url;
    } catch (e) {
      // If image generation fails, we log it but don't block the response.
      console.error("Image generation failed, but returning text answer.", e);
    }
    
    return {
        ...answer.output,
        imageUrl,
    };
  }
);
