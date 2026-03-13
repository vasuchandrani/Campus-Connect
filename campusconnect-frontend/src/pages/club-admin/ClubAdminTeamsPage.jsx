import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { clubAdminNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { useParams } from "react-router-dom";


const ClubAdminTeamsPage = () => {
  // Get clubId from URL params
  let { clubId } = useParams();

  // Base URL for API calls related to this club
  const baseUrl = `http://localhost:8080/campus-connect/clubs/${clubId}/admin`;
  const token = localStorage.getItem("authToken");

  //---------Navs------------//
  const updatenavItems = () => {
    return clubAdminNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  };

  // State variables
  const [teams, setTeams] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  
  // Fetch teams for this club
  const fetchTeams = () => {
    fetch(`${baseUrl}/teams`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) =>{
        toast({
          title: "Error",
          description: "Failed to fetch teams",
          status: "error",
        });
      });
  };

  // Fetch club members for adding to teams
  const fetchClubMembers = () => {
    fetch(`${baseUrl}/members`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setClubMembers(data))
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch club members",
          status: "error",
        });
      });
  };

  // Create a new team
  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        status: "error",
      });
      return;
    }

    fetch(`${baseUrl}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newTeamName,
        description: newTeamDesc,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        fetchTeams();
        setNewTeamName("");
        setNewTeamDesc("");
        setCreateDialogOpen(false);
        toast({ title: "Team Created Successfully", description: data.message, status: "success" });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to create team",
          status: "error",
        });
      });
  };

  // Delete a team
  const handleDeleteTeam = (teamId) => {
    fetch(`${baseUrl}/teams/${teamId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        fetchTeams();
        toast({ title: "Team Deleted Successfully", description: data.message, status: "success" });
      })
      .catch((err) => {
        console.error("Error deleting team:", err);
        toast({
          title: "Error",
          description: "Failed to delete team",
          status: "error",
        });
      });
  };

  // Add member to a team
  const handleAddMember = (teamId, studentId) => {
    fetch(`${baseUrl}/teams/${teamId}/${studentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        fetchTeams();
        setSelectedMember("");
        toast({ title: "Member Added Successfully", description: data.message, status: "success" });
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to add member",
          status: "error",
        }),
      );
  };

  // Remove member from a team
  const handleRemoveMember = (teamId, studentId) => {
    fetch(`${baseUrl}/teams/${teamId}/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        fetchTeams();
        toast({ title: "Member Removed Successfully", description: data.message, status: "success" });
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to remove member",
          status: "error",
        }),
      );
  };

// Load teams and members on component mount and whenever clubId changes
  useEffect(() => {
    fetchTeams();
    fetchClubMembers();
  }, [clubId]);

  return (
    <DashboardLayout navItems={updatenavItems()} title="Teams">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Create teams and manage members
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Team</DialogTitle>
                <DialogDescription>
                  Create a new team inside your club
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Team Name</Label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleCreateTeam}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <UsersRound />
              <div>
                <p className="text-xl font-bold">{teams.length}</p>
                <p className="text-xs text-muted-foreground">Total Teams</p>
              </div>
            </CardContent>
          </Card>

         
        </div>

        {/* Teams */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const members = team.members || [];

            return (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {team.description}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <Badge className="mt-2 w-fit">
                    {team.membersCount || 0} members
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-1">
                  {members.map((m) => (
                    <div
                      key={m.studentId}
                      className="flex justify-between items-center bg-muted/40 px-2 py-1 rounded"
                    >
                      <span className="text-sm font-semibold">
                        {m.studentName}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleRemoveMember(team.id, m.studentId)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  {/* SAME SELECT UI AS BEFORE */}
                  <Select
                    value={selectedMember}
                    onValueChange={(val) => {
                      setSelectedMember(val);
                      handleAddMember(team.id, val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clubMembers
                        .filter(
                          (m) =>
                            !members.some((tm) => tm.studentId === m.studentId),
                        )
                        .map((m) => (
                          <SelectItem key={m.studentId} value={m.studentId}>
                            {m.studentName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubAdminTeamsPage;
