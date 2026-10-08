import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Target, Calendar, MapPin, Building, Filter, Download, RefreshCw } from "lucide-react";

const DashboardUIUX = () => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedState, setSelectedState] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");

  // Mock data for charts
  const monthlyData = [
    { month: "Jan", projects: 65, budget: 4.2, completion: 78 },
    { month: "Feb", projects: 72, budget: 5.1, completion: 82 },
    { month: "Mar", projects: 58, budget: 3.8, completion: 76 },
    { month: "Apr", projects: 84, budget: 6.3, completion: 89 },
    { month: "May", projects: 91, budget: 7.2, completion: 94 },
    { month: "Jun", projects: 67, budget: 4.9, completion: 85 }
  ];

  const sectorData = [
    { name: "Education", value: 35, color: "#155535" },
    { name: "Healthcare", value: 28, color: "#22c55e" },
    { name: "Agriculture", value: 20, color: "#84cc16" },
    { name: "Finance", value: 17, color: "#10b981" }
  ];

  const statePerformance = [
    { state: "Lagos", projects: 45, budget: 12.5, completion: 92 },
    { state: "Abuja", projects: 38, budget: 9.8, completion: 88 },
    { state: "Kano", projects: 29, budget: 7.2, completion: 76 },
    { state: "Rivers", projects: 25, budget: 6.1, completion: 84 },
    { state: "Ogun", projects: 22, budget: 5.4, completion: 79 }
  ];

  // KPI Cards Data
  const kpiData = [
    {
      title: "Total Projects",
      value: "247",
      change: "+12%",
      trend: "up",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Active Users",
      value: "1,432",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Total Budget",
      value: "₦45.2B",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "Completion Rate",
      value: "87%",
      change: "+3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  const states = [
    "All States", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", 
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
    "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const sectors = [
    "All Sectors", "Education", "Healthcare", "Agriculture", "Finance", 
    "Transportation", "Energy", "Manufacturing", "Tourism", "Mining"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard UI/UX</h1>
        <p className="text-muted-foreground mt-2">
          Interactive dashboard with KPI cards, charts, and filtering capabilities
        </p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Controls
          </CardTitle>
          <CardDescription>Filter data by date, location, and sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Button variant="outline" className="justify-start text-left font-normal">
                  <span>Jan 1, 2024 - Jun 30, 2024</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <SelectValue placeholder="Select State" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state.toLowerCase().replace(" ", "-")}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sector</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <SelectValue placeholder="Select Sector" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector.toLowerCase().replace(" ", "-")}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {kpi.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Projects Trend</CardTitle>
            <CardDescription>Monthly project progress and budget allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#155535" 
                  strokeWidth={2}
                  name="Projects"
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Completion %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
            <CardDescription>Project distribution across different sectors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* State Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>State Performance Overview</CardTitle>
            <CardDescription>Project count, budget, and completion rates by state</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="projects" 
                  fill="#155535" 
                  name="Projects"
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="completion" 
                  fill="#22c55e" 
                  name="Completion %"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Budget (₦B)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest project updates and system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: "2 hours ago",
                activity: "New project 'Lagos Smart City Initiative' created",
                user: "Dr. Amina Hassan",
                status: "active"
              },
              {
                time: "4 hours ago",
                activity: "KPI targets updated for Q2 2024",
                user: "Eng. Chukwuma Okafor",
                status: "completed"
              },
              {
                time: "6 hours ago",
                activity: "Monthly report generated for Federal Ministry of Education",
                user: "System",
                status: "completed"
              },
              {
                time: "1 day ago",
                activity: "User access granted to 15 new state coordinators",
                user: "Mrs. Fatima Abdullahi",
                status: "completed"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === "active" ? "bg-green-500" : "bg-blue-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.activity}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} • {activity.time}
                  </p>
                </div>
                <Badge variant={activity.status === "active" ? "default" : "secondary"}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardUIUX;