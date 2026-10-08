import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, MessageSquare, Download, Upload, Star, Plus } from "lucide-react";

const WireframesPrototypes = () => {
  const [feedback, setFeedback] = useState("");
  const [selectedWireframe, setSelectedWireframe] = useState(null);

  const wireframes = [
    {
      id: 1,
      title: "Dashboard Overview",
      description: "Main dashboard layout with KPI cards and charts",
      status: "approved",
      version: "v2.1",
      lastUpdated: "2024-01-15",
      feedback: 12,
      rating: 4.5,
      image: "/placeholder.svg",
      category: "dashboard"
    },
    {
      id: 2,
      title: "Project Management Interface",
      description: "Project list and detail views with filtering",
      status: "review",
      version: "v1.3",
      lastUpdated: "2024-01-12",
      feedback: 8,
      rating: 4.2,
      image: "/placeholder.svg",
      category: "projects"
    },
    {
      id: 3,
      title: "User Authentication Flow",
      description: "Login, registration, and password recovery screens",
      status: "approved",
      version: "v1.0",
      lastUpdated: "2024-01-10",
      feedback: 5,
      rating: 4.8,
      image: "/placeholder.svg",
      category: "auth"
    },
    {
      id: 4,
      title: "Mobile Dashboard",
      description: "Responsive mobile layout for dashboard",
      status: "draft",
      version: "v0.8",
      lastUpdated: "2024-01-08",
      feedback: 3,
      rating: 4.0,
      image: "/placeholder.svg",
      category: "mobile"
    },
    {
      id: 5,
      title: "Reports Interface",
      description: "Report generation and export functionality",
      status: "review",
      version: "v1.1",
      lastUpdated: "2024-01-05",
      feedback: 6,
      rating: 4.3,
      image: "/placeholder.svg",
      category: "reports"
    },
    {
      id: 6,
      title: "Settings & Configuration",
      description: "System settings and user preferences",
      status: "draft",
      version: "v0.5",
      lastUpdated: "2024-01-03",
      feedback: 2,
      rating: 3.9,
      image: "/placeholder.svg",
      category: "settings"
    }
  ];

  const prototypes = [
    {
      id: 1,
      title: "Interactive Dashboard Prototype",
      description: "Fully interactive dashboard with live data simulation",
      status: "live",
      url: "https://prototype1.example.com",
      lastUpdated: "2024-01-14",
      feedback: 15,
      rating: 4.6
    },
    {
      id: 2,
      title: "Mobile App Prototype",
      description: "Mobile application prototype with core features",
      status: "testing",
      url: "https://mobile-proto.example.com",
      lastUpdated: "2024-01-11",
      feedback: 9,
      rating: 4.1
    },
    {
      id: 3,
      title: "Admin Panel Prototype",
      description: "Administrative interface for system management",
      status: "development",
      url: "https://admin-proto.example.com",
      lastUpdated: "2024-01-09",
      feedback: 7,
      rating: 4.4
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "review":
        return <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "live":
        return <Badge className="bg-blue-100 text-blue-800">Live</Badge>;
      case "testing":
        return <Badge className="bg-purple-100 text-purple-800">Testing</Badge>;
      case "development":
        return <Badge className="bg-orange-100 text-orange-800">Development</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categories = ["all", "dashboard", "projects", "auth", "mobile", "reports", "settings"];
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredWireframes = selectedCategory === "all" 
    ? wireframes 
    : wireframes.filter(w => w.category === selectedCategory);

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      // TODO: Submit feedback to API
      setFeedback("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wireframes & Prototypes</h1>
        <p className="text-muted-foreground mt-2">
          UI/UX design mockups and interactive prototypes for stakeholder review
        </p>
      </div>

      <Tabs defaultValue="wireframes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="wireframes">Wireframes</TabsTrigger>
          <TabsTrigger value="prototypes">Prototypes</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="wireframes" className="space-y-6">
          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Filter wireframes by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wireframes Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWireframes.map((wireframe) => (
              <Card key={wireframe.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{wireframe.title}</CardTitle>
                      <CardDescription className="mt-1">{wireframe.description}</CardDescription>
                    </div>
                    {getStatusBadge(wireframe.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Wireframe Preview */}
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src={wireframe.image}
                      alt={wireframe.title}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden flex-col items-center text-muted-foreground">
                      <Eye className="h-8 w-8 mb-2" />
                      <span className="text-sm">Wireframe Preview</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Version: {wireframe.version}</span>
                      <span className="text-muted-foreground">Updated: {wireframe.lastUpdated}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{wireframe.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({wireframe.feedback} feedback)
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{wireframe.title}</DialogTitle>
                            <DialogDescription>{wireframe.description}</DialogDescription>
                          </DialogHeader>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <img
                              src={wireframe.image}
                              alt={wireframe.title}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden flex-col items-center text-muted-foreground">
                              <Eye className="h-12 w-12 mb-4" />
                              <span>Full Wireframe View</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload New Wireframe</CardTitle>
              <CardDescription>Add new wireframe designs for review</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Wireframe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prototypes" className="space-y-6">
          {/* Prototypes List */}
          <div className="grid gap-6">
            {prototypes.map((prototype) => (
              <Card key={prototype.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{prototype.title}</CardTitle>
                      <CardDescription className="mt-2">{prototype.description}</CardDescription>
                    </div>
                    {getStatusBadge(prototype.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm ml-1">{prototype.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {prototype.feedback} feedback responses
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Updated: {prototype.lastUpdated}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button asChild>
                      <a href={prototype.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        View Prototype
                      </a>
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Provide Feedback
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Prototype</CardTitle>
              <CardDescription>Start building an interactive prototype</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Prototype
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Provide Feedback</CardTitle>
              <CardDescription>Share your thoughts on the wireframes and prototypes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your feedback, suggestions, or concerns about the designs..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                  <Button variant="outline" onClick={() => setFeedback("")}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>Latest feedback from stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: "Dr. Amina Hassan",
                    role: "Project Director",
                    feedback: "The dashboard layout looks excellent. Suggest adding more filter options for the KPI section.",
                    date: "2024-01-14",
                    rating: 4
                  },
                  {
                    user: "Eng. Chukwuma Okafor",
                    role: "Technical Lead",
                    feedback: "Mobile responsiveness needs improvement. The navigation menu overlaps content on smaller screens.",
                    date: "2024-01-13",
                    rating: 3
                  },
                  {
                    user: "Mrs. Fatima Abdullahi",
                    role: "UI/UX Specialist",
                    feedback: "Love the color scheme and typography choices. Very aligned with NITDA branding guidelines.",
                    date: "2024-01-12",
                    rating: 5
                  }
                ].map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{item.user}</h4>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < item.rating 
                                  ? "text-yellow-500 fill-current" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                    </div>
                    <p className="text-sm">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WireframesPrototypes;