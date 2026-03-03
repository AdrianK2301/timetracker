import React from 'react';
import { Play, Square, Pause, RotateCcw, Clock } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

const ClockPanel = ({ tracker }) => {
    const { isClockedIn, isOnBreak, clockIn, clockOut, startBreak, endBreak, activeSession } = tracker;

    return (
        <div className="glass-card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Dashboard</h2>
                    <p style={{ color: 'var(--text-dim)' }}>
                        {isClockedIn ? `Angemeldet seit ${formatTime(activeSession.startTime)}` : 'Nicht angemeldet'}
                    </p>
                </div>
                {isClockedIn && (
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                        <Clock size={18} color={isOnBreak ? 'var(--warning)' : 'var(--success)'} />
                        <span style={{ fontWeight: 600 }}>{isOnBreak ? 'PAUSE' : 'ARBEITET'}</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {!isClockedIn ? (
                    <button
                        onClick={clockIn}
                        className="primary-btn"
                        style={{
                            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                            color: 'white',
                            justifyContent: 'center',
                            padding: '1.5rem'
                        }}
                    >
                        <Play fill="currentColor" /> Kommen
                    </button>
                ) : (
                    <>
                        {!isOnBreak ? (
                            <button
                                onClick={startBreak}
                                style={{
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    color: 'var(--warning)',
                                    justifyContent: 'center'
                                }}
                            >
                                <Pause fill="currentColor" /> Pause Start
                            </button>
                        ) : (
                            <button
                                onClick={endBreak}
                                style={{
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    color: 'var(--success)',
                                    justifyContent: 'center'
                                }}
                            >
                                <RotateCcw /> Pause Ende
                            </button>
                        )}
                        <button
                            onClick={clockOut}
                            style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: 'var(--danger)',
                                justifyContent: 'center'
                            }}
                        >
                            <Square fill="currentColor" /> Gehen
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClockPanel;
