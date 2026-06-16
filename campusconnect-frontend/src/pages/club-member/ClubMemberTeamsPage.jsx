import { useCallback, useEffect, useState,useMemo } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { UsersRound } from "lucide-react";
import { clubMemberNavItems } from "../../config/Navigation";
import { toast } from "../../hooks/use-toast";
import { useParams } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";
import Loading from "../../components/ui/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ClubMemberTeamsPage = () => {
  let { clubId } = useParams();
  const { isClubMember } = useAuth();
  const navigate = useNavigate();

  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/member`;


  const updateNavItems = useMemo(() => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  }, [clubId]);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = useCallback(() => {
    setLoading(true);
  const token = localStorage.getItem("authToken");
    return fetch(`${baseUrl}/teams`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch teams");
        }
        return res;
      })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message || "Failed to fetch teams",
          variant: "destructive",
        })
      ).finally(() => setLoading(false));
  }, [baseUrl]);

  useEffect(() => {
    const checkMembershipAndFetchData = async () => {
      try {
        const member = await isClubMember(clubId);
        if (!member) {
          toast({
            title: "Unauthorized",
            description: "You are not a member of this club",
            variant: "destructive",
          });
          navigate(-1);
          return;
        }
        await fetchTeams();
      } catch (err) {
        toast({
          title: "Unauthorized",
          description: err.message || "You are not a member of this club",
          variant: "destructive",
        });
        navigate(-1);
      }
    };
    checkMembershipAndFetchData();
  }, [clubId,fetchTeams, isClubMember, navigate]);

  if(loading) {
    return (
      <DashboardLayout navItems={updateNavItems} title="Teams">
        <div className="text-center py-12">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }
  else if(teams.length === 0) {
    return (
      <DashboardLayout navItems={updateNavItems} title="Teams">
        <div className="text-center py-12">
          <EmptyState
            icon={<UsersRound className="w-8 h-8 text-muted-foreground" />}
            title="No teams found"
            desc="Your club doesn't have any teams yet."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={updateNavItems} title="Teams">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            View teams and their members
          </p>
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
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {team.description}
                    </p>
                  </div>

                  <Badge className="mt-2 w-fit">
                    {team.membersCount || members.length} members
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-2">
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No members in this team
                    </p>
                  ) : (
                    members.map((m) => (
                      <div
                        key={m.studentId}
                        className="bg-muted/40 px-2 py-1 rounded text-sm font-medium"
                      >
                        {m.studentName}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubMemberTeamsPage;
