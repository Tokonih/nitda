import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, FileText, GitBranch, Layers, Settings, Eye } from "lucide-react";

const DataModelArchitecture = () => {
  const [selectedTable, setSelectedTable] = useState(null);

  // Mock database schema
  const tables = [
    {
      name: "users",
      description: "System users and authentication",
      columns: [
        { name: "id", type: "UUID", nullable: false, key: "PRIMARY" },
        { name: "email", type: "VARCHAR(255)", nullable: false, key: "UNIQUE" },
        { name: "password_hash", type: "VARCHAR(255)", nullable: false },
        { name: "role", type: "ENUM", nullable: false },
        { name: "created_at", type: "TIMESTAMP", nullable: false },
        { name: "updated_at", type: "TIMESTAMP", nullable: false }
      ]
    },
    {
      name: "projects",
      description: "Digital transformation projects",
      columns: [
        { name: "id", type: "UUID", nullable: false, key: "PRIMARY" },
        { name: "title", type: "VARCHAR(255)", nullable: false },
        { name: "description", type: "TEXT", nullable: true },
        { name: "status", type: "ENUM", nullable: false },
        { name: "budget", type: "DECIMAL(15,2)", nullable: true },
        { name: "start_date", type: "DATE", nullable: false },
        { name: "end_date", type: "DATE", nullable: true },
        { name: "created_by", type: "UUID", nullable: false, key: "FOREIGN" }
      ]
    },
    {
      name: "kpis",
      description: "Key Performance Indicators",
      columns: [
        { name: "id", type: "UUID", nullable: false, key: "PRIMARY" },
        { name: "name", type: "VARCHAR(255)", nullable: false },
        { name: "category", type: "VARCHAR(100)", nullable: false },
        { name: "target_value", type: "DECIMAL(10,2)", nullable: false },
        { name: "current_value", type: "DECIMAL(10,2)", nullable: false },
        { name: "unit", type: "VARCHAR(50)", nullable: false },
        { name: "project_id", type: "UUID", nullable: false, key: "FOREIGN" }
      ]
    },
    {
      name: "milestones",
      description: "Project milestones and deliverables",
      columns: [
        { name: "id", type: "UUID", nullable: false, key: "PRIMARY" },
        { name: "title", type: "VARCHAR(255)", nullable: false },
        { name: "description", type: "TEXT", nullable: true },
        { name: "due_date", type: "DATE", nullable: false },
        { name: "status", type: "ENUM", nullable: false },
        { name: "project_id", type: "UUID", nullable: false, key: "FOREIGN" }
      ]
    }
  ];

  const architectureComponents = [
    {
      layer: "Presentation Layer",
      components: [
        { name: "React Frontend", description: "User interface components" },
        { name: "Mobile App", description: "React Native mobile application" },
        { name: "Admin Dashboard", description: "Administrative interface" }
      ]
    },
    {
      layer: "API Gateway",
      components: [
        { name: "REST APIs", description: "RESTful web services" },
        { name: "Authentication", description: "JWT-based auth service" },
        { name: "Rate Limiting", description: "API usage controls" }
      ]
    },
    {
      layer: "Business Logic",
      components: [
        { name: "Project Management", description: "Project lifecycle management" },
        { name: "KPI Calculator", description: "Performance metrics calculation" },
        { name: "Reporting Engine", description: "Data aggregation and reporting" }
      ]
    },
    {
      layer: "Data Access",
      components: [
        { name: "ORM Layer", description: "Object-relational mapping" },
        { name: "Database Connection", description: "Connection pooling and management" },
        { name: "Caching Layer", description: "Redis-based caching" }
      ]
    },
    {
      layer: "Data Storage",
      components: [
        { name: "PostgreSQL", description: "Primary relational database" },
        { name: "File Storage", description: "Document and media storage" },
        { name: "Backup System", description: "Automated backup solutions" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Model & Architecture</h1>
        <p className="text-muted-foreground mt-2">
          System architecture overview and database schema for the Performance Management System Dashboard
        </p>
      </div>

      <Tabs defaultValue="architecture" className="space-y-6">
        <TabsList>
          <TabsTrigger value="architecture" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Schema
          </TabsTrigger>
          <TabsTrigger value="apis" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            API Endpoints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-6">
          {/* Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>
                Multi-layered architecture following microservices principles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {architectureComponents.map((layer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-primary">{layer.layer}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {layer.components.map((component, idx) => (
                        <div key={idx} className="border rounded p-3">
                          <h4 className="font-medium">{component.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {component.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Frontend Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>React 18</span>
                    <Badge>v18.2.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tailwind CSS</span>
                    <Badge>v3.4.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>React Router</span>
                    <Badge>v6.8.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recharts</span>
                    <Badge>v2.5.0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backend Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Supabase</span>
                    <Badge>Latest</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>PostgreSQL</span>
                    <Badge>v15.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>REST APIs</span>
                    <Badge>OpenAPI 3.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Redis Cache</span>
                    <Badge>v7.0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          {/* Database Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Database Tables</CardTitle>
                <CardDescription>Click to view table details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tables.map((table) => (
                    <Button
                      key={table.name}
                      variant={selectedTable?.name === table.name ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTable(table)}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {table.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedTable ? `Table: ${selectedTable.name}` : "Select a Table"}
                </CardTitle>
                <CardDescription>
                  {selectedTable ? selectedTable.description : "Choose a table to view its schema"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTable ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Nullable</TableHead>
                          <TableHead>Key</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTable.columns.map((column, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{column.name}</TableCell>
                            <TableCell>{column.type}</TableCell>
                            <TableCell>
                              <Badge variant={column.nullable ? "secondary" : "outline"}>
                                {column.nullable ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {column.key && (
                                <Badge variant="default">{column.key}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a table from the list to view its schema</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>RESTful API endpoints for system integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { method: "GET", endpoint: "/api/projects", description: "Retrieve all projects" },
                  { method: "POST", endpoint: "/api/projects", description: "Create new project" },
                  { method: "PUT", endpoint: "/api/projects/{id}", description: "Update project" },
                  { method: "DELETE", endpoint: "/api/projects/{id}", description: "Delete project" },
                  { method: "GET", endpoint: "/api/kpis", description: "Retrieve KPI data" },
                  { method: "POST", endpoint: "/api/kpis", description: "Create new KPI" },
                  { method: "GET", endpoint: "/api/reports/{type}", description: "Generate reports" },
                  { method: "GET", endpoint: "/api/users/profile", description: "Get user profile" }
                ].map((api, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        api.method === "GET" ? "default" :
                        api.method === "POST" ? "secondary" :
                        api.method === "PUT" ? "outline" : "destructive"
                      }>
                        {api.method}
                      </Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{api.endpoint}</code>
                      <span className="text-sm text-muted-foreground">{api.description}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Docs
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Guidelines</CardTitle>
              <CardDescription>Best practices for API integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    All API requests require JWT token in Authorization header
                  </p>
                  <code className="text-xs bg-muted p-2 block rounded">
                    Authorization: Bearer {'<token>'}
                  </code>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    API requests are limited to 1000 per hour per user
                  </p>
                  <code className="text-xs bg-muted p-2 block rounded">
                    X-RateLimit-Remaining: 999
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataModelArchitecture;