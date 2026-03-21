import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { studentNavItems } from "../../config/Navigation";
import { Search, Eye } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { toast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/ui/Loading";
import { useMemo } from "react";
import EmptyState from "../../components/ui/EmptyState";

const ClubsPage = () => {
  // State variables
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Base URL for API calls related to student clubs
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/campus-connect/student`;

  const { routeProtection } = useAuth();
  useEffect(() => {
    if (!routeProtection("STUDENT")) {
      navigate("/auth");
    }
  }, [navigate, routeProtection]);
  // Fetch clubs from API
  const fetchClubs = () => {
    setLoading(true);
    fetch(`${baseUrl}/clubs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setClubs(data);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "Failed to fetch clubs",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //search filter function
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [clubs, searchQuery]);

  // Load clubs on component mount
  useEffect(() => {
    fetchClubs();
  }, []);

  if (loading) {
    return (
      <DashboardLayout navItems={studentNavItems} title="Clubs" bell={true}>
        <Loading />
      </DashboardLayout>
    );
  }

  if (clubs.length === 0) {
    return (
      <DashboardLayout navItems={studentNavItems} title="Clubs" bell={true}>
        <EmptyState
          icon={<Search className="w-8 h-8 text-muted-foreground" />}
          title="No Clubs Found"
          desc="There are currently no clubs available. Please check back later."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={studentNavItems} title="Clubs" bell={true}>
      <div className="space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Clubs Grid */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <Card
              key={club.id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() =>
                navigate(`/campus-connect/student/clubs/${club.id}`)
              }
            >
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-full h-40 object-cover"
              />

              <CardContent className="p-5 pt-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{club.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {club.description.substring(0, 40) +
                    (club.description.length > 40 ? "..." : "")}
                </p>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/campus-connect/student/clubs/${club.id}`);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClubsPage;
