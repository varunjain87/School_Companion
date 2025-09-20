"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, Download, Languages, Loader2, Volume2, WifiOff } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { getAiTranslation } from '@/app/actions';

const phrasebook = [
    { en: "Good morning, teacher.", kn: "ಶುಭೋದಯ, ಶಿಕ್ಷಕ/ಶಿಕ್ಷಕಿ." },
    { en: "May I come in?", kn: "ನಾನು ಒಳಗೆ ಬರಬಹುದೇ?" },
    { en: "Please explain this again.", kn: "ದಯವಿಟ್ಟು ಇದನ್ನು ಮತ್ತೆ ವಿವರಿಸಿ." },
    { en: "I have a doubt.", kn: "ನನಗೊಂದು ಸಂದೇಹವಿದೆ." },
    { en: "Thank you.", kn: "ಧನ್ಯವಾದಗಳು." },
];

export default function TranslatePage() {
    const [sourceLang, setSourceLang] = useState<'en' | 'kn'>('en');
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);
    const [isModelDownloaded, setIsModelDownloaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const targetLang = sourceLang === 'en' ? 'kn' : 'en';
    const targetLangName = sourceLang === 'en' ? 'Kannada' : 'English';

    const handleTranslate = async () => {
        if (!isModelDownloaded) {
             toast({ title: "Model not downloaded", description: `Please download the ${targetLangName} model for offline translation.`, variant: "destructive"});
             return;
        }
        if (!sourceText.trim()) {
            setTranslatedText('');
            setTranslatedAudio(null);
            return;
        }

        setIsLoading(true);
        setTranslatedText('');
        setTranslatedAudio(null);

        const result = await getAiTranslation({ text: sourceText, sourceLang, targetLang });

        if (result.success && result.data) {
            setTranslatedText(result.data.translatedText);
            if (result.data.audioDataUri) {
                setTranslatedAudio(result.data.audioDataUri);
            }
        } else {
            toast({ title: "Translation Failed", description: result.error, variant: "destructive" });
        }

        setIsLoading(false);
    };
    
    const handleDownload = () => {
        toast({ title: "Downloading...", description: `${targetLangName} language model is being downloaded.`});
        setIsLoading(true);
        setTimeout(() => {
            setIsModelDownloaded(true);
            setIsLoading(false);
            toast({ title: "Download Complete!", description: "You can now use offline translation."});
        }, 1500);
    }

    const toggleLanguage = () => {
        setSourceLang(targetLang);
        const currentSource = sourceText;
        setSourceText(translatedText);
        setTranslatedText(currentSource);
        setTranslatedAudio(null);
    };

    const handlePhrasebookClick = (phrase: {en: string, kn: string}) => {
        if(sourceLang === 'en') {
            setSourceText(phrase.en);
        } else {
            setSourceText(phrase.kn);
        }
        handleTranslate();
    };

    const playAudio = () => {
        if (translatedAudio) {
            const audio = new Audio(translatedAudio);
            audio.play();
        }
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Translate</h1>
                    <p className="text-muted-foreground">English ↔ Kannada offline translation.</p>
                </div>
                {isModelDownloaded ? (
                    <Badge variant="outline" className="text-accent-foreground border-accent">
                        <WifiOff className="mr-2 h-4 w-4" /> Offline Ready
                    </Badge>
                ) : (
                     <Button onClick={handleDownload} disabled={isLoading}>
                        <Download className="mr-2 h-4 w-4" /> Download {targetLangName} Model
                    </Button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{sourceLang === 'en' ? 'English' : 'Kannada'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            value={sourceText} 
                            onChange={(e) => setSourceText(e.target.value)} 
                            placeholder="Enter text to translate..."
                            className="h-32"
                            disabled={!isModelDownloaded || isLoading}
                        />
                    </CardContent>
                </Card>
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>{targetLangName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Textarea 
                                value={translatedText} 
                                readOnly 
                                placeholder="Translation will appear here."
                                className="h-32 bg-muted/50"
                            />
                        )}
                    </CardContent>
                    {translatedAudio && !isLoading && (
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={playAudio}>
                            <Volume2 />
                        </Button>
                    )}
                </Card>
            </div>
            
            <div className="my-4 flex justify-center items-center gap-4">
                 <Button onClick={handleTranslate} disabled={!isModelDownloaded || isLoading || !sourceText.trim()}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                    Translate
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleLanguage} disabled={!isModelDownloaded || isLoading} aria-label="Swap languages">
                    <ArrowRightLeft />
                </Button>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Classroom Phrasebook</CardTitle>
                    <CardDescription>Click a phrase to translate it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>English</TableHead>
                                <TableHead>Kannada (ಕನ್ನಡ)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {phrasebook.map((phrase, index) => (
                                <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => handlePhrasebookClick(phrase)}>
                                    <TableCell>{phrase.en}</TableCell>
                                    <TableCell>{phrase.kn}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
