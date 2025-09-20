'use server';
/**
 * @fileOverview A text translation and speech generation AI agent.
 *
 * - translateText - A function that handles the translation and TTS process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  sourceLang: z.string().describe('The source language of the text.'),
  targetLang: z.string().describe('The target language for the translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
  audioDataUri: z.string().optional().describe('The audio of the translated text as a data URI.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: z.object({translatedText: z.string()})},
  prompt: `Translate the following text from {{sourceLang}} to {{targetLang}}:

Text: {{{text}}}

Translation:`,
});

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
  }

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    // First, translate the text.
    const {output: translation} = await translatePrompt(input);
    if (!translation) {
      throw new Error('Failed to translate text.');
    }

    let audioDataUri: string | undefined = undefined;
    try {
      // Then, generate audio for the translated text.
      const {media} = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
        },
        prompt: translation.translatedText,
      });

      if (media?.url) {
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        const wavBase64 = await toWav(audioBuffer);
        audioDataUri = `data:audio/wav;base64,${wavBase64}`;
      }
    } catch (e) {
      console.error('Text-to-speech generation failed:', e);
      // We don't block the response if TTS fails, just return the text.
    }

    return {
      translatedText: translation.translatedText,
      audioDataUri,
    };
  }
);
