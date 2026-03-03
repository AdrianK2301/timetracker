import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useTimeTracker } from './hooks/useTimeTracker';
import ClockPanel from './components/ClockPanel';
import LogTable from './components/LogTable';
import MonthlyStats from './components/MonthlyStats';
import Auth from './components/Auth';
import { formatMsToHHmm, formatTime } from './utils/timeUtils';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Clock, LogOut, User } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const tracker = useTimeTracker(session?.user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const exportToExcel = () => {
    const data = tracker.logs.map(log => ({
      'Datum': format(new Date(log.startTime), 'dd.MM.yyyy'),
      'Kommen': formatTime(log.startTime),
      'Gehen': formatTime(log.endTime),
      'Anwesenheit': formatMsToHHmm(log.attendance),
      'Pause (Real)': formatMsToHHmm(log.actualBreaks),
      'Pause (Auto-Abzug)': formatMsToHHmm(log.autoDeducted),
      'Pause (Gesamt)': formatMsToHHmm(log.totalBreaks),
      'Netto Arbeitszeit': formatMsToHHmm(log.workTime),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Arbeitszeiten");
    XLSX.writeFile(wb, `Arbeitszeiten_${format(new Date(), 'yyyy-MM')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Arbeitszeitnachweis", 14, 15);
    doc.setFontSize(10);
    doc.text(`Mitarbeiter: ${session.user.email}`, 14, 22);
    doc.text(`Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 14, 27);

    const tableColumn = ["Datum", "Zeitraum", "Anw.", "Pause", "Netto"];
    const tableRows = tracker.logs.map(log => [
      format(new Date(log.startTime), 'dd.MM.yyyy'),
      `${formatTime(log.startTime)} - ${formatTime(log.endTime)}`,
      formatMsToHHmm(log.attendance),
      formatMsToHHmm(log.totalBreaks),
      formatMsToHHmm(log.workTime)
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const totalWorkMs = tracker.logs.reduce((acc, l) => acc + l.workTime, 0);
    doc.text(`Gesamt Arbeitszeit: ${formatMsToHHmm(totalWorkMs)}`, 14, finalY);

    doc.save(`Arbeitszeiten_${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Laden...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white' }}>
            <Clock size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, white, var(--text-dim))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              TimeTracker
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>Präzise Zeiterfassung & Dokumentation</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
            <User size={16} color="var(--primary)" />
            <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.user.email}
            </span>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main>
        {tracker.loading ? (
          <div className="glass-card fade-in" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            Lade deine Arbeitszeiten...
          </div>
        ) : (
          <>
            <ClockPanel tracker={tracker} />
            <MonthlyStats logs={tracker.logs} />
            <LogTable
              logs={tracker.logs}
              onExportExcel={exportToExcel}
              onExportPDF={exportToPDF}
            />
          </>
        )}
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', paddingBottom: '2rem' }}>
        &copy; {new Date().getFullYear()} TimeTracker Pro - Verbunden mit Supabase Cloud.
      </footer>
    </div>
  );
}

export default App;
