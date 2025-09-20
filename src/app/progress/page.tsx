"use client";

import { useState } from 'react';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Trash2, CheckCircle, Circle, Brain, BookCopy, Mail, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getAiSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/components/chat-message';


const suggestedConcepts = [
    {name: "Comparing unlike fractions", href: "/math"},
    {name: "Hydroelectricity basics", href: "/"},
    {name: "Parts of a plant", href: "/"}
];

export default function ProgressPage() {
    const { progress, resetProgress, streakData, streak } = useProgress();
    const { toast } = useToast();
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleSendSummary = async () => {
        setIsSummarizing(true);
        try {
            const item = window.sessionStorage.getItem('chatMessages');
            const messages: Message[] = item ? JSON.parse(item) : [];
            const userQuestions = messages.filter(m => m.role === 'user').map(m => m.content);

            if (userQuestions.length === 0) {
                toast({
                    title: "No Activity",
                    description: "No questions have been asked yet today.",
                });
                return;
            }
            
            const result = await getAiSummary(userQuestions);

            if (result.success) {
                toast({
                    title: "Summary Sent",
                    description: "The daily learning summary has been emailed to the parent.",
                });
            } else {
                toast({
                    title: "Summarization Failed",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error sending summary:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while sending the summary.",
                variant: "destructive",
            });
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-wrap gap-4 justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Your Progress</h1>
                    <p className="text-muted-foreground">This data is stored only on your device.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSendSummary} disabled={isSummarizing}>
                        {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                        Send Daily Summary
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                <Trash2 className="mr-2 h-4 w-4" /> Reset Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all your progress data from this device. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={resetProgress} variant="destructive">
                                Yes, delete my data
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Flame className="text-orange-500" />
                            Practice Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">{streak} <span className="text-lg font-normal text-muted-foreground">days</span></p>
                         <p className="text-sm text-muted-foreground mt-2">Practice daily to build your streak!</p>
                        <div className="mt-4 flex justify-between gap-1">
                            {streakData.map(({ date, practiced }, index) => (
                                <div key={index} className="flex flex-col items-center gap-2" title={date.toLocaleDateString()}>
                                    <span className="text-xs font-medium text-muted-foreground">{date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                                    {practiced ? 
                                        <CheckCircle className="h-7 w-7 text-green-500" /> :
                                        <Circle className="h-7 w-7 text-muted-foreground/20" />
                                    }
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookCopy />
                            Chapters Practiced
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {progress.chaptersPracticed.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {progress.chaptersPracticed.map(chapter => (
                                    <Badge key={chapter} variant="secondary" className="text-base">{chapter}</Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No chapters practiced yet. Start a lesson on the 'Learn' tab!</p>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain />
                            Suggested Next Concepts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {suggestedConcepts.map(concept => (
                                <li key={concept.name}>
                                    <Button asChild variant="link" className="p-0 h-auto font-normal">
                                      <a href={concept.href}>{concept.name}</a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
