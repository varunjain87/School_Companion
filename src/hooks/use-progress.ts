"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

const PROGRESS_KEY = 'schoolCompanionProgress';

type ProgressData = {
  chaptersPracticed: string[];
  lastPracticed: string | null;
  practiceDates: string[];
};

const getInitialState = (): ProgressData => {
    if (typeof window === 'undefined') {
        return { chaptersPracticed: [], lastPracticed: null, practiceDates: [] };
    }
    try {
        const item = window.localStorage.getItem(PROGRESS_KEY);
        if (item) {
            const data = JSON.parse(item);
            if (data.chaptersPracticed && Array.isArray(data.chaptersPracticed)) {
                return {
                    chaptersPracticed: data.chaptersPracticed || [],
                    lastPracticed: data.lastPracticed || null,
                    practiceDates: data.practiceDates || []
                };
            }
        }
    } catch (error) {
        console.error("Error reading progress from localStorage", error);
    }
    return { chaptersPracticed: [], lastPracticed: null, practiceDates: [] };
};

export function useProgress() {
    const [progress, setProgress] = useState<ProgressData>(getInitialState);

    useEffect(() => {
        // Sync with localStorage on mount.
        setProgress(getInitialState());
    }, []);

    const updateProgress = useCallback((newProgressData: ProgressData) => {
        try {
            setProgress(newProgressData);
            window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgressData));
        } catch (error) {
            console.error("Error saving progress to localStorage", error);
        }
    }, []);

    const recordPractice = useCallback((chapter: string) => {
        const today = new Date().toISOString().split('T')[0];
        
        const currentProgress = getInitialState();

        const newChapters = currentProgress.chaptersPracticed.includes(chapter) 
            ? currentProgress.chaptersPracticed 
            : [...currentProgress.chaptersPracticed, chapter];
        
        const newPracticeDates = currentProgress.practiceDates.includes(today)
            ? currentProgress.practiceDates
            : [...currentProgress.practiceDates, today];

        updateProgress({
            chaptersPracticed: newChapters,
            lastPracticed: today,
            practiceDates: newPracticeDates,
        });

    }, [updateProgress]);

    const resetProgress = useCallback(() => {
        try {
            const initialState = { chaptersPracticed: [], lastPracticed: null, practiceDates: [] };
            setProgress(initialState);
            window.localStorage.removeItem(PROGRESS_KEY);
        } catch (error) {
            console.error("Error resetting progress in localStorage", error);
        }
    }, []);
    
    const streakData = useMemo(() => {
        return Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            return { 
                date: d, 
                practiced: progress.practiceDates.includes(dateString) 
            };
        }).reverse();
    }, [progress.practiceDates]);

    const streak = useMemo(() => {
        if (progress.practiceDates.length === 0) return 0;
        
        let currentStreak = 0;
        const sortedDates = [...progress.practiceDates].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        // Check if today is in the practice dates
        if (!sortedDates.includes(todayString)) {
            // Check if yesterday is the last practice date
             const yesterday = new Date();
             yesterday.setDate(yesterday.getDate() - 1);
             const yesterdayString = yesterday.toISOString().split('T')[0];
             if(sortedDates[0] !== yesterdayString) {
                return 0;
             }
        }

        for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const nextDate = i + 1 < sortedDates.length ? new Date(sortedDates[i+1]) : null;
            
            currentStreak++;

            if(nextDate) {
                const diffTime = currentDate.getTime() - nextDate.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                    break;
                }
            }
        }

        return currentStreak;
    }, [progress.practiceDates]);


    return { progress, recordPractice, resetProgress, streakData, streak };
}
