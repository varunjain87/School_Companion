"use server";

import { explainMathProblem as explainMathProblemFlow } from "@/ai/flows/explain-math-problems";
import { askCurriculumQuestion as askCurriculumQuestionFlow, type CurriculumQuestionOutput } from "@/ai/flows/curriculum-qa";
import { filterPromptsBySubject as filterPromptsBySubjectFlow } from "@/ai/flows/filter-prompts-by-subject";

export async function getAiExplanation(problem: string) {
    try {
        const result = await explainMathProblemFlow(problem);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get explanation from AI." };
    }
}

export async function askQuestion(question: string): Promise<{ success: boolean; data?: CurriculumQuestionOutput; error?: string }> {
    try {
        const filterResult = await filterPromptsBySubjectFlow({ prompt: question });
        if (!filterResult.isRelevant) {
            return {
                success: true,
                data: {
                    answer: `I can only answer questions related to the CBSE curriculum for classes 5-7. How about we try a topic like: ${filterResult.suggestedTopic}?`,
                    citations: [],
                }
            };
        }

        const result = await askCurriculumQuestionFlow({ question });
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get an answer from the AI." };
    }
}
