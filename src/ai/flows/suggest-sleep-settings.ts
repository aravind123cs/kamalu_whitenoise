// Implemented by AI assistant.
'use server';

/**
 * @fileOverview Suggests white noise sounds and timer durations based on common preferences.
 *
 * - suggestSleepSettings - A function that suggests sleep settings.
 * - SuggestSleepSettingsInput - The input type for the suggestSleepSettings function.
 * - SuggestSleepSettingsOutput - The return type for the suggestSleepSettings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSleepSettingsInputSchema = z.object({
  babyAgeMonths: z
    .number()
    .describe('The age of the baby in months.')
    .optional(),
  typicalSleepTimeMinutes: z
    .number()
    .describe('The typical sleep time of the baby in minutes.')
    .optional(),
  preferredSounds: z
    .string()
    .describe('The preferred white noise sounds of the baby.')
    .optional(),
});
export type SuggestSleepSettingsInput = z.infer<typeof SuggestSleepSettingsInputSchema>;

const SuggestSleepSettingsOutputSchema = z.object({
  suggestedSound: z.string().describe('The suggested white noise sound.'),
  suggestedTimerMinutes: z
    .number()
    .describe('The suggested timer duration in minutes.'),
  reason: z.string().describe('The reason for the suggestion.'),
});
export type SuggestSleepSettingsOutput = z.infer<typeof SuggestSleepSettingsOutputSchema>;

export async function suggestSleepSettings(
  input: SuggestSleepSettingsInput
): Promise<SuggestSleepSettingsOutput> {
  return suggestSleepSettingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSleepSettingsPrompt',
  input: {schema: SuggestSleepSettingsInputSchema},
  output: {schema: SuggestSleepSettingsOutputSchema},
  prompt: `You are a sleep expert specializing in helping babies sleep.

Based on the following information, suggest a white noise sound and a timer duration for the baby.

Age: {{babyAgeMonths}} months
Typical Sleep Time: {{typicalSleepTimeMinutes}} minutes
Preferred Sounds: {{preferredSounds}}

Respond in the following JSON format:
{
  "suggestedSound": "the suggested white noise sound",
  "suggestedTimerMinutes": the suggested timer duration in minutes,
  "reason": "the reason for the suggestion"
}

Consider common preferences and what other parents have found effective.
`,
});

const suggestSleepSettingsFlow = ai.defineFlow(
  {
    name: 'suggestSleepSettingsFlow',
    inputSchema: SuggestSleepSettingsInputSchema,
    outputSchema: SuggestSleepSettingsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
