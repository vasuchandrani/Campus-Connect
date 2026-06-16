import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/Avatar";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { UserPlus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import { clubAdminNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "../../hooks/use-toast";
import Loading from "../../components/ui/Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/* ================= COMPONENT ================= */

const ClubAdminMembersPage = () => {
  // Get clubId from URL params
  let { clubId } = useParams();
  const navigate = useNavigate();
  const { isClubAdmin } = useAuth();

  // Base URL for API calls related to this club
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/admin`;

  //---------Navs------------//
  const updatenavItems = useMemo(() => {
    return clubAdminNavItems.map((item) => {
      return {
        ...item,
        href: item.href.replace(":clubId", clubId),
      };
    });
  }, [clubId]);

  // State variables
  const [clubMembers, setClubMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);

  //1) Fetch club members
  const fetchClubMembers = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    await fetch(`${baseUrl}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setClubMembers(data);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to fetch club members",
          variant: "destructive",
        });
      }).finally(() => {
        setLoading(false);
      });
  }, [baseUrl]);

  //2) Add member
  const addMember = async (email, role) => {
    const token = localStorage.getItem("authToken");
    setRequesting(true);
    await fetch(`${baseUrl}/members/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, role: role.toUpperCase() }),
    })
      .then(async (res) => await res.json())
      .then((data) => {
        if(data.message==="ClubMember added successfully"){
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        fetchClubMembers();
        setEmail("");
        setRole("member");
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add member",
          variant: "destructive",
        });
      }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to add member",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  //3) Remove member
  const removeMember = async (memberId) => {
    const token = localStorage.getItem("authToken");
    setRequesting(true);
    await fetch(`${baseUrl}/members/remove/${memberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
        fetchClubMembers();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to remove member",
          variant: "destructive",
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  //load members on component mount and whenever clubId changes
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const admin = await isClubAdmin(clubId);
        if (!admin) {
          toast({
            title: "Unauthorized",
            description: "You are not an admin of this club",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }
        fetchClubMembers();
      } catch {
        toast({
          title: "Unauthorized",
          description: "You are not an admin of this club",
          variant: "destructive",
        });
        navigate(-1);
        return;
       }
      }
      checkAdminAndFetchData();
  }, [clubId,fetchClubMembers, isClubAdmin, navigate]);

  if(loading){
    return (
      <DashboardLayout navItems={updatenavItems} title="Members">
        <Card>
          <CardContent className="p-6 text-center">
            <Loading />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout navItems={updatenavItems} title="Members">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Manage your club members and roles
            </p>
          </div>

          {/* Invite Member Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={requesting}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="member@university.edu"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={role}
                    onValueChange={setRole}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  disabled={requesting}
                  onClick={() => addMember(email, role)}
                >
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {clubMembers.map((member) => (
                <div
                  key={member.studentId}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      {member.image ? (
                        <AvatarImage
                          src={member.image}
                          alt={member.studentName}
                          className="object-cover"
                        />
                      ) : null}

                      <AvatarFallback>
                        {member.studentName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        member.role === "President" ? "default" : "secondary"
                      }
                    >
                      {member.role}
                    </Badge>

                    {/* Remove Member or Change Role Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={requesting}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeMember(member.studentId)}
                        >
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClubAdminMembersPage;
