import { useCallback, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { UserPlus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import { collegeAdminNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/ui/Loading";
import EmptyState from "../../components/ui/EmptyState";

const navItems = collegeAdminNavItems;

const AdminUsersPage = () => {
  //base URL for API calls related to users
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/college-admin/users`;

  // states
  const [journalists, setJournalists] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [journalistRequests, setJournalistRequests] = useState([]);

  const [students, setStudents] = useState([]);
  const [exploreStudents, setExploreStudents] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    studentId: "",
    gender: "",
  });

  const [excelFile, setExcelFile] = useState(null);

  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewerEmail, setNewReviewerEmail] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    requestId: null,
  });
  const [reviewerOpen, setReviewerOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState({
    journalists: false,
    reviewers: false,
    journalistRequests: false,
    students: false,
  });

  const navigate = useNavigate();
  const { routeProtection } = useAuth();

  useEffect(() => {
    if (!routeProtection("COLLEGE_ADMIN")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);

  //fetch journalist requests
  const fetchJournalistsRequests = async () => {
    setLoading((prev) => ({ ...prev, journalistRequests: true }));

    try {
      const res = await fetch(`${baseUrl}/journalist-req`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setJournalistRequests(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch journalist requests",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, journalistRequests: false }));
    }
  };

  //fetch journalists
  const fetchJournalists = async () => {
    setLoading((prev) => ({ ...prev, journalists: true }));

    try {
      const res = await fetch(`${baseUrl}/journalist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setJournalists(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch journalists",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, journalists: false }));
    }
  };

  //fetch reviewers
  const fetchReviewers = async () => {
    setLoading((prev) => ({ ...prev, reviewers: true }));

    try {
      const res = await fetch(`${baseUrl}/reviewer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      setReviewers(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch reviewers",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, reviewers: false }));
    }
  };

  //fetch students
  const fetchStudents = async () => {
    setLoading((prev) => ({ ...prev, students: true }));
    const token = localStorage.getItem("authToken");
    fetch(`${baseUrl}/student`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        });
      })
      .finally(() => setLoading((prev) => ({ ...prev, students: false })));
  };

  //load initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchJournalistsRequests(),
        fetchJournalists(),
        fetchReviewers(),
      ]);
    };

    fetchData();
  }, []);

  //fetch students when exploreStudents is toggled
  useEffect(() => {
    if (exploreStudents) {
      fetchStudents();
    }
  }, [exploreStudents]);

  //Add student API call
  const addStudent = async (student) => {
    setRequesting(true);
    await fetch(`${baseUrl}/student/add-one`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(student),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Student registered successfully!") {
          toast({
            title: "Success",
            description: "Student added successfully",
            variant: "success",
          });
          fetchStudents();
        } else {
          throw new Error("Failed to add student");
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to add student",
          variant: "destructive",
        });
      })
      .finally(() => setRequesting(false));
  };

  //change in data of student
  const handleStudentChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  //add student handler
  const handleAddStudent = async () => {
    const { name, email, department, year, studentId, gender } = newStudent;

    if (name && email && department && year && studentId && gender) {
      await addStudent({
        id: studentId,
        fullName: name,
        email: email,
        gender: gender,
        department: department,
        year: year,
      });

      // reset form
      setNewStudent({
        name: "",
        email: "",
        department: "",
        year: "",
        studentId: "",
        gender: "",
      });

      setStudentOpen(false);
    }
  };

  //Approve Journalist Api call
  const handleApproveJournalist = async (id) => {
    setRequesting(true);
    await fetch(`${baseUrl}/journalist-req/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Journalist Request accepted successfully") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchJournalistsRequests();
          fetchJournalists();
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to approve journalist request",
          variant: "destructive",
        });
      })
      .finally(() => setRequesting(false));
  };

  // Reject Journalist api call
  const handleRejectJournalist = async (id) => {
    setRequesting(true);
    await fetch(`${baseUrl}/journalist-req/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Journalist Request rejected successfully") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchJournalistsRequests();
          fetchJournalists();
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to reject journalist request",
          variant: "destructive",
        });
      })
      .finally(() => setRequesting(false));
  };

  //Add reviewer API call
  const addReviewer = async (reviewer) => {
    setRequesting(true);
    await fetch(`${baseUrl}/reviewer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(reviewer),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Reviewer added successfully") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchReviewers();
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to add reviewer",
          variant: "destructive",
        });
      })
      .finally(() => setRequesting(false));
  };

  //Add Reviwer Handler
  const handleAddReviewer = async () => {
    if (newReviewerName && newReviewerEmail) {
      await addReviewer({
        fullName: newReviewerName,
        email: newReviewerEmail,
      });
      setReviewerOpen(false);
      setNewReviewerName("");
      setNewReviewerEmail("");
    }
  };

  //remove Journalist
  const removeJournalist = async (id) => {
    setRequesting(true);
    await fetch(`${baseUrl}/journalist/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "Journalist removed successfully") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchJournalists();
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to remove journalist",
          variant: "destructive",
        });
      })
      .finally(() => setRequesting(false));
  };

  //remove Reviewr
  const removeReviewer = async (id) => {
    setRequesting(true);
    await fetch(`${baseUrl}/reviewer/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message == "Reviewer removed successfully") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          await fetchReviewers();
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to remove reviewer",
          variant: "destructive",
        });
      })
      .finally(() => setRequesting(false));
  };

  //add multiple students API call
  const addMultipleStudents = async () => {
    const formData = new FormData();
    formData.append("file", excelFile);
    setRequesting(true);
    await fetch(`${baseUrl}/student/add-multiple`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.message === "All Students registered successfully!") {
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        } else {
          throw new Error(data.message);
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to add students",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });

    setExcelFile(null);
    setStudentOpen(false);
  };

  //------------------------------UI--------------------------------------------//
  return (
    <DashboardLayout navItems={navItems} title="Manage Users">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage journalists, reviewers, and students
            </p>
          </div>
        </div>

        {/* List Tabs */}
        <Tabs defaultValue="journalist-requests">
          <TabsList>
            <TabsTrigger value="journalist-requests">
              Journalist Requests ({journalistRequests.length})
            </TabsTrigger>
            <TabsTrigger value="journalists">
              Journalists ({journalists.length})
            </TabsTrigger>
            <TabsTrigger value="reviewers">
              Reviewers ({reviewers.length})
            </TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* confirmation dialog */}
          <Dialog
            open={confirmDialog.open}
            onOpenChange={(open) =>
              setConfirmDialog({ open, type: null, requestId: null })
            }
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmDialog.type === "approve"
                    ? "Approve Journalist Request"
                    : "Reject Journalist Request"}
                </DialogTitle>
              </DialogHeader>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to{" "}
                {confirmDialog.type === "approve" ? "approve" : "reject"} this
                request?
              </p>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  disabled={requesting}
                  variant="outline"
                  onClick={() =>
                    setConfirmDialog({
                      open: false,
                      type: null,
                      requestId: null,
                    })
                  }
                >
                  Cancel
                </Button>

                <Button
                  disabled={requesting}
                  className={
                    confirmDialog.type === "reject" ? "bg-destructive" : ""
                  }
                  onClick={() => {
                    if (confirmDialog.type === "approve") {
                      handleApproveJournalist(confirmDialog.requestId);
                    } else {
                      handleRejectJournalist(confirmDialog.requestId);
                    }

                    setConfirmDialog({
                      open: false,
                      type: null,
                      requestId: null,
                    });
                  }}
                >
                  OK
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* ---------------- Journalist Requests ---------------- */}
          <TabsContent value="journalist-requests" className="mt-6 space-y-4">
            {/* If no requests, show empty state */}
            {loading.journalistRequests ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loading />
                </CardContent>
              </Card>
            ) : journalistRequests.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="text-4xl" />}
                title="No Journalist Requests"
                desc="There are no pending journalist requests at the moment."
              />
            ) : (
              journalistRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6 pt-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {request.journalistName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.studentId}
                        </p>
                        <p className="text-sm mt-2">
                          <b>Reason:</b> {request.why}
                        </p>
                        <p className="text-sm">
                          <b>Experience:</b> {request.experience}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          disabled={requesting}
                          variant="outline"
                          className="text-destructive"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "reject",
                              requestId: request.id,
                            })
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          disabled={requesting}
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "approve",
                              requestId: request.id,
                            })
                          }
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ---------------- Approved Journalists ---------------- */}
          <TabsContent value="journalists" className="mt-6 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* If no journalists, show empty state */}
                  {loading.journalists ? (
                    <div className="p-6 text-center">
                      <Loading />
                    </div>
                  ) : journalists.length === 0 ? (
                    <EmptyState
                      icon={<UserPlus className="text-4xl" />}
                      title="No Journalists"
                      desc="There are no approved journalists at the moment."
                    />
                  ) : (
                    journalists.map((journalist) => (
                      <div
                        key={journalist.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4 pt-1 pb-1">
                          <Avatar>
                            <AvatarFallback>
                              {journalist.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{journalist.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {journalist.studentId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">Journalist</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={requesting}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => removeJournalist(journalist.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Reviewers ---------------- */}
          <TabsContent value="reviewers" className="mt-6 space-y-4">
            {/* Add Reviewer Button and Dialog*/}
            <div className="flex justify-end">
              <Dialog open={reviewerOpen} onOpenChange={setReviewerOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setReviewerOpen(true)}
                    disabled={requesting}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Reviewer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Reviewer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="Dr. Jane Smith"
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="reviewer@university.edu"
                        value={newReviewerEmail}
                        onChange={(e) => setNewReviewerEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddReviewer}
                      disabled={requesting}
                    >
                      Add Reviewer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Reviewer List */}
            <Card>
              <CardContent className="p-0">
                {/* If no reviewers, show empty state */}
                <div className="divide-y">
                  {loading.reviewers ? (
                    <div className="p-6 text-center">
                      <Loading />
                    </div>
                  ) : reviewers.length === 0 ? (
                    <EmptyState
                      icon={<UserPlus className="text-4xl" />}
                      title="No Reviewers"
                      desc="There are no reviewers added at the moment."
                    />
                  ) : (
                    reviewers.map((reviewer) => (
                      <div
                        key={reviewer.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {reviewer.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{reviewer.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {reviewer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">Reviewer</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={requesting}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => removeReviewer(reviewer.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Students ---------------- */}
          <TabsContent value="students" className="mt-6 space-y-4">
            {/* Add Student Button and dialog*/}
            <div className="flex justify-end">
              <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setStudentOpen(true)}
                    disabled={requesting}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Students</DialogTitle>
                  </DialogHeader>

                  {/* Inner Tabs */}
                  <Tabs defaultValue="single" className="mt-4">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="single">Add Single</TabsTrigger>
                      <TabsTrigger value="bulk">Upload Excel</TabsTrigger>
                    </TabsList>

                    {/* ---------------- Single Student ---------------- */}
                    <TabsContent value="single" className="space-y-4 mt-4">
                      <Label>Full Name</Label>
                      <Input
                        name="name"
                        placeholder="Full Name"
                        value={newStudent.name}
                        onChange={handleStudentChange}
                      />

                      <Label>Email</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={newStudent.email}
                        onChange={handleStudentChange}
                      />

                      <Label>Department</Label>
                      <Input
                        name="department"
                        placeholder="Department"
                        value={newStudent.department}
                        onChange={handleStudentChange}
                      />

                      <Label>Year</Label>
                      <Input
                        name="year"
                        placeholder="Year (1st, 2nd...)"
                        value={newStudent.year}
                        onChange={handleStudentChange}
                      />

                      <Label>Student ID</Label>
                      <Input
                        name="studentId"
                        placeholder="Student ID"
                        value={newStudent.studentId}
                        onChange={handleStudentChange}
                      />
                      <Label>Gender</Label>
                      <select
                        name="gender"
                        value={newStudent.gender}
                        onChange={handleStudentChange}
                        className="w-full border rounded-md p-2 bg-background"
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>

                      <Button
                        className="w-full"
                        onClick={handleAddStudent}
                        disabled={requesting}
                      >
                        Add Student
                      </Button>
                    </TabsContent>

                    {/* ---------------- Bulk Upload ---------------- */}
                    <TabsContent value="bulk" className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        Upload an Excel file without header containing:<br></br>
                        Email | Name | StudentId | Gender | Department | Year
                      </p>

                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setExcelFile(e.target.files[0])}
                      />

                      {requesting ? (
                        <Button
                          className="w-full"
                          onClick={addMultipleStudents}
                          disabled={requesting}
                        >
                          Processing your excel Don't exit
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={addMultipleStudents}
                          disabled={requesting}
                        >
                          Upload & Add Students
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>

            {/* Student List */}
            <Card>
              <CardContent className="p-0">
                {/* If no students, show empty state */}
                <div className="divide-y">
                  {loading.students ? (
                    <div className="p-6 text-center">
                      <Loading />
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">
                        <Button
                          variant="outline"
                          className="mb-2"
                          onClick={() => setExploreStudents(true)}
                          disabled={requesting}
                        >
                          Explore students
                        </Button>
                      </p>
                    </div>
                  ) : (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {student.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <Badge variant="outline">
                          {student.department} • {student.year}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
