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
import { set } from "date-fns";


const ClubAdminTeamsPage = () => {
  // Get clubId from URL params
  let { clubId } = useParams();

  // Base URL for API calls related to this club
  const baseUrl = `https://campus-connect-nzc9.onrender.com/campus-connect/clubs/${clubId}/admin`;
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
  const [requesting, setRequesting] = useState(false);

  
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
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }
    setRequesting(true);
    await fetch(`${baseUrl}/teams`, {
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
        if(data.message==="Team created successfully"){
          fetchTeams();
          setNewTeamName("");
          setNewTeamDesc("");
          setCreateDialogOpen(false);
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
        }
        else {
          toast({
            title: "Error",
            description: data.message || "Failed to create team",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }).finally(() => {
        setRequesting(false);
      });
  };

  // Delete a team
  const handleDeleteTeam = async (teamId) => {
    setRequesting(true);
    await fetch(`${baseUrl}/teams/${teamId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if(data.message==="Team deleted successfully"){
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchTeams();
        }
        else{
          toast({
            title: "Error",
            description: data.message || "Failed to delete team",
            variant: "destructive",
          });
        }
       
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to delete team",
          variant: "destructive",
        });
      }).finally(()=>{
        setRequesting(false);
      })
  };

  // Add member to a team
  const handleAddMember = async(teamId, studentId) => {
    setRequesting(true);
    await fetch(`${baseUrl}/teams/${teamId}/${studentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if(data.message==="Team-member added successfully"){
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchTeams();
        setSelectedMember("");
        }
        else {
          toast({
            title: "Error",
            description: data.message || "Failed to add member to team",
            variant: "destructive",
          });
        }
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message || "Failed to add member",
          variant: "destructive",
        }),
      ).finally(()=>{
        setRequesting(false);
      })
  };

  // Remove member from a team
  const handleRemoveMember = async (teamId, studentId) => {
    setRequesting(true);
    await fetch(`${baseUrl}/teams/${teamId}/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if(data.message==="Team-member removed successfully"){
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          fetchTeams();
        }else{
          toast({
            title: "Error",
            description: data.message || "Failed to remove member from team",
            variant: "destructive",
          });
        }
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err || "Failed to remove member",
          status: "error",
        }),
      ).finally(()=>{
        setRequesting(false);
      })
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
              <Button disabled={requesting}>
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

                <Button className="w-full" onClick={handleCreateTeam} disabled={requesting}>
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
                      disabled={requesting}
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
                        disabled={requesting}
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
