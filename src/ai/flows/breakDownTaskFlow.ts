
'use server';
/**
 * @fileOverview An AI flow for breaking down a larger task into smaller subtasks.
 *
 * - breakDownTask - A function that handles the task breakdown process.
 * - BreakDownTaskInput - The input type for the breakDownTask function.
 * - BreakDownTaskOutput - The return type for the breakDownTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakDownTaskInputSchema = z.object({
  taskTitle: z.string().describe("The title of the main task."),
  taskDescription: z.string().describe("The detailed description of the main task."),
});
export type BreakDownTaskInput = z.infer<typeof BreakDownTaskInputSchema>;

const SubtaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

const BreakDownTaskOutputSchema = z.array(SubtaskSchema);
export type BreakDownTaskOutput = z.infer<typeof BreakDownTaskOutputSchema>;


export async function breakDownTask(input: BreakDownTaskInput): Promise<BreakDownTaskOutput> {
  const result = await breakDownTaskFlow(input);
  return result || [];
}

const breakDownTaskPrompt = ai.definePrompt({
    name: 'breakDownTaskPrompt',
    input: { schema: BreakDownTaskInputSchema },
    output: { schema: BreakDownTaskOutputSchema },
    prompt: `Break down the following task into 3-5 smaller, actionable subtasks.
      
      Task: {{{taskTitle}}}
      Description: {{{taskDescription}}}
      
      Provide a title, a brief description, and a suggested priority level for each subtask.`
});


const breakDownTaskFlow = ai.defineFlow(
  {
    name: 'breakDownTaskFlow',
    inputSchema: BreakDownTaskInputSchema,
    outputSchema: BreakDownTaskOutputSchema,
  },
  async (input) => {
    const { output } = await breakDownTaskPrompt(input);
    return output || [];
  }
);
