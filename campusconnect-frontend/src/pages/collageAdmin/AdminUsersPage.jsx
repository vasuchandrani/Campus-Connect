import { useState } from "react";
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

const navItems = collegeAdminNavItems;

const AdminUsersPage = () => {
  // states
  const [journalists, setJournalists] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [journalistRequests, setJournalistRequests] = useState([
    {
      id: 1,
      studentName: "Alice Johnson",
      studentId: "ituos039",
      reason: "I want to share campus news and events.",
      experience: "I have experience writing for the college newsletter.",
    },
  ]);

  const [students, setStudents] = useState([]);

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

  //Add student temparary
  const addStudent = (student) => {
    setStudents((prev) => [...prev, { id: Date.now(), ...student }]);
  };

  //change in data of student
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //add student handler
  const handleAddStudent = () => {
    const { name, email, department, year, studentId, gender } = newStudent;

    if (name && email && department && year && studentId && gender) {
      addStudent({ ...newStudent });

      // reset form
      setNewStudent({
        name: "",
        email: "",
        department: "",
        year: "",
        studentId: "",
        gender: "",
      });
    }
  };

  //Approve Journalist handler
  const handleApproveJournalist = (id) => {
    const request = journalistRequests.find((r) => r.id === id);

    if (request) {
      addJournalist({
        name: request.studentName,
        studentId: request.studentId,
      });

      setJournalistRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Reject Journalist
  const handleRejectJournalist = (id) => {
    setJournalistRequests((prev) => prev.filter((r) => r.id !== id));
  };

  //temparary add Journalist
  const addJournalist = (journalist) => {
    setJournalists((prev) => [...prev, { id: Date.now(), ...journalist }]);
  };

  //Temparary Add Reviewer
  const addReviewer = (reviewer) => {
    setReviewers((prev) => [...prev, { id: Date.now(), ...reviewer }]);
  };

  //Add Reviwer Handler
  const handleAddReviewer = () => {
    if (newReviewerName && newReviewerEmail) {
      addReviewer({
        name: newReviewerName,
        email: newReviewerEmail,
      });
      setNewReviewerName("");
      setNewReviewerEmail("");
    }
  };

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
            {journalistRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No pending journalist requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              journalistRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6 pt-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{request.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.studentId}
                        </p>
                        <p className="text-sm mt-2">
                          <b>Reason:</b> {request.reason}
                        </p>
                        <p className="text-sm">
                          <b>Experience:</b> {request.experience}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
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
                  {journalists.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No approved journalists yet.
                      </p>
                    </div>
                  ) : (
                    journalists.map((journalist) => (
                      <div
                        key={journalist.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4 pt-1 pb-1">
                          <Avatar>
                            <AvatarFallback>
                              {journalist.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{journalist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {journalist.studentId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">Journalist</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-destructive">
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
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
                    <Button className="w-full" onClick={handleAddReviewer}>
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
                  {reviewers.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">
                        No reviewers added yet.
                      </p>
                    </div>
                  ) : (
                    reviewers.map((reviewer) => (
                      <div
                        key={reviewer.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {reviewer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{reviewer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {reviewer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">Reviewer</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-destructive">
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
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

                      <Button className="w-full" onClick={handleAddStudent}>
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

                      <Button className="w-full">Upload & Add Students</Button>
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
                  {students.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">
                        <Button variant="outline" className="mb-2">
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
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
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
