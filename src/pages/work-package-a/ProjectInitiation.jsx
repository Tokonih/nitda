import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, FileText, Users, Target, AlertTriangle } from "lucide-react";

const ProjectInitiation = () => {
  const [project, setProject] = useState({
    name: "",
    description: "",
    objectives: "",
    scope: "",
    timeline: "",
    budget: "",
    priority: "",
    lead: "",
    risks: ""
  });

  const handleSave = () => {
    // TODO: API call to save project
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Initiation</h1>
          <p className="text-muted-foreground">Define project scope, objectives, and key parameters</p>
        </div>
        <Button onClick={handleSave} className="nitda-button-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="nitda-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={project.description}
                onChange={(e) => setProject({ ...project, description: e.target.value })}
                placeholder="Brief project description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select onValueChange={(value) => setProject({ ...project, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="nitda-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Objectives & Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="objectives">Project Objectives</Label>
              <Textarea
                id="objectives"
                value={project.objectives}
                onChange={(e) => setProject({ ...project, objectives: e.target.value })}
                placeholder="List key objectives"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="scope">Project Scope</Label>
              <Textarea
                id="scope"
                value={project.scope}
                onChange={(e) => setProject({ ...project, scope: e.target.value })}
                placeholder="Define project scope and boundaries"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="nitda-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Timeline & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timeline">Project Timeline</Label>
              <Input
                id="timeline"
                value={project.timeline}
                onChange={(e) => setProject({ ...project, timeline: e.target.value })}
                placeholder="e.g., 12 months"
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget Estimate</Label>
              <Input
                id="budget"
                value={project.budget}
                onChange={(e) => setProject({ ...project, budget: e.target.value })}
                placeholder="e.g., ₦50,000,000"
              />
            </div>
            <div>
              <Label htmlFor="lead">Project Lead</Label>
              <Input
                id="lead"
                value={project.lead}
                onChange={(e) => setProject({ ...project, lead: e.target.value })}
                placeholder="Project manager name"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="nitda-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="risks">Identified Risks</Label>
              <Textarea
                id="risks"
                value={project.risks}
                onChange={(e) => setProject({ ...project, risks: e.target.value })}
                placeholder="List potential risks and mitigation strategies"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectInitiation;