"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Lightbulb, Loader2, Wand2 } from 'lucide-react';
import { getAiExplanation } from '@/app/actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type Explanation = {
    explanation: string;
    practiceQuiz: { question: string; answer: string; }[];
};

const formSchema = z.object({
  problem: z.string().min(3, "Please enter a math problem."),
});

const sampleProblem = "Compare 3/5, 3/6, 3/7, 9/14, 6/19";

export default function MathPage() {
    const [explanation, setExplanation] = useState<Explanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            problem: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setExplanation(null);
        
        try {
            const result = await getAiExplanation(values.problem);
            if (result.success && result.data) {
                setExplanation(result.data);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive"
                });
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "Failed to connect to the AI service.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleSample = () => {
        form.setValue("problem", sampleProblem);
        onSubmit({ problem: sampleProblem });
    };

    const formattedExplanation = explanation?.explanation
        .split('\n')
        .filter(part => part.trim() !== '')
        .map((part, index) => (
            <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));

    return (
        <div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold font-headline">Math Explainer</h1>
              <p className="text-muted-foreground">Get step-by-step solutions and practice problems.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Enter Your Math Problem</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="problem"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea placeholder="e.g., Compare 3/5 and 4/7" {...field} className="h-24"/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                                            Explain
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleSample} disabled={isLoading}>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Try "Compare fractions"
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    {isLoading && (
                        <Card className="flex items-center justify-center p-8 h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-4">Generating explanation...</p>
                        </Card>
                    )}
                    
                    {explanation && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="text-yellow-400" />
                                        Step-by-Step Explanation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-72">
                                        <div className="text-sm max-w-none leading-relaxed pr-4">{formattedExplanation}</div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Practice Quiz</CardTitle>
                                    <CardDescription>Test your understanding.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        {explanation.practiceQuiz.map((item, index) => (
                                            <AccordionItem value={`item-${index}`} key={index}>
                                                <AccordionTrigger>Question {index + 1}: {item.question}</AccordionTrigger>
                                                <AccordionContent>
                                                    <p className="font-semibold text-accent-foreground">{item.answer}</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {!isLoading && !explanation && (
                         <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
                            <BrainCircuit className="h-12 w-12 mb-4 text-primary/50" />
                            <h2 className="text-lg font-semibold">Your explanation will appear here</h2>
                            <p className="max-w-sm">Enter a problem to get started.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
