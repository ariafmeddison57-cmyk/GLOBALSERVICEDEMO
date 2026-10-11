import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  FileCheck,
  Clock,
  Search,
  Plus,
  ShieldAlert,
  Building,
  Phone,
  CheckCircle2,
  Calendar,
  Edit3,
  X,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { StaffMember, BranchId } from '../../types';

export const StaffView: React.FC = () => {
  const {
    staff,
    addStaffMember,
    updateStaffMember,
    updateStaffStatus,
    staffConsumptionRecords,
    t,
    language,
    formatCurrency,
    isRTL,
    playSound,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Modal State for Add / Edit Employee
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeModalMode, setEmployeeModalMode] = useState<'add' | 'edit'>('add');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formRole, setFormRole] = useState('Senior Barista');
  const [formRoleAr, setFormRoleAr] = useState('باريستا أول');
  const [formLocation, setFormLocation] = useState<BranchId>('west-walk');
  const [formQidNumber, setFormQidNumber] = useState('');
  const [formQidExpiry, setFormQidExpiry] = useState('2027-08-15');
  const [formFoodHandlingExpiry, setFormFoodHandlingExpiry] = useState('2027-06-30');
  const [formStatus, setFormStatus] = useState<StaffMember['status']>('On Shift');
  const [formBasicSalary, setFormBasicSalary] = useState<number>(4500);
  const [formAllowances, setFormAllowances] = useState<number>(1200);
  const [formPhone, setFormPhone] = useState('+974 5512 8490');

  const now = Date.now();
  const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;

  const activeStaffCount = staff.length;
  const expiringQidCount = staff.filter(
    (s) => new Date(s.qidExpiry).getTime() - now < thirtyDaysMs
  ).length;
  const expiringCertCount = staff.filter(
    (s) => new Date(s.foodHandlingExpiry).getTime() - now < thirtyDaysMs
  ).length;
  const totalOtHours = staff.reduce((sum, s) => sum + s.overtimeHours, 0);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameAr.includes(searchQuery) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.qidNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || s.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getQidStatus = (expiryDate: string) => {
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: t('Expired', 'منتهي'), color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' };
    if (diffDays <= 30) return { label: `${diffDays}d ` + t('left', 'يوم متبقي'), color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 font-bold' };
    return { label: t('Valid', 'ساري'), color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60' };
  };

  const getFoodHandlingStatus = (expiryDate: string) => {
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: t('Expired', 'منتهي'), color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' };
    if (diffDays <= 30) return { label: `${diffDays}d ` + t('left', 'يوم متبقي'), color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 font-bold' };
    return { label: t('Valid', 'ساري'), color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60' };
  };

  const handleOpenAddModal = () => {
    setEmployeeModalMode('add');
    setEditingEmployeeId(null);
    setFormName('');
    setFormNameAr('');
    setFormRole('Barista & Coffee Specialist');
    setFormRoleAr('باريستا ومختص قهوة');
    setFormLocation('west-walk');
    // Generate sample realistic Qatar 11-digit QID (starts with 2 or 3)
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    setFormQidNumber(`294${randomDigits.toString().slice(0, 8)}`);
    setFormQidExpiry('2027-11-20');
    setFormFoodHandlingExpiry('2027-09-15');
    setFormStatus('On Shift');
    setFormBasicSalary(4800);
    setFormAllowances(1200);
    setFormPhone(`+974 ${Math.floor(3000 + Math.random() * 6000)} ${Math.floor(1000 + Math.random() * 9000)}`);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditModal = (emp: StaffMember) => {
    setEmployeeModalMode('edit');
    setEditingEmployeeId(emp.id);
    setFormName(emp.name);
    setFormNameAr(emp.nameAr);
    setFormRole(emp.role);
    setFormRoleAr(emp.roleAr);
    setFormLocation(emp.location);
    setFormQidNumber(emp.qidNumber);
    setFormQidExpiry(emp.qidExpiry);
    setFormFoodHandlingExpiry(emp.foodHandlingExpiry);
    setFormStatus(emp.status);
    setFormBasicSalary(emp.basicSalary);
    setFormAllowances(emp.allowances);
    setFormPhone(emp.phone);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (employeeModalMode === 'add') {
      addStaffMember({
        name: formName,
        nameAr: formNameAr || formName,
        role: formRole,
        roleAr: formRoleAr || formRole,
        location: formLocation,
        qidNumber: formQidNumber || '29463401829',
        qidExpiry: formQidExpiry,
        foodHandlingExpiry: formFoodHandlingExpiry,
        status: formStatus,
        basicSalary: formBasicSalary,
        allowances: formAllowances,
        overtimeHours: 0,
        hourlyOtRate: parseFloat(((formBasicSalary / 240) * 1.25).toFixed(2)),
        joinDate: new Date().toISOString().slice(0, 10),
        phone: formPhone,
      });
    } else if (editingEmployeeId) {
      updateStaffMember(editingEmployeeId, {
        name: formName,
        nameAr: formNameAr,
        role: formRole,
        roleAr: formRoleAr,
        location: formLocation,
        qidNumber: formQidNumber,
        qidExpiry: formQidExpiry,
        foodHandlingExpiry: formFoodHandlingExpiry,
        status: formStatus,
        basicSalary: formBasicSalary,
        allowances: formAllowances,
        phone: formPhone,
      });
    }

    setIsEmployeeModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('Staff Roster & Qatar Compliance', 'فريق العمل والامتثال في دولة قطر')}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t(
              'Monitoring baristas, chefs, store supervisors, Qatar IDs (QID), and Baladiya Food Handling Certificates.',
              'متابعة الباريستا، الطهاة، مشرفي الفروع، بطاقات الإقامة القطرية وشهادات تداول الأغذية البلدية.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-xs font-semibold items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{t('Qatar MoI & MoPH Compliance Ready', 'مطابق لمعايير وزارة الداخلية والصحة')}</span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('+ Add New Employee', '+ إضافة موظف جديد')}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Active Staff Count', 'إجمالي فريق العمل')}</span>
            <Users className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {activeStaffCount} {t('Employees', 'موظف')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {staff.filter((s) => s.status === 'On Shift').length} {t('currently on shift', 'على رأس العمل حالياً')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Expiring QID (<30d)', 'إقامات تنتهي قريباً')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {expiringQidCount} {t('Staff', 'موظف')}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            {t('Immediate Metrash2 renewal required', 'يتطلب التجديد الفوري عبر مطراش ٢')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Expiring Food Handling Certs', 'شهادات تداول الأغذية المنتهية')}</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {expiringCertCount} {t('Staff', 'موظف')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {t('Medical Commission renewal booked', 'حجز مواعيد القومسيون الطبي')}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('Overtime Hours (MTD)', 'ساعات العمل الإضافي')}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalOtHours} {t('Hours', 'ساعة')}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {t('Logged from biometric attendance', 'مسجلة من أجهزة البصمة')}
          </div>
        </div>
      </div>

      {/* Compliance Notification Banner if any */}
      {expiringQidCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
              {t('Urgent Qatar ID Expiry Action Alert', 'تنبيه عاجل لتجديد بطاقة الإقامة القطرية')}
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
              {t(
                'Amir Khan (Shift Supervisor, Gulf Mall) QID expires in 17 days. Failure to renew within grace period incurs Ministry of Interior fines and WPS salary block.',
                'تنتهي إقامة أمير خان (مشرف فرع غولف مول) خلال ١٧ يوماً. عدم التجديد يؤدي لغرامات وإيقاف تحويل الراتب بنظام WPS.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search staff name, QID or role...', 'ابحث بالاسم أو الرقم الشخصي أو المسمى...')}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl outline-none border border-neutral-200 dark:border-neutral-700"
            >
              <option value="all">{t('All Shift Statuses', 'كافة الحالات')}</option>
              <option value="On Shift">{t('On Shift', 'على رأس العمل')}</option>
              <option value="Break">{t('Break', 'استراحة')}</option>
              <option value="Off Duty">{t('Off Duty', 'إجازة / غير مناوب')}</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl outline-none border border-neutral-200 dark:border-neutral-700"
            >
              <option value="all">{t('All Locations', 'كافة الفروع')}</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-4">{t('Employee', 'الموظف')}</th>
                <th className="py-3 px-4">{t('Role & Designation', 'المسمى الوظيفي')}</th>
                <th className="py-3 px-4">{t('Assigned Branch', 'الفرع')}</th>
                <th className="py-3 px-4">{t('Qatar ID (QID)', 'الرقم الشخصي')}</th>
                <th className="py-3 px-3">{t('QID Expiry', 'انتهاء الإقامة')}</th>
                <th className="py-3 px-3">{t('Food Handling Certificate', 'شهادة تداول الأغذية')}</th>
                <th className="py-3 px-4 text-center">{t('Duty Status', 'حالة المناوبة')}</th>
                <th className="py-3 px-3 text-right">{t('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {filteredStaff.map((emp) => {
                const qidStat = getQidStatus(emp.qidExpiry);
                const branch = BRANCHES.find((b) => b.id === emp.location);

                return (
                  <tr key={emp.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">
                        {language === 'ar' ? emp.nameAr : emp.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{emp.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                      {language === 'ar' ? emp.roleAr : emp.role}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                      {branch?.name}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                      {emp.qidNumber}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs">{emp.qidExpiry}</div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded mt-0.5 inline-block ${qidStat.color}`}>
                        {qidStat.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs">{emp.foodHandlingExpiry}</div>
                      {(() => {
                        const fhStat = getFoodHandlingStatus(emp.foodHandlingExpiry);
                        return (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded mt-0.5 inline-block ${fhStat.color}`}>
                            {fhStat.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={emp.status}
                        onChange={(e) => updateStaffStatus(emp.id, e.target.value as StaffMember['status'])}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border-none outline-none cursor-pointer ${
                          emp.status === 'On Shift'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : emp.status === 'Break'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        <option value="On Shift">{t('On Shift', 'على رأس العمل')}</option>
                        <option value="Break">{t('Break', 'استراحة')}</option>
                        <option value="Off Duty">{t('Off Duty', 'غير مناوب')}</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="p-1.5 text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title={t('Edit Employee Info', 'تعديل بيانات الموظف')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t('Staff Consumption Records', 'سجل استهلاك الموظفين')}</h3>
            <p className="text-[11px] text-neutral-500 mt-1">{t('Items recorded for workers from POS are listed here and excluded from customer sales.', 'تظهر هنا أصناف الموظفين المسجلة من نقطة البيع ولا تحتسب ضمن مبيعات العملاء.')}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200 text-[10px] font-bold">{staffConsumptionRecords.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 uppercase text-[10px]"><tr>
              <th className="p-3">{t('Employee', 'الموظف')}</th><th className="p-3">{t('Items', 'الأصناف')}</th><th className="p-3">{t('Quantity', 'الكمية')}</th><th className="p-3">{t('Branch', 'الفرع')}</th><th className="p-3">{t('Internal Cost', 'التكلفة الداخلية')}</th><th className="p-3">{t('Recorded by / time', 'المسجل / الوقت')}</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {staffConsumptionRecords.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-neutral-500">{t('No staff items have been recorded yet.', 'لم يتم تسجيل أصناف للموظفين بعد.')}</td></tr> : staffConsumptionRecords.map((record) => (
                <tr key={record.id}>
                  <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">{record.staffName}</td>
                  <td className="p-3">{record.items.map((item) => `${item.product.name} ×${item.quantity}`).join(', ')}</td>
                  <td className="p-3 font-mono">{record.quantity}</td>
                  <td className="p-3">{BRANCHES.find((branch) => branch.id === record.branchId)?.name || record.branchId}</td>
                  <td className="p-3 font-mono font-bold">{formatCurrency(record.cost)}</td>
                  <td className="p-3"><span className="block">{record.loggedBy}</span><span className="text-neutral-500">{record.createdAt.toLocaleString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. MODAL: Add / Edit Employee */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  {employeeModalMode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {employeeModalMode === 'add'
                      ? t('Register New Employee', 'تسجيل موظف جديد')
                      : t('Edit Employee Details', 'تعديل بيانات الموظف')}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-neutral-400">
                    {t(
                      'All credentials sync with Qatar WPS Wage Protection System and branch rosters.',
                      'تتزامن كافة البيانات مع نظام حماية الأجور (WPS) وجداول مناوبات الفروع.'
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEmployee} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                  {t('Full Name', 'الاسم الكامل')} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormNameAr(e.target.value);
                  }}
                  placeholder="e.g. Tariq Al-Nuaimi"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Role & Designation', 'المسمى الوظيفي')} *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      setFormRole(e.target.value);
                      if (e.target.value === 'Head Barista') setFormRoleAr('رئيس الباريستا');
                      else if (e.target.value === 'Chef de Partie') setFormRoleAr('شيف دي بارتي');
                      else if (e.target.value === 'Head Baker') setFormRoleAr('رئيس قسم المخبوزات');
                      else if (e.target.value === 'POS Cashier & Host') setFormRoleAr('كاشير ومضيف');
                      else if (e.target.value === 'Branch Supervisor') setFormRoleAr('مشرف فرع');
                      else setFormRoleAr('باريستا ومختص قهوة');
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  >
                    <option value="Senior Barista">Senior Barista</option>
                    <option value="Head Barista">Head Barista</option>
                    <option value="Chef de Partie">Chef de Partie (Hot Kitchen)</option>
                    <option value="Head Baker">Head Baker (Pastry & Dough)</option>
                    <option value="POS Cashier & Host">POS Cashier & Host</option>
                    <option value="Branch Supervisor">Branch Supervisor</option>
                    <option value="Service Crew">Service Crew</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Assigned Branch Location', 'الفرع التابع له')} *
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value as BranchId)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Qatar ID & Expiries */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Qatar ID (QID Number)', 'الرقم الشخصي (QID)')} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={formQidNumber}
                    onChange={(e) => setFormQidNumber(e.target.value)}
                    placeholder="29463401829"
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('QID Expiry Date', 'تاريخ انتهاء الإقامة')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formQidExpiry}
                    onChange={(e) => setFormQidExpiry(e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Food Handling Certificate Expiry', 'تاريخ انتهاء شهادة تداول الأغذية')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formFoodHandlingExpiry}
                    onChange={(e) => setFormFoodHandlingExpiry(e.target.value)}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
              </div>

              {/* Salary & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Basic Salary (QAR)', 'الراتب الأساسي (ر.ق)')} *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="100"
                    required
                    value={formBasicSalary}
                    onChange={(e) => setFormBasicSalary(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Housing & Allowances (QAR)', 'البدلات والسكن (ر.ق)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formAllowances}
                    onChange={(e) => setFormAllowances(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Contact Mobile Phone', 'رقم الهاتف الجوال')}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+974 5512 8490"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
              </div>

              {/* Duty Shift Status */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                  {t('Initial Shift Duty Status', 'حالة المناوبة')}
                </label>
                <div className="flex items-center gap-3">
                  {(['On Shift', 'Break', 'Off Duty'] as StaffMember['status'][]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        formStatus === st
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 border-slate-900 dark:border-white shadow-xs'
                          : 'bg-zinc-50 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-neutral-700'
                      }`}
                    >
                      {t(st, st === 'On Shift' ? 'على رأس العمل' : st === 'Break' ? 'استراحة' : 'غير مناوب')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-neutral-700 text-xs font-bold text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {t('Cancel', 'إلغاء')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {employeeModalMode === 'add'
                      ? t('Save & Add Employee to Roster', 'حفظ وإضافة الموظف للفريق')
                      : t('Update Employee Record', 'تحديث بيانات الموظف')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
