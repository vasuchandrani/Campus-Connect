import "./AdminUsersPage.css";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Label } from "../../../components/ui/Label";
import { Avatar, AvatarFallback } from "../../../components/ui/Avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/DropdownMenu";
import {
  UserPlus,
  MoreVertical,
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  Trash2,
  Users,
  GraduationCap,
  Newspaper,
  Clock,
  ExternalLink,
  Mail,
  Loader2,
  BookOpen,
} from "lucide-react";
import { collegeAdminNavItems } from "../../../config/Navigation";
import { toast } from "../../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import EmptyState from "../../../components/ui/EmptyState";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { collegeAdminApi, departmentApi } from "../../../services/api";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  // Data states
  const [journalists, setJournalists] = useState([]);
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [journalistRequests, setJournalistRequests] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "",
    variant: "destructive",
    onConfirm: null,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [journalistOpen, setJournalistOpen] = useState(false);
  const [newJournalistEmail, setNewJournalistEmail] = useState("");

  const [studentOpen, setStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    department: "",
    year: "1",
    studentId: "",
    gender: "MALE",
  });

  const [excelOpen, setExcelOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const [professorOpen, setProfessorOpen] = useState(false);
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [requesting, setRequesting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  const fetchJournalistRequests = async () => {
    try {
      const data = await collegeAdminApi.getJournalistRequests();
      setJournalistRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching journalist requests:", err);
    }
  };

  const fetchJournalists = async () => {
    try {
      const data = await collegeAdminApi.getJournalists();
      setJournalists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching journalists:", err);
    }
  };

  const fetchProfessors = async () => {
    try {
      const data = await collegeAdminApi.getProfessors();
      setProfessors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching professors:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await collegeAdminApi.getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getMyCollegeDepartments();
      const list = Array.isArray(data) ? data : [];
      setDepartments(list);
      if (list.length > 0) {
        setNewStudent((prev) => ({ ...prev, department: prev.department || list[0].name }));
        setNewProfessor((prev) => ({ ...prev, department: prev.department || list[0].name }));
      }
    } catch (err) {
      console.error("Error fetching college departments:", err);
    }
  };

  useEffect(() => {
    const loadAllUsers = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchJournalists(),
          fetchStudents(),
          fetchProfessors(),
          fetchJournalistRequests(),
          fetchDepartments(),
        ]);
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadAllUsers();
  }, []);

  // Journalist actions
  const handleAddJournalist = async () => {
    if (!newJournalistEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the student's email address.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const data = await collegeAdminApi.addJournalist({
        email: newJournalistEmail.trim(),
      });
      toast({
        title: "Journalist Appointed",
        description:
          data.message ||
          "Credentials and appointment notification sent to student.",
        variant: "success",
      });
      setJournalistOpen(false);
      setNewJournalistEmail("");
      await fetchJournalists();
    } catch (err) {
      toast({
        title: "Appointment Failed",
        description: err.message || "Could not appoint journalist.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleToggleJournalistActive = async (journalistId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.toggleJournalistActive(journalistId);
      toast({
        title: "Status Updated",
        description: data.message || "Journalist status updated successfully.",
        variant: "success",
      });
      await fetchJournalists();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to update journalist status.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleRemoveJournalist = async (journalistId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.removeJournalist(journalistId);
      toast({
        title: "Journalist Removed",
        description: data.message || "Journalist removed successfully.",
        variant: "success",
      });
      await fetchJournalists();
    } catch (err) {
      toast({
        title: "Removal Failed",
        description: err.message || "Failed to remove journalist.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptToggleJournalistActive = (j) => {
    const isActive = j.isActive !== false;
    setConfirmDialog({
      open: true,
      title: isActive ? "Deactivate Journalist" : "Activate Journalist",
      description: isActive
        ? `Are you sure you want to deactivate ${j.name || j.email}? They will temporarily lose publishing privileges.`
        : `Are you sure you want to activate ${j.name || j.email}? They will regain publishing privileges.`,
      confirmText: isActive ? "Deactivate" : "Activate",
      variant: isActive ? "warning" : "success",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleToggleJournalistActive(j.id);
      },
    });
  };

  const promptRemoveJournalist = (j) => {
    setConfirmDialog({
      open: true,
      title: "Remove Journalist",
      description: `Are you sure you want to remove ${j.name || j.email}? This will revoke their campus journalism access permanently.`,
      confirmText: "Remove Journalist",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRemoveJournalist(j.id);
      },
    });
  };

  const handleAcceptJournalistRequest = async (requestId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.acceptJournalistRequest(requestId);
      setJournalistRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast({
        title: "Application Approved",
        description:
          data.message || "Student approved and appointed as journalist.",
        variant: "success",
      });
      await Promise.all([fetchJournalistRequests(), fetchJournalists()]);
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to accept application.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptAcceptJournalistRequest = (req) => {
    setConfirmDialog({
      open: true,
      title: "Approve Journalist Application",
      description: `Approve ${req.studentName || req.journalistName || req.studentEmail || "this applicant"} as an official campus journalist? They will be granted permissions to draft and submit articles for publication.`,
      confirmText: "Approve Journalist",
      variant: "success",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleAcceptJournalistRequest(req.id);
      },
    });
  };

  const handleRejectJournalistRequest = async (requestId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.rejectJournalistRequest(requestId);
      setJournalistRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast({
        title: "Application Rejected",
        description: data.message || "Journalist request rejected.",
        variant: "default",
      });
      await fetchJournalistRequests();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to reject application.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptRejectJournalistRequest = (req) => {
    setConfirmDialog({
      open: true,
      title: "Reject Journalist Application",
      description: `Are you sure you want to reject the application from ${req.studentName || req.journalistName || req.studentEmail || "this applicant"}? This request will be permanently dismissed.`,
      confirmText: "Reject Application",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRejectJournalistRequest(req.id);
      },
    });
  };

  // Student actions
  const handleAddStudent = async () => {
    if (
      !newStudent.name ||
      !newStudent.email ||
      !newStudent.studentId ||
      !newStudent.department
    ) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill out all required student fields.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const payload = {
        fullName: newStudent.name,
        email: newStudent.email,
        id: newStudent.studentId,
        department: newStudent.department,
        batchYear:
          new Date().getFullYear() -
          parseInt(newStudent.year, 10) +
          1,
        gender: newStudent.gender,
      };

      const data = await collegeAdminApi.uploadStudent(payload);
      toast({
        title: "Student Registered",
        description: data.message || "Student enrolment completed.",
        variant: "success",
      });
      setStudentOpen(false);
      setNewStudent({
        name: "",
        email: "",
        department: "",
        year: "1",
        studentId: "",
        gender: "MALE",
      });
      await fetchStudents();
    } catch (err) {
      toast({
        title: "Enrolment Failed",
        description: err.message || "Could not register student.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleUploadExcel = async () => {
    if (!excelFile) {
      toast({
        title: "File Required",
        description: "Please select an Excel (.xlsx, .xls) file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    setRequesting(true);
    try {
      const data = await collegeAdminApi.uploadStudentsExcel(formData);
      toast({
        title: "Students Imported",
        description: data.message || "Excel batch processed successfully.",
        variant: "success",
      });
      setExcelOpen(false);
      setExcelFile(null);
      await fetchStudents();
    } catch (err) {
      toast({
        title: "Import Failed",
        description: err.message || "Failed to process Excel file.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleToggleStudentStatus = async (studentId, currentStatus) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.toggleStudentStatus(studentId);
      toast({
        title: "Status Updated",
        description:
          data.message ||
          `Student ${currentStatus ? "suspended" : "activated"}.`,
        variant: "success",
      });
      await fetchStudents();
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err.message || "Failed to update student status.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptToggleStudentStatus = (s) => {
    const isActive = s.isActive !== false;
    setConfirmDialog({
      open: true,
      title: isActive ? "Suspend Student Account" : "Activate Student Account",
      description: isActive
        ? `Are you sure you want to suspend "${s.fullName}"? Suspended students will be blocked from accessing student portal services.`
        : `Are you sure you want to reactivate "${s.fullName}"? Their account access will be restored.`,
      confirmText: isActive ? "Suspend Student" : "Activate Student",
      variant: isActive ? "warning" : "success",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleToggleStudentStatus(s.id, isActive);
      },
    });
  };

  const handleDeleteStudent = async (studentId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.deleteStudent(studentId);
      toast({
        title: "Student Deleted",
        description: data.message || "Student removed successfully.",
        variant: "success",
      });
      await fetchStudents();
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: err.message || "Failed to delete student.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptDeleteStudent = (s) => {
    setConfirmDialog({
      open: true,
      title: "Delete Student Record",
      description: `Are you sure you want to permanently delete "${s.fullName}"? All their enrolments, club memberships, and campus records will be removed.`,
      confirmText: "Delete Student",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleDeleteStudent(s.id);
      },
    });
  };

  // Professor actions
  const handleAddProfessor = async () => {
    if (!newProfessor.name || !newProfessor.email) {
      toast({
        title: "Fields Required",
        description: "Please enter professor name and email address.",
        variant: "destructive",
      });
      return;
    }

    setRequesting(true);
    try {
      const data = await collegeAdminApi.addProfessor({
        fullName: newProfessor.name.trim(),
        name: newProfessor.name.trim(),
        email: newProfessor.email.trim(),
        department: newProfessor.department,
      });

      toast({
        title: "Professor Added",
        description:
          data.message || "Faculty member registered successfully.",
        variant: "success",
      });
      setProfessorOpen(false);
      setNewProfessor({
        name: "",
        email: "",
        department: "Computer Science",
      });
      await fetchProfessors();
    } catch (err) {
      toast({
        title: "Failed to Add Professor",
        description: err.message || "Could not add professor.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleRemoveProfessor = async (professorId) => {
    setRequesting(true);
    try {
      const data = await collegeAdminApi.removeProfessor(professorId);
      toast({
        title: "Professor Removed",
        description: data.message || "Professor removed successfully.",
        variant: "success",
      });
      await fetchProfessors();
    } catch (err) {
      toast({
        title: "Removal Failed",
        description: err.message || "Failed to remove professor.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const promptRemoveProfessor = (p) => {
    const profName = p.fullName || p.name || p.email;
    setConfirmDialog({
      open: true,
      title: "Remove Faculty Professor",
      description: `Are you sure you want to remove professor "${profName}"? They will no longer be available for club mentorship or research evaluation assignments.`,
      confirmText: "Remove Professor",
      variant: "destructive",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleRemoveProfessor(p.id);
      },
    });
  };

  // Filtered queries
  const filteredJournalists = useMemo(() => {
    return journalists.filter(
      (j) =>
        (j.fullName || j.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.studentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.department || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [journalists, searchQuery]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.studentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.department || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const filteredProfessors = useMemo(() => {
    return professors.filter(
      (p) =>
        (p.fullName || p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.department || p.about || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [professors, searchQuery]);

  const filteredRequests = useMemo(() => {
    return journalistRequests.filter(
      (r) =>
        (r.studentName || r.journalistName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.why || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [journalistRequests, searchQuery]);

  // Tailored Skeleton
  if (pageLoading) {
    return (
      <DashboardLayout navItems={collegeAdminNavItems} title="User Management">
        <div className="space-y-6 animate-pulse">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-6 w-44 bg-muted rounded" />
              <div className="h-3.5 w-64 bg-muted/60 rounded" />
            </div>
            <div className="h-9 w-full sm:w-64 bg-muted rounded-lg" />
          </div>
          <div className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 sm:w-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-border/60 bg-card/60 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-44 bg-muted/60 rounded" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={collegeAdminNavItems} title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              User Directory
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage campus journalists, enrolled students, faculty professors, and position requests.
            </p>
          </div>

          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, ID..."
              className="pl-9 text-xs sm:text-sm h-9 bg-card/80 border-border/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* SUB TABS IN EXACT ORDER:
            1. Journalists
            2. Students
            3. Professors
            4. Pending Approval */}
        <Tabs defaultValue="journalists" className="space-y-6">
          <div className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:inline-flex sm:w-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/60 rounded-xl gap-1.5 sm:gap-1">
              <TabsTrigger
                value="journalists"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Journalists
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="professors"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Professors
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="text-xs sm:text-sm py-2 sm:py-1.5 px-3 rounded-lg justify-center font-medium w-full"
              >
                Pending Approval
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: JOURNALISTS */}
          <TabsContent value="journalists" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Campus Journalists
                </h3>
                <p className="text-xs text-muted-foreground">
                  Appointed student reporters publishing college newspaper editions.
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs h-9 shadow-xs self-start sm:self-auto"
                onClick={() => setJournalistOpen(true)}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Add Journalist
              </Button>
            </div>

            {filteredJournalists.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Newspaper className="w-8 h-8 text-muted-foreground" />}
                    title="No Journalists Found"
                    desc="Appoint students as journalists by email to start publishing articles."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredJournalists.map((j) => {
                  const isActive = j.isActive !== false;
                  const journalistName = j.fullName || j.name || "Campus Journalist";
                  const journalistEmail = j.email || (j.student && j.student.email) || "";
                  const studentId = j.studentId || (j.student && j.student.studentId);
                  const department = j.department || (j.student && j.student.department);
                  const batchYear = j.batchYear || (j.student && j.student.batchYear);

                  return (
                    <Card
                      key={j.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border transition-all flex flex-col justify-between"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {journalistName}
                            </p>
                            {journalistEmail && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {journalistEmail}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {isActive ? "Active" : "Deactivated"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {studentId && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              ID: {studentId}
                            </Badge>
                          )}
                          {department && (
                            <Badge variant="outline" className="text-[10px] py-0">
                              {department}
                            </Badge>
                          )}
                          {batchYear && (
                            <span className="text-[10px] text-muted-foreground">
                              Batch {batchYear}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <div className="p-4 sm:p-5 pt-0 flex gap-2 border-t border-border/50 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 border-border/80"
                          disabled={requesting}
                          onClick={() => promptToggleJournalistActive(j)}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/5 px-2.5"
                          disabled={requesting}
                          onClick={() => promptRemoveJournalist(j)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: STUDENTS */}
          <TabsContent value="students" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Enrolled Students
                </h3>
                <p className="text-xs text-muted-foreground">
                  Total student directory registered in this institution.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9 border-border/80"
                  onClick={() => setExcelOpen(true)}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Excel Import
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-9 shadow-xs"
                  onClick={() => setStudentOpen(true)}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Add Student
                </Button>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<Users className="w-8 h-8 text-muted-foreground" />}
                    title="No Students Registered"
                    desc="Enrol individual students or batch import student rosters via Excel."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredStudents.map((s) => {
                  const isActive = s.isActive !== false;
                  return (
                    <Card
                      key={s.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-border transition-all flex flex-col justify-between"
                    >
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {s.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {s.email}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {isActive ? "Active" : "Suspended"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {s.studentId && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              ID: {s.studentId}
                            </Badge>
                          )}
                          {s.department && (
                            <Badge variant="outline" className="text-[10px] py-0">
                              {s.department}
                            </Badge>
                          )}
                          {s.batchYear && (
                            <span className="text-[10px] text-muted-foreground">
                              Batch {s.batchYear}
                            </span>
                          )}
                        </div>
                      </CardContent>

                      <div className="p-4 sm:p-5 pt-0 flex gap-2 border-t border-border/50 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8 border-border/80"
                          disabled={requesting}
                          onClick={() => promptToggleStudentStatus(s)}
                        >
                          {isActive ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/5 px-2.5"
                          disabled={requesting}
                          onClick={() => promptDeleteStudent(s)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: PROFESSORS */}
          <TabsContent value="professors" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Faculty Professors
                </h3>
                <p className="text-xs text-muted-foreground">
                  Academic faculty available as club mentors and research reviewers.
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs h-9 shadow-xs self-start sm:self-auto"
                onClick={() => setProfessorOpen(true)}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Add Professor
              </Button>
            </div>

            {filteredProfessors.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<GraduationCap className="w-8 h-8 text-muted-foreground" />}
                    title="No Professors Found"
                    desc="Add faculty members to allow club mentor assignments and research paper reviews."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredProfessors.map((p) => {
                  const profName =
                    p.fullName ||
                    p.name ||
                    (p.email ? p.email.split("@")[0] : "Faculty Professor");
                  const initial = profName[0] ? profName[0].toUpperCase() : "P";
                  const dept = p.department || p.about || "Academic Faculty";
                  const joinDate = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <Card
                      key={p.id}
                      className="border-border/70 bg-card/70 backdrop-blur-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between rounded-xl overflow-hidden group"
                    >
                      <CardContent className="p-4 sm:p-5 space-y-3.5">
                        {/* Header: Avatar, Name, Email, and Action */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <Avatar className="w-11 h-11 border border-amber-500/20 shadow-2xs shrink-0 mt-0.5">
                              <AvatarFallback className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                {initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
                                  {profName}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-medium"
                                >
                                  Faculty
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 shrink-0 text-muted-foreground/60" />
                                <span>{p.email}</span>
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg transition-colors"
                            disabled={requesting}
                            onClick={() => promptRemoveProfessor(p)}
                            title="Remove Professor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Department / Specialization & Joined Date */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal py-0.5 px-2 bg-muted/60 text-foreground flex items-center gap-1"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span>{dept}</span>
                          </Badge>
                          {joinDate && (
                            <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3 text-muted-foreground/50" />
                              <span>Joined {joinDate}</span>
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: PENDING APPROVAL (JOURNALIST REQUESTS) */}
          <TabsContent value="requests" className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card className="border-border/70 bg-card/60">
                <CardContent className="p-8">
                  <EmptyState
                    icon={<CheckCircle2 className="w-8 h-8 text-muted-foreground" />}
                    title="No Pending Applications"
                    desc="All student journalist requests have been reviewed."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => (
                  <Card
                    key={req.id}
                    className="border-border/70 bg-card/70 backdrop-blur-xs flex flex-col justify-between"
                  >
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground">
                            {req.studentName || req.journalistName || "Student Applicant"}
                          </p>
                          {req.studentEmail && (
                            <p className="text-[11px] text-muted-foreground">
                              {req.studentEmail}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          Journalist Applicant
                        </Badge>
                      </div>

                      {req.experience && (
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-foreground">Experience:</p>
                          <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                            {req.experience}
                          </p>
                        </div>
                      )}

                      {req.portfolioLink && (
                        <div className="text-xs">
                          <a
                            href={req.portfolioLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Portfolio / Samples
                          </a>
                        </div>
                      )}
                    </CardContent>

                    <div className="p-4 sm:p-5 pt-0 flex gap-2 border-t border-border/50 pt-3">
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8 shadow-xs"
                        disabled={requesting}
                        onClick={() => promptAcceptJournalistRequest(req)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve Journalist
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                        disabled={requesting}
                        onClick={() => promptRejectJournalistRequest(req)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* MODAL: ADD JOURNALIST */}
        <Dialog open={journalistOpen} onOpenChange={setJournalistOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-primary" />
                Appoint Campus Journalist
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Provide the student's email to assign journalist permissions and generate portal access.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="j-email" className="text-xs font-semibold">
                  Student Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="j-email"
                  type="email"
                  placeholder="student@college.edu"
                  className="text-xs sm:text-sm h-9"
                  value={newJournalistEmail}
                  onChange={(e) => setNewJournalistEmail(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setJournalistOpen(false)}
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9"
                onClick={handleAddJournalist}
                disabled={!newJournalistEmail.trim() || requesting}
              >
                {requesting ? "Appointing..." : "Appoint Journalist"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: ADD SINGLE STUDENT */}
        <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Enrol Student
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Add an individual student profile to your institution directory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  className="text-xs sm:text-sm h-9"
                  placeholder="Student name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email *</Label>
                <Input
                  type="email"
                  className="text-xs sm:text-sm h-9"
                  placeholder="student@college.edu"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Student ID *</Label>
                  <Input
                    className="text-xs sm:text-sm h-9"
                    placeholder="e.g. 2024CS01"
                    value={newStudent.studentId}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        studentId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Department *</Label>
                  <select
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm"
                    value={newStudent.department}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id || dept.name} value={dept.name}>
                        {dept.name} {dept.code && dept.code !== dept.name ? `(${dept.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Study Year</Label>
                  <select
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm"
                    value={newStudent.year}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }))
                    }
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Gender</Label>
                  <select
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm"
                    value={newStudent.gender}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setStudentOpen(false)}
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9"
                onClick={handleAddStudent}
                disabled={requesting}
              >
                {requesting ? "Registering..." : "Enrol Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: EXCEL BATCH UPLOAD */}
        <Dialog open={excelOpen} onOpenChange={setExcelOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Batch Import Students
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Upload a standardized Excel spreadsheet (.xlsx, .xls) containing student enrolments.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-2 hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Click below or drag your spreadsheet file
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  className="text-xs h-9"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                />
              </div>
              {excelFile && (
                <p className="text-xs text-primary font-medium truncate">
                  Selected: {excelFile.name}
                </p>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setExcelOpen(false)}
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9"
                onClick={handleUploadExcel}
                disabled={!excelFile || requesting}
              >
                {requesting ? "Processing..." : "Upload & Enrol"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: ADD PROFESSOR */}
        <Dialog open={professorOpen} onOpenChange={setProfessorOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Register Faculty Member
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Add a professor to act as club mentors and research review committee.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Professor Name *</Label>
                <Input
                  placeholder="e.g. Dr. Jane Smith"
                  className="text-xs sm:text-sm h-9"
                  value={newProfessor.name}
                  onChange={(e) =>
                    setNewProfessor((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="professor@college.edu"
                  className="text-xs sm:text-sm h-9"
                  value={newProfessor.email}
                  onChange={(e) =>
                    setNewProfessor((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Department *</Label>
                <select
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs sm:text-sm"
                  value={newProfessor.department}
                  onChange={(e) =>
                    setNewProfessor((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id || dept.name} value={dept.name}>
                      {dept.name} {dept.code && dept.code !== dept.name ? `(${dept.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setProfessorOpen(false)}
                disabled={requesting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-9"
                onClick={handleAddProfessor}
                disabled={requesting}
              >
                {requesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Add Professor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CONFIRMATION DIALOG */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog((prev) => ({ ...prev, open }))
          }
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          variant={confirmDialog.variant}
          loading={requesting}
          onConfirm={confirmDialog.onConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
