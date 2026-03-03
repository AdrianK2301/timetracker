import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { formatMsToHHmm } from '../utils/timeUtils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { BarChart3, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MonthlyStats = ({ logs }) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter logs for current month
    const currentMonthLogs = logs.filter(log => {
        const date = new Date(log.startTime);
        return date >= monthStart && date <= monthEnd;
    });

    const totalWorkMs = currentMonthLogs.reduce((acc, log) => acc + log.workTime, 0);
    const totalPauseMs = currentMonthLogs.reduce((acc, log) => acc + log.totalBreaks, 0);
    const totalAttendanceMs = currentMonthLogs.reduce((acc, log) => acc + log.attendance, 0);

    const chartData = {
        labels: daysInMonth.map(day => format(day, 'dd')),
        datasets: [
            {
                label: 'Arbeitszeit (Std)',
                data: daysInMonth.map(day => {
                    const logForDay = currentMonthLogs.filter(log => isSameDay(new Date(log.startTime), day));
                    const dailyTotalMs = logForDay.reduce((acc, l) => acc + l.workTime, 0);
                    return (dailyTotalMs / (1000 * 60 * 60)).toFixed(2);
                }),
                backgroundColor: 'rgba(56, 189, 248, 0.6)',
                borderColor: 'rgba(56, 189, 248, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} Std`,
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            x: {
                ticks: { color: '#94a3b8' },
                grid: { display: false }
            }
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div className="glass-card fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <TrendingUp color="var(--primary)" />
                    <h2 style={{ fontSize: '1.25rem' }}>Monatsübersicht ({format(now, 'MMMM')})</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Arbeitszeit gesamt</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatMsToHHmm(totalWorkMs)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Pausen gesamt</span>
                        <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{formatMsToHHmm(totalPauseMs)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Anwesenheit</span>
                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMsToHHmm(totalAttendanceMs)}</span>
                    </div>
                </div>
            </div>

            <div className="glass-card fade-in" style={{ padding: '2rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <BarChart3 color="var(--primary)" />
                    <h2 style={{ fontSize: '1.25rem' }}>Arbeitsstunden pro Tag</h2>
                </div>
                <div style={{ height: '200px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default MonthlyStats;
