
export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
  gpa: number;
  attendance: number;
  status: 'Active' | 'Inactive';
  enrollmentDate: string;
  avatar: string;
  notes: string;
}

export interface DashboardStats {
  totalStudents: number;
  averageGpa: number;
  averageAttendance: number;
  activeStudents: number;
}

export interface PerformanceAnalysis {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}
