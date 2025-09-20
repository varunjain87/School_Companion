"use client";

import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Trash2, CheckCircle, Circle, Brain, BookCopy } from 'lucide-react';
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

const suggestedConcepts = [
    {name: "Comparing unlike fractions", href: "/math"},
    {name: "Hydroelectricity basics", href: "/"},
    {name: "Parts of a plant", href: "/"}
];

export default function ProgressPage() {
    const { progress, resetProgress, streakData, streak } = useProgress();

    return (
        <div>
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Your Progress</h1>
                    <p className="text-muted-foreground">This data is stored only on your device.</p>
                </div>
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
