import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Avatar";
import { clubMemberNavItems } from "../../config/Navigation";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "../../hooks/use-toast";

const ClubMembersPage = () => {

  // Get clubId from URL params
  const { clubId } = useParams();

  // Base URL for API calls related to this club
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/clubs/${clubId}/member`;

  //---------------------------Nav----------------------------//
  const updateNavItems = () => {
    return clubMemberNavItems.map((item) => ({
      ...item,
      href: item.href.replace(":clubId", clubId),
    }));
  };

  // State variables
  const [clubMembers, setClubMembers] = useState([]);

  // Fetch club members
  const fetchClubMembers =async () => {
    const token = localStorage.getItem("authToken");

    await fetch(`${baseUrl}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => await res.json())
      .then((data) => {
        setClubMembers(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch members",
          variant: "destructive",
        });
      });
  };

  //load members on component mount
  useEffect(() => {
    fetchClubMembers();
  }, []);


  //----------------------------UI----------------------------//
  return (
    <DashboardLayout navItems={updateNavItems()} title="Members">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Members</h1>
            <p className="text-muted-foreground">
              Your club members and roles
            </p>
          </div>
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
                  {/* Left Section */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.studentName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">{member.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        member.role === "PRESIDENT"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}

              {clubMembers.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No members found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClubMembersPage;
