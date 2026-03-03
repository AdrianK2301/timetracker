import React from 'react';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import { formatTime, formatMsToHHmm } from '../utils/timeUtils';
import { format } from 'date-fns';

const LogTable = ({ logs, onExportExcel, onExportPDF }) => {
    return (
        <div className="glass-card fade-in" style={{ padding: '2rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TableIcon color="var(--primary)" />
                    <h2 style={{ fontSize: '1.25rem' }}>Arbeitszeiten Übersicht</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={onExportExcel} style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <Download size={16} /> Excel
                    </button>
                    <button onClick={onExportPDF} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <FileText size={16} /> PDF
                    </button>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '1rem' }}>Datum</th>
                        <th style={{ padding: '1rem' }}>Kommen / Gehen</th>
                        <th style={{ padding: '1rem' }}>Anwesenheit</th>
                        <th style={{ padding: '1rem' }}>Pause (Auto)</th>
                        <th style={{ padding: '1rem' }}>Netto Arbeitszeit</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Keine Einträge vorhanden</td>
                        </tr>
                    ) : (
                        logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{format(new Date(log.startTime), 'dd.MM.yyyy')}</td>
                                <td style={{ padding: '1rem' }}>
                                    {formatTime(log.startTime)} - {formatTime(log.endTime)}
                                </td>
                                <td style={{ padding: '1rem' }}>{formatMsToHHmm(log.attendance)}</td>
                                <td style={{ padding: '1rem' }}>
                                    {formatMsToHHmm(log.actualBreaks)}
                                    {log.autoDeducted > 0 && <span style={{ color: 'var(--warning)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>(+ {formatMsToHHmm(log.autoDeducted)})</span>}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{formatMsToHHmm(log.workTime)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LogTable;
