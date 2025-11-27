
'use server';
/**
 * @fileOverview An AI flow for suggesting a NAICS code based on a user's profession or business description.
 *
 * - suggestNaicsCode - A function that handles the NAICS code suggestion process.
 * - SuggestNaicsCodeInput - The input type for the suggestNaicsCode function.
 * - SuggestNaicsCodeOutput - The return type for the suggestNaicsCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { detailedSectorsData } from '@/app/data/naics';

const SuggestNaicsCodeInputSchema = z.object({
  description: z.string().describe("A description of the user's profession, industry, or business."),
});
export type SuggestNaicsCodeInput = z.infer<typeof SuggestNaicsCodeInputSchema>;

const SuggestNaicsCodeOutputSchema = z.object({
  code: z.string().describe("The suggested NAICS code."),
  name: z.string().describe("The name of the suggested NAICS industry."),
});
export type SuggestNaicsCodeOutput = z.infer<typeof SuggestNaicsCodeOutputSchema>;

export async function suggestNaicsCode(input: SuggestNaicsCodeInput): Promise<SuggestNaicsCodeOutput> {
  const result = await suggestNaicsCodeFlow(input);
  // Return a default/error object if the flow fails to produce a result
  return result || { code: "", name: "Could not determine an industry." };
}

const naicsDataString = JSON.stringify(detailedSectorsData, null, 2);

const suggestNaicsCodePrompt = ai.definePrompt({
  name: 'suggestNaicsCodePrompt',
  input: { schema: SuggestNaicsCodeInputSchema },
  output: { schema: SuggestNaicsCodeOutputSchema },
  prompt: `You are an expert in business classification using the North American Industry Classification System (NAICS).
    Your task is to analyze the user's provided description and suggest the most fitting NAICS code from the provided list.

    User's Description:
    "{{{description}}}"

    Use the following JSON data as the ONLY source for NAICS codes. Find the most specific and relevant industry code.
    If the description is vague, make a reasonable inference. The output must be one of the codes present in the data.

    NAICS Data:
    \`\`\`json
    ${naicsDataString}
    \`\`\`

    Based on the user's description, provide the most specific and appropriate NAICS code and its corresponding name.
    `,
});

const suggestNaicsCodeFlow = ai.defineFlow(
  {
    name: 'suggestNaicsCodeFlow',
    inputSchema: SuggestNaicsCodeInputSchema,
    outputSchema: SuggestNaicsCodeOutputSchema,
  },
  async (input) => {
    const { output } = await suggestNaicsCodePrompt(input);
    return output!;
  }
);
