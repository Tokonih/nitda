import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPagination } from "@/components/ui/data-pagination";
import { Search, Database, CheckCircle, Clock, Gem, Filter, Plus } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";

const DataSourceValidation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data sources with quality ratings
  const dataSources = [
    {
      id: 1,
      name: "Ministry of ICT Database",
      type: "Government Database",
      status: "validated",
      qualityScore: 95,
      lastValidated: "2024-01-15",
      records: 25000,
      description: "Primary source for ICT infrastructure data"
    },
    {
      id: 2,
      name: "NIMC Citizens Registry",
      type: "Identity Database",
      status: "validated",
      qualityScore: 88,
      lastValidated: "2024-01-10",
      records: 45000000,
      description: "National identity management database"
    },
    {
      id: 3,
      name: "NBS Digital Economy Survey",
      type: "Survey Data",
      status: "pending",
      qualityScore: 72,
      lastValidated: "2023-12-20",
      records: 15000,
      description: "National Bureau of Statistics digital economy metrics"
    },
    {
      id: 4,
      name: "Telecom Operators Data",
      type: "Industry Data",
      status: "issues",
      qualityScore: 65,
      lastValidated: "2024-01-05",
      records: 180000000,
      description: "Mobile and internet penetration statistics"
    },
    {
      id: 5,
      name: "Universities IT Infrastructure",
      type: "Education Data",
      status: "validated",
      qualityScore: 91,
      lastValidated: "2024-01-12",
      records: 850,
      description: "Higher education technology infrastructure data"
    }
  ];

  // Status distribution data for pie chart
  const statusData = [
    { name: "Completed", value: 65, count: 3, color: "#16a34a" },
    { name: "Pending", value: 25, count: 1, color: "#eab308" },
    { name: "Issues", value: 25, count: 1, color: "#ef4444" }
  ];

  // Quality scores for bar chart
  const qualityData = [
    { name: "Source 1", score: 95 },
    { name: "Source 2", score: 88 },
    { name: "Source 3", score: 72 },
    { name: "Source 4", score: 65 },
    { name: "Source 5", score: 91 }
  ];

  const getStatusBadge = (status, score) => {
    if (status === "validated" && score >= 85) 
      return <Badge className="bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a]/20 border-[#16a34a]/20">Validated</Badge>;
    if (status === "pending") 
      return <Badge className="bg-[#eab308]/10 text-[#eab308] hover:bg-[#eab308]/20 border-[#eab308]/20">Pending Review</Badge>;
    return <Badge className="bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 border-[#ef4444]/20">Issues Found</Badge>;
  };

  const getQualityColor = (score) => {
    if (score >= 85) return "text-[#16a34a]";
    if (score >= 70) return "text-[#eab308]";
    return "text-[#ef4444]";
  };

  const filteredSources = dataSources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  const paginatedSources = filteredSources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPI Data Source Validation</h1>
          <p className="text-muted-foreground mt-2">
            Validate and monitor the quality of KPI's for the Performance Management System Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white">
            <Plus className="h-4 w-4" />
            Add KPI
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#155535] border-[#155535] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Sources</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{dataSources.length}</div>
            <p className="text-xs text-white/70 mt-1">Active data sources</p>
          </CardContent>
        </Card>

        <Card className="bg-[#155535] border-[#155535] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Validated</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {dataSources.filter(s => s.status === "validated").length}
            </div>
            <p className="text-xs text-white/70 mt-1">Sources validated</p>
          </CardContent>
        </Card>

        <Card className="bg-[#155535] border-[#155535] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Pending</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {dataSources.filter(s => s.status === "pending").length}
            </div>
            <p className="text-xs text-white/70 mt-1">Awaiting validation</p>
          </CardContent>
        </Card>

        <Card className="bg-[#155535] border-[#155535] text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Avg. Quality</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Gem className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {Math.round(dataSources.reduce((acc, s) => acc + s.qualityScore, 0) / dataSources.length)}%
            </div>
            <p className="text-xs text-white/70 mt-1">Quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
            <CardDescription>Share of validated, pending, and issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-1 h-12 rounded" style={{ backgroundColor: item.color }} />
                    <div>
                      <div className="font-semibold text-foreground">
                        {item.name} • {item.value}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} {item.count === 1 ? item.name.toLowerCase() : item.name.toLowerCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quality by Source</CardTitle>
            <CardDescription>Quality scores across sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={qualityData}>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} />
                <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Data Sources</CardTitle>
              <CardDescription>Monitor and validate data source quality</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search data sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Last Validated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{source.name}</div>
                        <div className="text-sm text-muted-foreground">{source.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{source.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(source.status, source.qualityScore)}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getQualityColor(source.qualityScore)}`}>
                        {source.qualityScore}%
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{source.records.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{source.lastValidated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-[#16a34a] border-[#16a34a]/20 hover:bg-[#16a34a]/10">
                          Validate
                        </Button>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourceValidation;