"use server";

import { explainMathProblem as explainMathProblemFlow, type ExplainMathProblemInput } from "@/ai/flows/explain-math-problems";
import { askCurriculumQuestion as askCurriculumQuestionFlow, type CurriculumQuestionOutput } from "@/ai/flows/curriculum-qa";
import { translateText as translateTextFlow, type TranslateTextInput, type TranslateTextOutput } from "@/ai/flows/translate-text";

export async function getAiExplanation(problem: string) {
    try {
        const input: ExplainMathProblemInput = { question: problem };
        const result = await explainMathProblemFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get explanation from AI." };
    }
}

export async function askQuestion(question: string, history: string[] = []): Promise<{ success: boolean; data?: CurriculumQuestionOutput; error?: string }> {
    try {
        const result = await askCurriculumQuestionFlow({ question });
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get an answer from the AI." };
    }
}

export async function getAiTranslation(input: TranslateTextInput): Promise<{ success: boolean; data?: TranslateTextOutput; error?: string}> {
    try {
        const result = await translateTextFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get translation from AI." };
    }
}
