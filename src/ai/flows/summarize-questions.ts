'use server';

/**
 * @fileOverview An AI agent for summarizing a student's questions and emailing them.
 *
 * - summarizeQuestions - A function that handles the summarization and emailing process.
 * - SummarizeQuestionsInput - The input type for the summarizeQuestions function.
 * - SummarizeQuestionsOutput - The return type for the summarizeQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SummarizeQuestionsInputSchema = z.object({
  questions: z.array(z.string()).describe("A list of questions asked by the student."),
});
export type SummarizeQuestionsInput = z.infer<typeof SummarizeQuestionsInputSchema>;

const SummarizeQuestionsOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the student's questions."),
});
export type SummarizeQuestionsOutput = z.infer<typeof SummarizeQuestionsOutputSchema>;

export async function summarizeQuestions(
  input: SummarizeQuestionsInput
): Promise<SummarizeQuestionsOutput> {
  return summarizeQuestionsFlow(input);
}

const summarizePrompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: { schema: SummarizeQuestionsInputSchema },
  output: { schema: SummarizeQuestionsOutputSchema },
  prompt: `You are an assistant for a parent. Your task is to summarize the questions their child asked while using a learning app today.
Provide a brief, easy-to-read summary that gives the parent an overview of their child's learning activities.
Group the questions by topic if possible.

Here are the questions the student asked:
{{#each questions}}
- {{{this}}}
{{/each}}

Please provide a concise summary.`,
});

async function sendEmail(summary: string) {
  const { EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('Email credentials are not set in .env file. Skipping email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    host: EMAIL_HOST,
    port: EMAIL_PORT ? parseInt(EMAIL_PORT) : 587,
    secure: (EMAIL_PORT ? parseInt(EMAIL_PORT) : 587) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: 'namokar2001@gmail.com',
    subject: `Your Child's Daily Learning Summary - ${new Date().toLocaleDateString()}`,
    text: `Here is a summary of your child's activity on the learning app today:\n\n${summary}`,
    html: `<p>Here is a summary of your child's activity on the learning app today:</p><pre>${summary}</pre>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Summary email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send summary email.');
  }
}

const summarizeQuestionsFlow = ai.defineFlow(
  {
    name: 'summarizeQuestionsFlow',
    inputSchema: SummarizeQuestionsInputSchema,
    outputSchema: SummarizeQuestionsOutputSchema,
  },
  async (input) => {
    if (input.questions.length === 0) {
      return { summary: "No questions were asked today." };
    }

    const { output } = await summarizePrompt(input);
    if (!output) {
      throw new Error('Failed to generate summary.');
    }

    // After generating the summary, send the email.
    await sendEmail(output.summary);

    return output;
  }
);
