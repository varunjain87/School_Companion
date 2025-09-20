"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Loader2, Volume2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getAiTranslation } from '@/app/actions';
import type { TranslateTextOutput } from '@/ai/flows/translate-text';

const sampleQuery = "How do you say 'Thank you' in Kannada?";

export default function TranslatePage() {
    const [query, setQuery] = useState('');
    const [translationResult, setTranslationResult] = useState<TranslateTextOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleTranslate = async (text?: string) => {
        const textToTranslate = text || query;
        if (!textToTranslate.trim()) {
            setTranslationResult(null);
            return;
        }

        setIsLoading(true);
        setTranslationResult(null);

        const result = await getAiTranslation(textToTranslate);

        if (result.success && result.data) {
            if (result.data.translatedText === 'I am unable to process this request.') {
                toast({ title: "Content Warning", description: "The phrase could not be translated due to safety guidelines.", variant: "destructive" });
                setTranslationResult(null);
            } else {
                setTranslationResult(result.data);
            }
        } else {
            toast({ title: "Translation Failed", description: result.error, variant: "destructive" });
        }

        setIsLoading(false);
    };

    const playAudio = () => {
        if (translationResult?.audioDataUri) {
            const audio = new Audio(translationResult.audioDataUri);
            audio.play();
        }
    }
    
    const handleSample = () => {
        setQuery(sampleQuery);
        handleTranslate(sampleQuery);
    }

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-bold font-headline">Translate</h1>
                <p className="text-muted-foreground">English ↔ Kannada translation.</p>
            </div>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Your Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Textarea 
                            value={query} 
                            onChange={(e) => setQuery(e.target.value)} 
                            placeholder="e.g., How to say 'Good morning' in Kannada?"
                            className="h-24"
                            disabled={isLoading}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => handleTranslate()} disabled={isLoading || !query.trim()}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                                Translate
                            </Button>
                            <Button variant="outline" onClick={handleSample} disabled={isLoading}>
                                Try a sample
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <Card className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-4">Translating...</p>
                </Card>
            )}

            {translationResult && (
                <div className="grid md:grid-cols-2 gap-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Kannada (ಕನ್ನಡ)</CardTitle>
                             {translationResult.audioDataUri && (
                                <Button variant="ghost" size="icon" onClick={playAudio}>
                                    <Volume2 />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-kannada">{translationResult.translatedText}</p>
                            <p className="text-sm text-muted-foreground mt-2">Original: "{translationResult.sourceText}"</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Pronunciation</CardTitle>
                            <CardDescription>How to say it in English characters.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold text-accent-foreground">{translationResult.pronunciation}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
