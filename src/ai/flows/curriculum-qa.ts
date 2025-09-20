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
import { sampleNotes } from '@/lib/sample-curriculum';

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
  description: 'Retrieves relevant notes from a local sample curriculum based on subject, class level, chapter, and concepts.',
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
  const lowerCaseConcepts = input.concepts.map(c => c.toLowerCase());
  const lowerCaseChapter = input.chapter.toLowerCase();
  
  const relevantNotes = sampleNotes.filter(note => {
    const noteConcepts = note.concepts.map(c => c.toLowerCase());
    const chapterMatch = note.chapter.toLowerCase().includes(lowerCaseChapter);
    const classMatch = note.classLevel === input.classLevel;
    const subjectMatch = note.subject.toLowerCase() === input.subject.toLowerCase();
    const conceptsMatch = lowerCaseConcepts.some(concept => noteConcepts.includes(concept));

    return subjectMatch && classMatch && (chapterMatch || conceptsMatch);
  });

  return relevantNotes.map(({ id, content }) => ({ id, content }));
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
  output: {schema: z.object({
      answer: z.string().describe('The answer to the question, grounded in the curriculum.'),
      citations: z.array(z.string()).describe('List of note IDs cited in the answer.'),
  })},
  prompt: `You are a helpful assistant for CBSE classes 5-7.
Answer the question based on the provided notes. Cite the note IDs where the information was found.
If the notes are empty or do not contain the answer, answer the question from your own knowledge but state that it is from general knowledge.

Question: {{{question}}}
{{#if notes}}
Notes:
{{#each notes}}
  Note ID: {{{id}}}
  Content: {{{content}}}
{{/each}}
{{/if}}

Answer:`,
});

const curriculumQAFlow = ai.defineFlow(
  {
    name: 'curriculumQAFlow',
    inputSchema: CurriculumQuestionInputSchema,
    outputSchema: CurriculumQuestionOutputSchema,
  },
  async (input) => {
    const classification = await classifyPrompt(input);
    const { subject, classLevel, chapter, concepts } = classification.output!;

    const notes = await retrieveNotes({
      subject,
      classLevel,
      chapter,
      concepts,
    });

    const [answer, image] = await Promise.all([
      answerQuestionPrompt({
        question: input.question,
        notes,
      }),
      ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A simple, educational, and kid-friendly visual representation of: ${input.question}`,
      }),
    ]);
    
    return {
        ...answer.output!,
        imageUrl: image.media?.url,
        subject,
        classLevel,
        chapter,
        concepts,
    };
  }
);
