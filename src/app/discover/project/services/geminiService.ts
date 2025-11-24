
import { GoogleGenAI, Type } from "@google/genai";
import { AIActionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const breakDownTask = async (
  taskTitle: string,
  taskDescription: string
): Promise<AIActionResponse[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `Break down the following task into 3-5 smaller, actionable subtasks.
      
      Task: ${taskTitle}
      Description: ${taskDescription}
      
      Provide a title, a brief description, and a suggested priority level for each subtask.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: {
                type: Type.STRING,
                enum: ['Low', 'Medium', 'High', 'Critical']
              }
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const result = JSON.parse(text) as AIActionResponse[];
    return result;
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
};
