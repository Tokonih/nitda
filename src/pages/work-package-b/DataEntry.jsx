import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Plus, Save, X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const DataEntry = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    sector: "",
    state: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: ""
  });

  const [kpiData, setKpiData] = useState({
    name: "",
    category: "",
    targetValue: "",
    currentValue: "",
    unit: "",
    description: ""
  });

  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "project-proposal.pdf", size: "2.4 MB", status: "uploaded" },
    { name: "budget-breakdown.xlsx", size: "1.1 MB", status: "processing" },
    { name: "timeline-chart.png", size: "584 KB", status: "uploaded" }
  ]);

  const [validationErrors, setValidationErrors] = useState({});

  const sectors = [
    "Education", "Healthcare", "Agriculture", "Finance", "Transportation",
    "Energy", "Manufacturing", "Tourism", "Mining", "Technology"
  ];

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti",
    "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
    "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
    "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const kpiCategories = [
    "Digital Infrastructure", "Digital Literacy", "Digital Economy",
    "Digital Government", "Cybersecurity", "Innovation", "Capacity Building"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleKpiChange = (field, value) => {
    setKpiData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.projectTitle.trim()) errors.projectTitle = "Project title is required";
    if (!formData.sector) errors.sector = "Sector is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.budget) errors.budget = "Budget is required";
    if (!formData.startDate) errors.startDate = "Start date is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProjectSubmit = async () => {
    if (validateForm()) {
      try {
        // TODO: Submit project data to API
        toast({
          title: "Project Submitted",
          description: "Project has been submitted successfully!",
          className: "bg-green-600 text-white border-green-600"
        });
      } catch (err) {
        toast({
          title: "Error Submitting Project",
          description: getErrorMessage(err),
          variant: "destructive",
        });
      }
    }
  };

  const handleKpiSubmit = async () => {
    if (kpiData.name && kpiData.category && kpiData.targetValue) {
      try {
        // TODO: Submit KPI data to API
        toast({
          title: "KPI Submitted",
          description: "KPI has been submitted successfully!",
          className: "bg-green-600 text-white border-green-600"
        });
        setKpiData({
          name: "", category: "", targetValue: "", currentValue: "", unit: "", description: ""
        });
      } catch (err) {
        toast({
          title: "Error Submitting KPI",
          description: getErrorMessage(err),
          variant: "destructive",
        });
      }
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      // TODO: Upload file to storage
      const newFile = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: "processing"
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  };

  const removeFile = (fileName) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Entry</h1>
        <p className="text-muted-foreground mt-2">
          Add new projects, KPIs, and upload supporting documents
        </p>
      </div>

      <Tabs defaultValue="project" className="space-y-6">
        <TabsList>
          <TabsTrigger value="project">New Project</TabsTrigger>
          <TabsTrigger value="kpi">Add KPI</TabsTrigger>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Enter project details for the Digital Transformation initiative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    placeholder="Enter project title"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                    className={validationErrors.projectTitle ? "border-red-500" : ""}
                  />
                  {validationErrors.projectTitle && (
                    <p className="text-sm text-red-500">{validationErrors.projectTitle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                    <SelectTrigger className={validationErrors.sector ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector.toLowerCase()}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.sector && (
                    <p className="text-sm text-red-500">{validationErrors.sector}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger className={validationErrors.state ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state.toLowerCase()}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.state && (
                    <p className="text-sm text-red-500">{validationErrors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₦) *</Label>
                  <Input
                    id="budget"
                    placeholder="Enter project budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    className={validationErrors.budget ? "border-red-500" : ""}
                  />
                  {validationErrors.budget && (
                    <p className="text-sm text-red-500">{validationErrors.budget}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className={validationErrors.startDate ? "border-red-500" : ""}
                  />
                  {validationErrors.startDate && (
                    <p className="text-sm text-red-500">{validationErrors.startDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed project description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleProjectSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Project
                </Button>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Save & Add Another
                </Button>
                <Button variant="outline" onClick={() => setFormData({})}>
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Key Performance Indicator</CardTitle>
              <CardDescription>
                Define KPIs to track project success and digital transformation progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kpiName">KPI Name *</Label>
                  <Input
                    id="kpiName"
                    placeholder="Enter KPI name"
                    value={kpiData.name}
                    onChange={(e) => handleKpiChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kpiCategory">Category *</Label>
                  <Select value={kpiData.category} onValueChange={(value) => handleKpiChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpiCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase().replace(" ", "-")}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    placeholder="Enter target value"
                    value={kpiData.targetValue}
                    onChange={(e) => handleKpiChange("targetValue", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    placeholder="Enter current value"
                    value={kpiData.currentValue}
                    onChange={(e) => handleKpiChange("currentValue", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit of Measurement</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., %, count, hours"
                    value={kpiData.unit}
                    onChange={(e) => handleKpiChange("unit", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="kpiDescription">Description</Label>
                  <Textarea
                    id="kpiDescription"
                    placeholder="Describe the KPI and measurement methodology..."
                    value={kpiData.description}
                    onChange={(e) => handleKpiChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleKpiSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  Add KPI
                </Button>
                <Button variant="outline" onClick={() => setKpiData({})}>
                  Clear Form
                </Button>
              </div>

              {/* KPI Progress Visualization */}
              {kpiData.currentValue && kpiData.targetValue && (
                <Card>
                  <CardHeader>
                    <CardTitle>KPI Progress Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">{kpiData.name || "New KPI"}</span>
                        <span className="text-sm text-muted-foreground">
                          {kpiData.currentValue}/{kpiData.targetValue} {kpiData.unit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min((parseFloat(kpiData.currentValue) / parseFloat(kpiData.targetValue)) * 100, 100)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Upload supporting documents, reports, and project files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-lg mb-2">Upload Files</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                />
                <Button asChild>
                  <label htmlFor="fileInput" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, XLS, PNG, JPG (Max 10MB each)
                </p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === "uploaded" ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Processing
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile(file.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* File Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>File Categories</CardTitle>
                  <CardDescription>Organize files by category for better management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      "Project Documents",
                      "Financial Reports",
                      "Technical Specifications",
                      "Compliance Documents",
                      "Progress Reports",
                      "Meeting Minutes",
                      "Presentations",
                      "Media Files"
                    ].map((category) => (
                      <Button key={category} variant="outline" className="justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataEntry;