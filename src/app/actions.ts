"use server";

import { explainMathProblem as explainMathProblemFlow } from "@/ai/flows/explain-math-problems";
import { askCurriculumQuestion as askCurriculumQuestionFlow, type CurriculumQuestionOutput } from "@/ai/flows/curriculum-qa";

export async function getAiExplanation(problem: string) {
    try {
        const result = await explainMathProblemFlow(problem);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get explanation from AI." };
    }
}

export async function askQuestion(question: string, history: string[] = []): Promise<{ success: boolean; data?: CurriculumQuestionOutput; error?: string }> {
    try {
        // No longer filtering prompts. Directly ask the question.
        const result = await askCurriculumQuestionFlow({ question });
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get an answer from the AI." };
    }
}
