import { config } from 'dotenv';
config();

import '@/ai/flows/curriculum-qa.ts';
import '@/ai/flows/explain-math-problems.ts';
import '@/ai/flows/filter-prompts-by-subject.ts';
import '@/ai/flows/handle-out-of-scope.ts';