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
  query: z.string().describe('The natural language query for translation, e.g., "How do I say \'Good morning\' in Kannada?"'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  sourceText: z.string().describe('The original text that was translated.'),
  translatedText: z.string().describe('The translated text in the target language.'),
  pronunciation: z.string().describe('The romanized pronunciation of the translated text.'),
  audioDataUri: z.string().optional().describe('The audio of the translated text as a data URI.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const profanityCheckerTool = ai.defineTool(
  {
    name: 'profanityChecker',
    description:
      'Checks if the input contains profanity or harmful content. Returns true if it does, false otherwise.',
    inputSchema: z.object({
      text: z.string(),
    }),
    outputSchema: z.boolean(),
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `Is the following text inappropriate, hateful, sexually explicit, or profane? Respond with only "true" or "false". Text: "${input.text}"`,
      config: {
        temperature: 0,
      },
    });

    return llmResponse.text.toLowerCase().includes('true');
  }
);


const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: z.object({
    sourceText: z.string().describe("The text phrase that the user wants to translate."),
    translatedText: z.string().describe("The translation of the phrase into Kannada. If the input is inappropriate, return 'I am unable to process this request.'"),
    pronunciation: z.string().describe("A romanized, phonetic spelling of the Kannada translation to help with pronunciation. If the input is inappropriate, return 'Error'"),
  })},
  tools: [profanityCheckerTool],
  prompt: `You are a language tutor specializing in English and Kannada. A user has asked a question to learn how to say something in Kannada.

Your tasks are:
1.  Check if the user's query contains any profanity or harmful content using the profanityChecker tool.
2.  If the input is harmful, you MUST respond with "I am unable to process this request." in the translatedText field and "Error" in the pronunciation field.
3.  If the input is safe, identify the specific English phrase the user wants to translate from their question.
4.  Translate that phrase accurately into Kannada.
5.  Provide a simple, romanized (English alphabet) phonetic spelling for the Kannada translation.

**User's Question:**
"{{{query}}}"

Provide your response in the requested structured format.`,
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
    
    // If the profanity checker returned an error message, don't generate audio.
    if (translation.translatedText === 'I am unable to process this request.') {
      return {
        ...translation,
        audioDataUri: undefined,
      };
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
      ...translation,
      audioDataUri,
    };
  }
);
