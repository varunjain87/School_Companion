"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, Download, Wifi, WifiOff } from "lucide-react";
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

const phrasebook = [
    { en: "Good morning, teacher.", kn: "ಶುಭೋದಯ, ಶಿಕ್ಷಕ/ಶಿಕ್ಷಕಿ." },
    { en: "May I come in?", kn: "ನಾನು ಒಳಗೆ ಬರಬಹುದೇ?" },
    { en: "Please explain this again.", kn: "ದಯವಿಟ್ಟು ಇದನ್ನು ಮತ್ತೆ ವಿವರಿಸಿ." },
    { en: "I have a doubt.", kn: "ನನಗೊಂದು ಸಂದೇಹವಿದೆ." },
    { en: "Thank you.", kn: "ಧನ್ಯವಾದಗಳು." },
];

const dictionary: { [key: string]: string } = phrasebook.reduce((acc, curr) => {
    acc[curr.en.toLowerCase()] = curr.kn;
    acc[curr.kn] = curr.en;
    return acc;
}, {} as { [key: string]: string });

export default function TranslatePage() {
    const [sourceLang, setSourceLang] = useState<'en' | 'kn'>('en');
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isModelDownloaded, setIsModelDownloaded] = useState(false);
    const { toast } = useToast();

    const targetLang = sourceLang === 'en' ? 'kn' : 'en';

    const handleTranslate = () => {
        if (!isModelDownloaded) {
             toast({ title: "Model not downloaded", description: "Please download the Kannada model for offline translation.", variant: "destructive"});
             return;
        }
        setTranslatedText(dictionary[sourceText.toLowerCase()] || "Translation not available in this demo.");
    };
    
    const handleDownload = () => {
        toast({ title: "Downloading...", description: "Kannada language model is being downloaded."});
        setTimeout(() => {
            setIsModelDownloaded(true);
            toast({ title: "Download Complete!", description: "You can now use offline translation."});
        }, 1500);
    }

    const toggleLanguage = () => {
        setSourceLang(targetLang);
        const currentSource = sourceText;
        setSourceText(translatedText);
        setTranslatedText(currentSource);
    };

    const handlePhrasebookClick = (phrase: {en: string, kn: string}) => {
        if (!isModelDownloaded) {
             toast({ title: "Model not downloaded", description: "Please download the model first.", variant: "destructive"});
             return;
        }
        if(sourceLang === 'en') {
            setSourceText(phrase.en);
            setTranslatedText(phrase.kn);
        } else {
            setSourceText(phrase.kn);
            setTranslatedText(phrase.en);
        }
    };

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
                     <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download Kannada Model
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
                            disabled={!isModelDownloaded}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{targetLang === 'en' ? 'English' : 'Kannada'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            value={translatedText} 
                            readOnly 
                            placeholder="Translation will appear here."
                            className="h-32 bg-muted/50"
                        />
                    </CardContent>
                </Card>
            </div>
            
            <div className="my-4 flex justify-center items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleLanguage} disabled={!isModelDownloaded} aria-label="Swap languages">
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
