import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateWorkSession } from '../utils/timeUtils';

const STORAGE_KEY_ACTIVE = 'tt_active_session';

export const useTimeTracker = (user) => {
    const [activeSession, setActiveSession] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
        return saved ? JSON.parse(saved) : null;
    });

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync active session with local storage (safe for active tracking)
    useEffect(() => {
        if (activeSession) {
            localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeSession));
        } else {
            localStorage.removeItem(STORAGE_KEY_ACTIVE);
        }
    }, [activeSession]);

    // Fetch logs from Supabase
    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('working_hours')
            .select('*')
            .order('start_time', { ascending: false });

        if (error) {
            console.error('Error fetching logs:', error);
        } else {
            // Map Supabase fields to our component fields if necessary
            const mappedLogs = data.map(log => ({
                id: log.id,
                startTime: log.start_time,
                endTime: log.end_time,
                attendance: log.attendance_ms,
                actualBreaks: log.actual_breaks_ms,
                totalBreaks: log.total_breaks_ms,
                autoDeducted: log.auto_deducted_ms,
                workTime: log.work_time_ms,
                breaks: log.breaks
            }));
            setLogs(mappedLogs);
        }
        setLoading(false);
    };

    const clockIn = () => {
        if (activeSession || !user) return;
        setActiveSession({
            startTime: new Date().toISOString(),
            breaks: [],
            onBreak: false,
            userId: user.id
        });
    };

    const startBreak = () => {
        if (!activeSession || activeSession.onBreak) return;
        const newBreaks = [...activeSession.breaks, { start: new Date().toISOString(), end: null }];
        setActiveSession({ ...activeSession, breaks: newBreaks, onBreak: true });
    };

    const endBreak = () => {
        if (!activeSession || !activeSession.onBreak) return;
        const lastBreak = activeSession.breaks[activeSession.breaks.length - 1];
        const updatedBreaks = [
            ...activeSession.breaks.slice(0, -1),
            { ...lastBreak, end: new Date().toISOString() }
        ];
        setActiveSession({ ...activeSession, breaks: updatedBreaks, onBreak: false });
    };

    const clockOut = async () => {
        if (!activeSession || !user) return;

        let finalBreaks = activeSession.breaks;
        if (activeSession.onBreak) {
            const lastBreak = activeSession.breaks[activeSession.breaks.length - 1];
            finalBreaks = [
                ...activeSession.breaks.slice(0, -1),
                { ...lastBreak, end: new Date().toISOString() }
            ];
        }

        const endTime = new Date().toISOString();
        const stats = calculateWorkSession(
            new Date(activeSession.startTime),
            new Date(endTime),
            finalBreaks.map(b => ({ start: new Date(b.start), end: new Date(b.end) }))
        );

        const { data, error } = await supabase
            .from('working_hours')
            .insert([{
                user_id: user.id,
                start_time: activeSession.startTime,
                end_time: endTime,
                attendance_ms: stats.attendance,
                actual_breaks_ms: stats.actualBreaks,
                total_breaks_ms: stats.totalBreaks,
                auto_deducted_ms: stats.autoDeducted,
                work_time_ms: stats.workTime,
                breaks: finalBreaks
            }])
            .select();

        if (error) {
            console.error('Error saving log:', error);
            alert('Fehler beim Speichern der Arbeitszeit.');
        } else {
            fetchLogs(); // Refresh list
            setActiveSession(null);
        }
    };

    return {
        activeSession,
        logs,
        loading,
        clockIn,
        clockOut,
        startBreak,
        endBreak,
        isOnBreak: activeSession?.onBreak || false,
        isClockedIn: !!activeSession,
        refreshLogs: fetchLogs
    };
};
