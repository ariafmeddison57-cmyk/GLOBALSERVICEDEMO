import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Coffee, Download, Plus, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { BranchId } from '../../types';
import { StaffView } from './StaffView';
import { StaffConsumptionView } from './StaffConsumptionView';

type StaffTab = 'roster' | 'schedule' | 'consumption';
const localDateKey = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const today = () => localDateKey(new Date());
const dateLabel = (date: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, options);
const weekStart = (date: Date) => { const d = new Date(date); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0, 0, 0, 0); return d; };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));

export const StaffHubView: React.FC = () => {
  const { staff, staffShifts, addStaffShift, t, language } = useApp();
  const [tab, setTab] = useState<StaffTab>('roster');
  const [weekOffset, setWeekOffset] = useState(0);
  const [branchFilter, setBranchFilter] = useState<BranchId | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newStaffId, setNewStaffId] = useState('');
  const [newDate, setNewDate] = useState(today());
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('16:00');
  const [newBreak, setNewBreak] = useState(30);
  const [newBranch, setNewBranch] = useState<BranchId>('west-walk');
  const weekDays = useMemo(() => {
    const start = weekStart(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => { const date = new Date(start); date.setDate(start.getDate() + i); return localDateKey(date); });
  }, [weekOffset]);
  const visibleShifts = staffShifts.filter((shift) => weekDays.includes(shift.date) && (branchFilter === 'all' || shift.branchId === branchFilter));
  const employee = (id: string) => staff.find((person) => person.id === id);

  const addShift = (event: React.FormEvent) => {
    event.preventDefault();
    const person = employee(newStaffId);
    if (!person || newEnd <= newStart) return;
    addStaffShift({ staffId: person.id, date: newDate, startTime: newStart, endTime: newEnd, breakMinutes: newBreak, branchId: newBranch, status: 'Published' });
    setShowAdd(false);
  };

  const downloadSchedule = () => {
    const rows = visibleShifts
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || (employee(a.staffId)?.name || '').localeCompare(employee(b.staffId)?.name || ''));
    const daySections = weekDays.map((date) => {
      const shifts = rows.filter((shift) => shift.date === date);
      const content = shifts.length
        ? `<table><thead><tr><th>Employee</th><th>Role</th><th>Branch</th><th>Shift</th><th>Break</th></tr></thead><tbody>${shifts.map((shift) => {
          const person = employee(shift.staffId);
          const name = language === 'ar' ? person?.nameAr : person?.name;
          const role = language === 'ar' ? person?.roleAr : person?.role;
          const branch = BRANCHES.find((item) => item.id === shift.branchId)?.name || shift.branchId;
          return `<tr><td><strong>${escapeHtml(name || 'Staff member')}</strong></td><td>${escapeHtml(role || '')}</td><td>${escapeHtml(branch)}</td><td>${escapeHtml(shift.startTime)} – ${escapeHtml(shift.endTime)}</td><td>${shift.breakMinutes} min</td></tr>`;
        }).join('')}</tbody></table>`
        : '<p class="empty">No shifts scheduled for this day.</p>';
      return `<section><h2>${escapeHtml(dateLabel(date, { weekday: 'long', month: 'long', day: 'numeric' }))}</h2>${content}</section>`;
    }).join('');
    const branchName = branchFilter === 'all' ? 'All branches' : BRANCHES.find((item) => item.id === branchFilter)?.name || branchFilter;
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weekly Staff Schedule</title><style>
      *{box-sizing:border-box}body{margin:0;padding:36px;background:#f4f5f2;color:#17221d;font:14px/1.5 Arial,sans-serif}.sheet{max-width:980px;margin:auto;background:#fff;padding:40px;border:1px solid #e0e5df;border-radius:18px}.brand{color:#52745e;font-weight:700;letter-spacing:.14em;font-size:11px;text-transform:uppercase}.title{font-size:30px;margin:8px 0 4px}.period{color:#65736a;margin-bottom:26px}.meta{display:flex;gap:10px;margin-bottom:24px}.badge{background:#f2f5f1;border:1px solid #e5ebe3;border-radius:8px;padding:8px 12px;font-size:12px}section{margin:22px 0 0;break-inside:avoid}h2{font-size:16px;margin:0 0 9px;border-bottom:1px solid #e7ebe7;padding-bottom:8px}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;color:#66736a;background:#f5f7f4;font-size:10px;text-transform:uppercase;letter-spacing:.06em}th,td{padding:10px 9px;border-bottom:1px solid #edf0ec}.empty{color:#89928b;font-style:italic;font-size:12px}.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e7ebe7;color:#778078;font-size:10px}@media print{body{background:#fff;padding:0}.sheet{border:0;border-radius:0;padding:20px;max-width:none}.title{font-size:24px}section{break-inside:avoid}}@media(max-width:600px){body{padding:10px}.sheet{padding:20px}.title{font-size:23px}table{font-size:10px}th,td{padding:7px 5px}}
      </style></head><body><main class="sheet"><div class="brand">Global Services</div><h1 class="title">Weekly Staff Schedule</h1><div class="period">${escapeHtml(dateLabel(weekDays[0], { month: 'short', day: 'numeric', year: 'numeric' }))} – ${escapeHtml(dateLabel(weekDays[6], { month: 'short', day: 'numeric', year: 'numeric' }))}</div><div class="meta"><span class="badge">${escapeHtml(branchName)}</span><span class="badge">${rows.length} scheduled shifts</span></div>${daySections}<div class="footer">Generated from the staff schedule · Please contact your manager if a shift needs clarification.</div></main></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GlobalServices-Staff-Schedule-${weekDays[0]}-to-${weekDays[6]}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const tabs: { id: StaffTab; label: string; icon: React.ElementType }[] = [
    { id: 'roster', label: t('Roster', 'قائمة الموظفين'), icon: Users },
    { id: 'schedule', label: t('Schedule', 'الجدول'), icon: CalendarDays },
    { id: 'consumption', label: t('Staff Consumption', 'استهلاك الموظفين'), icon: Coffee },
  ];

  return <div className="p-6 space-y-5 max-w-7xl mx-auto">
    <div><h1 className="text-xl font-bold">{t('Staff & HR', 'الموظفون والموارد البشرية')}</h1><p className="text-xs text-neutral-500 mt-1">{t('Staff roster and weekly shift planning.', 'قائمة الموظفين وتخطيط المناوبات الأسبوعية.')}</p></div>
    <div className="flex gap-1 p-1 w-fit rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${tab === id ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'}`}><Icon className="w-4 h-4" />{label}</button>)}
    </div>

    {tab === 'roster' && <StaffView />}
    {tab === 'consumption' && <StaffConsumptionView />}

    {tab === 'schedule' && <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800" onClick={() => setWeekOffset((n) => n - 1)} aria-label="Previous week"><ChevronLeft className="w-4 h-4" /></button><div className="text-sm font-bold">{dateLabel(weekDays[0])} – {dateLabel(weekDays[6])}</div><button className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800" onClick={() => setWeekOffset((n) => n + 1)} aria-label="Next week"><ChevronRight className="w-4 h-4" /></button><button onClick={() => setWeekOffset(0)} className="px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-900">{t('This week', 'هذا الأسبوع')}</button></div>
        <div className="flex flex-wrap items-center gap-2"><select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value as BranchId | 'all')} className="px-3 py-2 rounded-lg text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"><option value="all">{t('All branches', 'كل الفروع')}</option>{BRANCHES.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><button onClick={downloadSchedule} className="px-3 py-2 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex gap-2 items-center"><Download className="w-4 h-4" />{t('Download schedule', 'تنزيل الجدول')}</button><button onClick={() => { setNewStaffId(staff[0]?.id || ''); setNewDate(today()); setShowAdd(true); }} className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 flex gap-2 items-center"><Plus className="w-4 h-4" />{t('Add shift', 'إضافة مناوبة')}</button></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {weekDays.map((date) => { const shifts = visibleShifts.filter((shift) => shift.date === date); return <div key={date} className="text-left min-h-44 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"><div className="text-xs font-bold text-neutral-500">{dateLabel(date)}</div><div className="mt-3 space-y-2">{shifts.length ? shifts.map((shift) => { const person = employee(shift.staffId); return <div key={shift.id} className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800"><div className="text-xs font-bold truncate">{language === 'ar' ? person?.nameAr : person?.name}</div><div className="text-[10px] text-neutral-500 mt-1">{shift.startTime}–{shift.endTime} · {BRANCHES.find((b) => b.id === shift.branchId)?.name}</div><div className="text-[10px] text-neutral-500 mt-1">{shift.breakMinutes} min break</div></div>; }) : <div className="text-xs text-neutral-400 py-3">{t('No shifts planned', 'لا توجد مناوبات')}</div>}</div></div>; })}
      </div>
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-500">{t('Download a clean weekly schedule file to share with the team. The file includes each shift, employee, branch, and break.', 'نزّل ملف الجدول الأسبوعي لمشاركته مع الفريق، ويتضمن المناوبات والموظفين والفروع والاستراحات.')}</div>
      {showAdd && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form onSubmit={addShift} className="w-full max-w-md p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4"><div className="flex justify-between items-center"><h2 className="font-bold">{t('Add staff shift', 'إضافة مناوبة موظف')}</h2><button type="button" onClick={() => setShowAdd(false)} className="text-neutral-500">×</button></div><label className="block text-xs">{t('Employee', 'الموظف')}<select required value={newStaffId} onChange={(e) => setNewStaffId(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800">{staff.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label><label className="block text-xs">{t('Branch', 'الفرع')}<select value={newBranch} onChange={(e) => setNewBranch(e.target.value as BranchId)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800">{BRANCHES.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><label className="block text-xs">{t('Date', 'التاريخ')}<input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label><div className="grid grid-cols-3 gap-2"><label className="text-xs">{t('Start', 'البداية')}<input required type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label><label className="text-xs">{t('End', 'النهاية')}<input required type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label><label className="text-xs">{t('Break (min)', 'الاستراحة')}<input min={0} type="number" value={newBreak} onChange={(e) => setNewBreak(Number(e.target.value))} className="mt-1 w-full p-2 rounded-lg border bg-white dark:bg-neutral-800" /></label></div><button className="w-full p-2.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold">{t('Publish shift', 'نشر المناوبة')}</button></form></div>}
    </>}
  </div>;
};
