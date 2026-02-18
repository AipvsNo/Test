
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Student, DashboardStats } from './types';
import { analyzeStudentPerformance } from './services/geminiService';

// --- Components ---

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string; value: string | number; trend: string; icon: React.ReactNode }> = ({ 
  label, value, trend, icon 
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl text-blue-600">
        {icon}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
      }`}>
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const StudentRow: React.FC<{ student: Student; onEdit: (s: Student) => void; onAnalyze: (s: Student) => void }> = ({ student, onEdit, onAnalyze }) => (
  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
    <td className="py-4 pl-4">
      <div className="flex items-center gap-3">
        <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
        <div>
          <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
          <p className="text-xs text-slate-500">{student.email}</p>
        </div>
      </div>
    </td>
    <td className="py-4 text-sm text-slate-600">Grade {student.gradeLevel}</td>
    <td className="py-4">
      <span className={`text-sm font-semibold ${student.gpa >= 3.5 ? 'text-emerald-600' : student.gpa < 2.0 ? 'text-red-600' : 'text-slate-700'}`}>
        {student.gpa.toFixed(2)}
      </span>
    </td>
    <td className="py-4">
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${student.attendance >= 90 ? 'bg-emerald-500' : student.attendance >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${student.attendance}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">{student.attendance}%</span>
      </div>
    </td>
    <td className="py-4">
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        student.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}>
        {student.status}
      </span>
    </td>
    <td className="py-4 pr-4 text-right">
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => onAnalyze(student)}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors title='AI Insight'"
        >
          <BrainCircuit size={18} />
        </button>
        <button 
          onClick={() => onEdit(student)}
          className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </td>
  </tr>
);

// --- Mock Data ---

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Alice Thompson', email: 'alice.t@school.edu', gradeLevel: 10, gpa: 3.85, attendance: 96, status: 'Active', enrollmentDate: '2023-09-01', avatar: 'https://picsum.photos/seed/alice/100/100', notes: 'Excellent in math, needs slight help in literature.' },
  { id: '2', name: 'James Wilson', email: 'james.w@school.edu', gradeLevel: 11, gpa: 2.90, attendance: 84, status: 'Active', enrollmentDate: '2022-09-01', avatar: 'https://picsum.photos/seed/james/100/100', notes: 'Showing improvement in science subjects.' },
  { id: '3', name: 'Sarah Parker', email: 'sarah.p@school.edu', gradeLevel: 12, gpa: 4.00, attendance: 99, status: 'Active', enrollmentDate: '2021-09-01', avatar: 'https://picsum.photos/seed/sarah/100/100', notes: 'Valedictorian candidate. Active in student council.' },
  { id: '4', name: 'Marcus Chen', email: 'marcus.c@school.edu', gradeLevel: 9, gpa: 3.20, attendance: 92, status: 'Active', enrollmentDate: '2024-09-01', avatar: 'https://picsum.photos/seed/marcus/100/100', notes: 'New student, adapting well to the curriculum.' },
  { id: '5', name: 'Elena Rodriguez', email: 'elena.r@school.edu', gradeLevel: 10, gpa: 1.85, attendance: 65, status: 'Inactive', enrollmentDate: '2023-09-01', avatar: 'https://picsum.photos/seed/elena/100/100', notes: 'Struggling with attendance. Intervention required.' },
  { id: '6', name: 'David Kim', email: 'david.k@school.edu', gradeLevel: 11, gpa: 3.50, attendance: 95, status: 'Active', enrollmentDate: '2022-09-01', avatar: 'https://picsum.photos/seed/david/100/100', notes: 'Interested in computer science club.' },
];

const ATTENDANCE_DATA = [
  { month: 'Sep', attendance: 94 },
  { month: 'Oct', attendance: 92 },
  { month: 'Nov', attendance: 95 },
  { month: 'Dec', attendance: 88 },
  { month: 'Jan', attendance: 91 },
  { month: 'Feb', attendance: 93 },
];

const GPA_DISTRIBUTION = [
  { grade: '9', gpa: 3.1 },
  { grade: '10', gpa: 3.4 },
  { grade: '11', gpa: 3.2 },
  { grade: '12', gpa: 3.6 },
];

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'grades'>('dashboard');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [analyzingStudent, setAnalyzingStudent] = useState<Student | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // --- Logic ---

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const stats = useMemo<DashboardStats>(() => {
    const total = students.length;
    const avgGpa = students.reduce((acc, s) => acc + s.gpa, 0) / total;
    const avgAtt = students.reduce((acc, s) => acc + s.attendance, 0) / total;
    const active = students.filter(s => s.status === 'Active').length;
    return { totalStudents: total, averageGpa: avgGpa, averageAttendance: avgAtt, activeStudents: active };
  }, [students]);

  const handleOpenModal = (student?: Student) => {
    setEditingStudent(student || null);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStudent: Student = {
      id: editingStudent?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      gradeLevel: Number(formData.get('gradeLevel')),
      gpa: Number(formData.get('gpa')),
      attendance: Number(formData.get('attendance')),
      status: formData.get('status') as 'Active' | 'Inactive',
      enrollmentDate: editingStudent?.enrollmentDate || new Date().toISOString().split('T')[0],
      avatar: editingStudent?.avatar || `https://picsum.photos/seed/${Math.random()}/100/100`,
      notes: formData.get('notes') as string,
    };

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? newStudent : s));
    } else {
      setStudents(prev => [newStudent, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleAnalyze = async (student: Student) => {
    setAnalyzingStudent(student);
    setIsLoadingAnalysis(true);
    setAiAnalysis(null);
    const analysis = await analyzeStudentPerformance(student);
    setAiAnalysis(analysis);
    setIsLoadingAnalysis(false);
  };

  // --- Views ---

  const DashboardView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={stats.totalStudents} trend="+4.2%" icon={<Users size={24} />} />
        <StatCard label="Avg. GPA" value={stats.averageGpa.toFixed(2)} trend="+0.12" icon={<TrendingUp size={24} />} />
        <StatCard label="Avg. Attendance" value={`${stats.averageAttendance.toFixed(1)}%`} trend="-2.4%" icon={<CheckCircle2 size={24} />} />
        <StatCard label="Active Status" value={stats.activeStudents} trend="+2" icon={<AlertCircle size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_DATA}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#2563eb" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Avg GPA by Grade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GPA_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} label={{ value: 'Grade Level', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="gpa" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const StudentsView = () => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
            <Filter size={18} />
            Filters
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm font-medium"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-50">
            <tr>
              <th className="py-4 pl-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
              <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">GPA</th>
              <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
              <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="py-4 pr-4 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <StudentRow 
                  key={student.id} 
                  student={student} 
                  onEdit={handleOpenModal} 
                  onAnalyze={handleAnalyze} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center text-slate-400">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">No students found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 text-blue-600 mb-8">
            <GraduationCap size={32} />
            <span className="text-xl font-bold tracking-tight text-slate-900">EduStream</span>
          </div>
          
          <nav className="space-y-2">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<Users size={20} />} 
              label="Students" 
              active={activeTab === 'students'} 
              onClick={() => setActiveTab('students')} 
            />
            <SidebarItem 
              icon={<GraduationCap size={20} />} 
              label="Grades" 
              active={activeTab === 'grades'} 
              onClick={() => setActiveTab('grades')} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-6 space-y-2 border-t border-slate-50">
          <SidebarItem icon={<Settings size={20} />} label="Settings" onClick={() => {}} />
          <SidebarItem icon={<LogOut size={20} />} label="Logout" onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'students' ? 'Student Directory' : 'Grading System'}
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, Principal Henderson
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold">Robert Henderson</p>
              <p className="text-xs text-slate-500 font-medium">Administrator</p>
            </div>
            <img 
              src="https://picsum.photos/seed/admin/100/100" 
              className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
              alt="Admin"
            />
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'students' && <StudentsView />}
        {activeTab === 'grades' && (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <GraduationCap size={64} className="mb-4 opacity-10" />
             <p className="text-lg font-medium">Grades module coming soon</p>
           </div>
        )}

        {/* AI Analysis Sidebar/Overlay */}
        {analyzingStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
              <div className="p-6 border-b border-slate-50 sticky top-0 bg-white z-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <BrainCircuit size={24} />
                  </div>
                  <h2 className="text-xl font-bold">AI Performance Insight</h2>
                </div>
                <button onClick={() => setAnalyzingStudent(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-8">
                  <img src={analyzingStudent.avatar} className="w-14 h-14 rounded-full ring-2 ring-white shadow-sm" alt="" />
                  <div>
                    <h3 className="font-bold text-lg">{analyzingStudent.name}</h3>
                    <p className="text-sm text-slate-500">Grade {analyzingStudent.gradeLevel} • GPA {analyzingStudent.gpa}</p>
                  </div>
                </div>

                {isLoadingAnalysis ? (
                  <div className="space-y-6">
                    <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                    <div className="pt-8 grid grid-cols-2 gap-4">
                      <div className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
                      <div className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Assessment Summary</h4>
                      <p className="text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        {aiAnalysis.summary}
                      </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <section className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                        <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-3">
                          <CheckCircle2 size={16} /> Key Strengths
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.strengths.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 bg-emerald-400 rounded-full shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                      <section className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                        <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-3">
                          <AlertCircle size={16} /> Improvements
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.areasForImprovement.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 bg-amber-400 rounded-full shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Educator Recommendations</h4>
                      <div className="space-y-3">
                        {aiAnalysis.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-sm text-slate-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <p>Failed to load analysis. Please try again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingStudent ? 'Edit Student Profile' : 'Register New Student'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveStudent} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <input name="name" defaultValue={editingStudent?.name} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <input name="email" type="email" defaultValue={editingStudent?.email} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Grade Level</label>
                    <select name="gradeLevel" defaultValue={editingStudent?.gradeLevel || 9} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                      {[9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <select name="status" defaultValue={editingStudent?.status || 'Active'} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">GPA Score</label>
                    <input name="gpa" type="number" step="0.01" max="4.0" min="0" defaultValue={editingStudent?.gpa} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="4.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Attendance %</label>
                    <input name="attendance" type="number" max="100" min="0" defaultValue={editingStudent?.attendance} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Internal Notes</label>
                  <textarea name="notes" defaultValue={editingStudent?.notes} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" placeholder="Add observations, medical info, etc..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">Save Student</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
