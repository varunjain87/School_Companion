'use server';

/**
 * @fileOverview Implements a curriculum-locked Q&A flow for CBSE Classes 5-7.
 *
 * This flow classifies user prompts, retrieves relevant notes from Firestore,
 * generates answers grounded in those notes, and provides source citations.
 *
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

const classifyPrompt = ai.definePrompt({
  name: 'classifyPrompt',
  input: {schema: CurriculumQuestionInputSchema},
  output: {schema: z.object({
    subject: z.string(),
    classLevel: z.number(),
    chapter: z.string(),
    concepts: z.array(z.string()),
  })},
  prompt: `Given the question, classify it into subject, class level, chapter and concepts.
Question: {{{question}}}
Subject:
Class Level:
Chapter:
Concepts:`,
});

const retrieveNotes = ai.defineTool({
  name: 'retrieveNotes',
  description: 'Retrieves relevant notes from Firestore based on subject, class level, chapter, and concepts.',
  inputSchema: z.object({
    subject: z.string().describe('The subject of the notes.'),
    classLevel: z.number().describe('The class level of the notes.'),
    chapter: z.string().describe('The chapter of the notes.'),
    concepts: z.array(z.string()).describe('The concepts related to the notes.'),
  }),
  outputSchema: z.array(z.object({
    id: z.string(),
    content: z.string(),
  })),
}, async (input) => {
  // TODO: Implement the retrieval of notes from Firestore
  // For now, return an empty array
  return [];
});

const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: z.object({
    question: z.string(),
    notes: z.array(z.object({
      id: z.string(),
      content: z.string(),
    })),
  })},
  output: {schema: CurriculumQuestionOutputSchema},
  prompt: `You are a helpful assistant for CBSE classes 5-7.
Answer the question based on the provided notes. Cite the note IDs where the information was found.
If the notes do not contain the answer, respond that you cannot answer the question with the provided notes, and suggest in-scope topics.

Question: {{{question}}}
Notes:
{{#each notes}}
  Note ID: {{{id}}}
  Content: {{{content}}}
{{/each}}

Answer:`, 
});

const curriculumQAFlow = ai.defineFlow(
  {
    name: 'curriculumQAFlow',
    inputSchema: CurriculumQuestionInputSchema,
    outputSchema: CurriculumQuestionOutputSchema,
  },
  async input => {
    const classification = await classifyPrompt(input);
    const {subject, classLevel, chapter, concepts} = classification.output!;

    const notes = await retrieveNotes({
      subject,
      classLevel,
      chapter,
      concepts,
    });

    const answer = await answerQuestionPrompt({
      question: input.question,
      notes,
    });

    return answer.output!;
  }
);
