import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText, Scale } from "lucide-react";

const ComplianceScalability = () => {
  const [checkedItems, setCheckedItems] = useState({});

  const complianceAreas = [
    {
      id: "data-protection",
      title: "Data Protection Compliance",
      description: "NDPR and international data protection standards",
      progress: 85,
      status: "compliant",
      items: [
        "Data Processing Impact Assessment completed",
        "Privacy Policy updated and published",
        "Data Subject Rights procedures implemented",
        "Data Breach Response Plan established",
        "Staff training on data protection completed"
      ]
    },
    {
      id: "security",
      title: "Cybersecurity Framework",
      description: "NITDA Cybersecurity Guidelines compliance",
      progress: 78,
      status: "in-progress",
      items: [
        "Security risk assessment conducted",
        "Multi-factor authentication implemented",
        "Regular security audits scheduled",
        "Incident response procedures documented",
        "Employee security awareness training"
      ]
    },
    {
      id: "interoperability",
      title: "Interoperability Standards",
      description: "API and data exchange standards",
      progress: 92,
      status: "compliant",
      items: [
        "REST API documentation completed",
        "Standard data formats adopted",
        "System integration testing passed",
        "Cross-platform compatibility verified",
        "API versioning strategy implemented"
      ]
    },
    {
      id: "accessibility",
      title: "Digital Accessibility",
      description: "WCAG 2.1 AA compliance for inclusive design",
      progress: 65,
      status: "needs-attention",
      items: [
        "Screen reader compatibility tested",
        "Keyboard navigation implemented",
        "Color contrast requirements met",
        "Alt text for images provided",
        "Accessibility audit completed"
      ]
    }
  ];

  const scalabilityFactors = [
    {
      id: "performance",
      title: "Performance Scalability",
      current: "1,000 users",
      target: "100,000 users",
      readiness: 70,
      requirements: [
        "Load balancing infrastructure",
        "Database optimization",
        "CDN implementation",
        "Caching strategies",
        "Auto-scaling configuration"
      ]
    },
    {
      id: "data",
      title: "Data Scalability",
      current: "10GB",
      target: "1TB",
      readiness: 85,
      requirements: [
        "Cloud storage solution",
        "Data archiving strategy",
        "Backup and recovery plan",
        "Data partitioning implementation",
        "Storage monitoring tools"
      ]
    },
    {
      id: "geographical",
      title: "Geographical Scalability",
      current: "FCT",
      target: "All 36 States + FCT",
      readiness: 60,
      requirements: [
        "Regional data centers",
        "Network infrastructure",
        "Local support teams",
        "State-level customization",
        "Connectivity redundancy"
      ]
    }
  ];

  const handleCheckItem = (areaId, itemIndex) => {
    const key = `${areaId}-${itemIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "needs-attention":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "needs-attention":
        return <Badge variant="destructive">Needs Attention</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compliance & Scalability</h1>
        <p className="text-muted-foreground mt-2">
          Monitor compliance readiness and scalability preparations for the Performance Management System Dashboard
        </p>
      </div>

      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="scalability" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Scalability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">80%</div>
                <Progress value={80} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliant Areas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">2</div>
                <p className="text-xs text-muted-foreground">Out of 4 areas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <p className="text-xs text-muted-foreground">Ongoing work</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">1</div>
                <p className="text-xs text-muted-foreground">Requires action</p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Areas */}
          <div className="grid gap-6">
            {complianceAreas.map((area) => (
              <Card key={area.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(area.status)}
                      <div>
                        <CardTitle className="text-lg">{area.title}</CardTitle>
                        <CardDescription>{area.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(area.status)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{area.progress}%</span>
                    </div>
                    <Progress value={area.progress} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {area.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${area.id}-${index}`}
                          checked={checkedItems[`${area.id}-${index}`] || false}
                          onCheckedChange={() => handleCheckItem(area.id, index)}
                        />
                        <label
                          htmlFor={`${area.id}-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">Update Status</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scalability" className="space-y-6">
          {/* Scalability Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Scalability Readiness Assessment</CardTitle>
              <CardDescription>
                Evaluate system readiness for scaling from pilot to national deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {scalabilityFactors.map((factor) => (
                  <div key={factor.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{factor.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current: {factor.current} → Target: {factor.target}
                        </p>
                      </div>
                      <Badge variant="outline">{factor.readiness}% Ready</Badge>
                    </div>
                    
                    <div className="mb-4">
                      <Progress value={factor.readiness} />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Requirements:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {factor.requirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Scalability Action Plan</CardTitle>
              <CardDescription>Priority actions for scaling readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">High Priority</h4>
                    <p className="text-sm text-muted-foreground">
                      Establish regional data centers for geographical scalability
                    </p>
                  </div>
                  <Button size="sm">Assign</Button>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">Medium Priority</h4>
                    <p className="text-sm text-muted-foreground">
                      Implement auto-scaling for performance optimization
                    </p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">Low Priority</h4>
                    <p className="text-sm text-muted-foreground">
                      Enhance monitoring and alerting systems
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceScalability;