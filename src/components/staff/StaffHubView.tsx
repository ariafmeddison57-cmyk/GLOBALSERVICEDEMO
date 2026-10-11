import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock3, Users, ChevronLeft, ChevronRight, Plus, Check, LogIn, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { BranchId } from '../../types';
import { StaffView } from './StaffView';

type StaffTab = 'roster' | 'schedule' | 'timesheets';
const today = () => { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); };
const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const weekStart = (date: Date) => { const d = new Date(date); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0, 0, 0, 0); return d; };

export const StaffHubView: React.FC = () => {
  const { staff, staffShifts, addStaffShift, staffTimesheets, clockInStaff, clockOutStaff, reviewStaffTimesheet, t, language } = useApp();
  const [tab, setTab] = useState<StaffTab>('roster');
  const [weekOffset, setWeekOffset] = useState(0);
  const [branchFilter, setBranchFilter] = useState<BranchId | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(today());
  const [showAdd, setShowAdd] = useState(false);
  const [newStaffId, setNewStaffId] = useState('');
  const [newDate, setNewDate] = useState(today());
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('16:00');
  const [newBreak, setNewBreak] = useState(30);
  const [newBranch, setNewBranch] = useState<BranchId>('west-walk');
  const weekDays = useMemo(() => {
    const start = weekStart(new Date()); start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); });
  }, [weekOffset]);
  const visibleShifts = staffShifts.filter((shift) => weekDays.includes(shift.date) && (branchFilter === 'all' || shift.branchId === branchFilter));
  const dayShifts = staffShifts.filter((shift) => shift.date === selectedDate);
  const employee = (id: string) => staff.find((person) => person.id === id);
  const openTimesheet = (staffId: string) => staffTimesheets.find((entry) => entry.staffId === staffId && !entry.clockOut);
  const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const addShift = (event: React.FormEvent) => {
    event.preventDefault();
    const person = employee(newStaffId);
    if (!person || newEnd <= newStart) return;
    addStaffShift({ staffId: person.id, date: newDate, startTime: newStart, endTime: newEnd, breakMinutes: newBreak, branchId: newBranch, status: 'Published' });
    setSelectedDate(newDate); setShowAdd(false);
  };

  const tabs: { id: StaffTab; label: string; icon: React.ElementType }[] = [
    { id: 'roster', label: t('Roster', 'قائمة الموظفين'), icon: Users },
    { id: 'schedule', label: t('Schedule', 'الجدول'), icon: CalendarDays },
    { id: 'timesheets', label: t('Timesheets', 'سجلات الدوام'), icon: Clock3 },
  ];

  return <div className="p-6 space-y-5 max-w-7xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-xl font-bold">{t('Staff & HR', 'الموظفون والموارد البشرية')}</h1><p className="text-xs text-neutral-500 mt-1">{t('Roster, planned shifts, and attendance in one place.', 'قائمة الموظفين والمناوبات والحضور في مكان واحد.')}</p></div>
    </div>
    <div className="flex gap-1 p-1 w-fit rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${tab === id ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'}`}><Icon className="w-4 h-4" />{label}</button>)}
    </div>

    {tab === 'roster' && <StaffView />}

    {tab === 'schedule' && <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800" onClick={() => setWeekOffset((n) => n - 1)} aria-label="Previous week"><ChevronLeft className="w-4 h-4" /></button><div className="text-sm font-bold">{dateLabel(weekDays[0])} – {dateLabel(weekDays[6])}</div><button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800" onClick={() => setWeekOffset((n) => n + 1)} aria-label="Next week"><ChevronRight className="w-4 h-4" /></button><button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-900">{t('This week', 'هذا الأسبوع')}</button></div>
        <div className="flex items-center gap-2"><select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value as BranchId | 'all')} className="px-3 py-2 rounded-lg text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"><option value="all">{t('All branches', 'كل الفروع')}</option>{BRANCHES.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><button onClick={() => { setNewStaffId(staff[0]?.id || ''); setShowAdd(true); }} className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 flex gap-2 items-center"><Plus className="w-4 h-4" />{t('Add shift', 'إضافة مناوبة')}</button></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {weekDays.map((date) => { const shifts = visibleShifts.filter((shift) => shift.date === date); return <button key={date} onClick={() => { setSelectedDate(date); setTab('timesheets'); }} className={`text-left min-h-44 p-3 rounded-2xl border ${selectedDate === date ? 'border-amber-400 ring-1 ring-amber-300' : 'border-neutral-200 dark:border-neutral-800'} bg-white dark:bg-neutral-900`}><div className="text-xs font-bold text-neutral-500">{dateLabel(date)}</div><div className="mt-3 space-y-2">{shifts.length ? shifts.map((shift) => { const person = employee(shift.staffId); return <div key={shift.id} className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800"><div className="text-xs font-bold truncate">{language === 'ar' ? person?.nameAr : person?.name}</div><div className="text-[10px] text-neutral-500 mt-1">{shift.startTime}–{shift.endTime} · {BRANCHES.find((b) => b.id === shift.branchId)?.name}</div><div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">{shift.status}</div></div>; }) : <div className="text-xs text-neutral-400 py-3">{t('No shifts planned', 'لا توجد مناوبات')}</div>}</div></button>; })}
      </div>
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-500">{t('Planned shifts do not change Duty Status. Clocking in and out on Timesheets records actual attendance and updates Staff & HR.', 'المناوبات المخططة لا تغير حالة الدوام. تسجيل الحضور والانصراف في سجلات الدوام يسجل الحضور الفعلي ويحدث حالة الموظف.')}</div>
      {showAdd && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form onSubmit={addShift} className="w-full max-w-md p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4"><div className="flex justify-between items-center"><h2 className="font-bold">{t('Add staff shift', 'إضافة مناوبة موظف')}</h2><button type="button" onClick={() => setShowAdd(false)} className="text-neutral-500">×</button></div><label className="block text-xs">{t('Employee', 'الموظف')}<select required value={newStaffId} onChange={(e) => setNewStaffId(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800">{staff.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label><label className="block text-xs">{t('Branch', 'الفرع')}<select value={newBranch} onChange={(e) => setNewBranch(e.target.value as BranchId)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800">{BRANCHES.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label className="block text-xs">{t('Date', 'التاريخ')}<input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label><div className="grid grid-cols-3 gap-2"><label className="text-xs">{t('Start', 'البداية')}<input required type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label><label className="text-xs">{t('End', 'النهاية')}<input required type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label><label className="text-xs">{t('Break (min)', 'الاستراحة')}<input min={0} type="number" value={newBreak} onChange={(e) => setNewBreak(Number(e.target.value))} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label></div><button className="w-full p-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold">{t('Publish shift', 'نشر المناوبة')}</button></form></div>}
    </>}

    {tab === 'timesheets' && <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">{t('Attendance & timesheets', 'الحضور وسجلات الدوام')}</h2><p className="text-xs text-neutral-500 mt-1">{t('Clock actions update Duty Status and create a reviewable attendance record.', 'تحديث حالة الدوام وتسجيل الحضور للمراجعة.')}</p></div><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" /></div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"><table className="w-full text-left text-xs"><thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500"><tr><th className="p-3">{t('Employee', 'الموظف')}</th><th className="p-3">{t('Planned shift', 'المناوبة المخططة')}</th><th className="p-3">{t('Clock in', 'الحضور')}</th><th className="p-3">{t('Clock out', 'الانصراف')}</th><th className="p-3">{t('Duty status', 'حالة الدوام')}</th><th className="p-3">{t('Record', 'السجل')}</th><th className="p-3">{t('Action', 'إجراء')}</th></tr></thead><tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">{staff.filter((person) => branchFilter === 'all' || person.location === branchFilter).map((person) => { const shift = dayShifts.find((item) => item.staffId === person.id); const record = staffTimesheets.find((item) => item.staffId === person.id && item.date === selectedDate); const open = selectedDate === today() ? openTimesheet(person.id) : undefined; return <tr key={person.id}><td className="p-3"><div className="font-bold">{language === 'ar' ? person.nameAr : person.name}</div><div className="text-neutral-500 mt-0.5">{person.role}</div></td><td className="p-3">{shift ? `${shift.startTime}–${shift.endTime}` : '—'}</td><td className="p-3">{formatTime(record?.clockIn)}</td><td className="p-3">{formatTime(record?.clockOut)}</td><td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${person.status === 'On Shift' ? 'bg-emerald-100 text-emerald-800' : person.status === 'Break' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'}`}>{person.status}</span></td><td className="p-3">{record?.status || t('No record', 'لا يوجد سجل')}</td><td className="p-3">{open ? <button onClick={() => clockOutStaff(person.id)} className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold flex items-center gap-1"><LogOut className="w-3 h-3" />{t('Clock out', 'تسجيل الانصراف')}</button> : record?.status === 'Pending Review' ? <button onClick={() => reviewStaffTimesheet(record.id)} className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1"><Check className="w-3 h-3" />{t('Approve', 'اعتماد')}</button> : !record && selectedDate === today() ? <button onClick={() => clockInStaff(person.id, shift?.id)} className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold flex items-center gap-1"><LogIn className="w-3 h-3" />{t('Clock in', 'تسجيل الحضور')}</button> : !record ? <span className="text-neutral-400">{t('No record', 'لا يوجد سجل')}</span> : <span className="text-neutral-400">{t('Complete', 'مكتمل')}</span>}</td></tr>; })}</tbody></table></div>
      <div className="grid sm:grid-cols-3 gap-3"><div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"><div className="text-xs text-neutral-500">{t('On shift now', 'على رأس العمل')}</div><div className="text-2xl font-bold mt-1">{staff.filter((p) => p.status === 'On Shift').length}</div></div><div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"><div className="text-xs text-neutral-500">{t('Awaiting review', 'بانتظار المراجعة')}</div><div className="text-2xl font-bold mt-1">{staffTimesheets.filter((entry) => entry.date === selectedDate && entry.status === 'Pending Review').length}</div></div><div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"><div className="text-xs text-neutral-500">{t('Scheduled today', 'المناوبات اليوم')}</div><div className="text-2xl font-bold mt-1">{dayShifts.length}</div></div></div>
    </>}
  </div>;
};
