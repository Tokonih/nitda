import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
// import { createSrap } from "@/Slices/createSrapSlice";
import { fetchPillars } from "@/Slices/pillarSlice";
import { createSrap } from "../Slices/srapSlice";
import { useToast } from "@/hooks/use-toast";
import { useYears } from "@/hooks/use-years";
import { getErrorMessage } from "@/lib/utils";

const SrapCreation = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { list: pillars, loading: pillarsLoading } = useSelector(
    (state) => state.pillars
  );
  const { years: yearsList } = useYears();

  const [srapData, setSrapData] = useState({
    pillar_id: "",
    srap_2_0_implementation_initiative_focus: "",
    srap_2_0_objectives: "",
    data_source: "",
    status_of_projects: "",
    percentage_completion_of_project: "",
    sector: "",
    type_of_report_expected: "",
    year: 2025,
    annual_target: "",
    q1_target: "",
    q2_target: "",
    q3_target: "",
    q4_target: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPillars());
  }, [dispatch]);

  const handleChange = (field, value) => {
    const numericFields = [
      "pillar_id",
      "percentage_completion_of_project",
      "annual_target",
      "q1_target",
      "q2_target",
      "q3_target",
      "q4_target",
      "year",
    ];

    setSrapData((prev) => ({
      ...prev,
      [field]: numericFields.includes(field) ? Number(value) : value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!srapData.pillar_id) newErrors.pillar_id = "Pillar is required";
    if (!srapData.srap_2_0_implementation_initiative_focus.trim())
      newErrors.srap_2_0_implementation_initiative_focus =
        "Initiative focus is required";
    if (!srapData.srap_2_0_objectives.trim())
      newErrors.srap_2_0_objectives = "Objectives are required";
    // if (!srapData.initiative_code.trim())
    //   newErrors.initiative_code = "Code is required";
    if (!srapData.status_of_projects.trim())
      newErrors.status_of_projects = "Status is required";
    if (!srapData.percentage_completion_of_project)
      newErrors.percentage_completion_of_project = "% Completion is required";
    if (!srapData.sector) newErrors.sector = "sector is required";
    if (!srapData.type_of_report_expected)
      newErrors.type_of_report_expected = "Type of report expected is required";
    if (!srapData.year) newErrors.year = "Year is required";
    if (!srapData.annual_target)
      newErrors.annual_target = "Annual target is required";
    if (!srapData.q1_target) newErrors.q1_target = "Q1 target is required";
    if (!srapData.q2_target) newErrors.q2_target = "Q2 target is required";
    if (!srapData.q3_target) newErrors.q3_target = "Q3 target is required";
    if (!srapData.q4_target) newErrors.q4_target = "Q4 target is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await dispatch(createSrap(srapData)).unwrap();
      toast({
        title: "SRAP created successfully!",
        description: `${srapData.srap_2_0_implementation_initiative_focus} has been added.`,
      });

      setSrapData({
        pillar_id: "",
        srap_2_0_implementation_initiative_focus: "",
        srap_2_0_objectives: "",
        data_source: "",
        status_of_projects: "",
        percentage_completion_of_project: "",
        sector: "",
        type_of_report_expected: "",
        year: new Date().getFullYear(),
        annual_target: "",
        q1_target: "",
        q2_target: "",
        q3_target: "",
        q4_target: "",
      });
    } catch (err) {
      toast({
        title: "Error Creating SRAP",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create SRAP</h1>
        <p className="text-muted-foreground mt-2">
          Enter details to create a new SRAP record
        </p>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>SRAP Details</CardTitle>
          <CardDescription>
            Fill in the information to create a SRAP
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Row 1: Pillar Select */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pillar_id">Pillar *</Label>
              <select
                id="pillar_id"
                value={srapData.pillar_id}
                onChange={(e) =>
                  handleChange("pillar_id", Number(e.target.value))
                }
                className={`w-full rounded-md border p-2 bg-background  border border-input ${errors.pillar_id ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <option value="">Select a pillar</option>
                {pillarsLoading ? (
                  <option>Loading...</option>
                ) : (
                  pillars?.map((pillar) => (
                    <option key={pillar.id} value={pillar.id}>
                      {pillar.id} - {pillar.name || "Unnamed Pillar"}
                    </option>
                  ))
                )}
              </select>
              {errors.pillar_id && (
                <p className="text-sm text-red-500">{errors.pillar_id}</p>
              )}
            </div>
            {/* </div> */}

            {/* Initiative focus */}
            <div className="space-y-2">
              <Label htmlFor="focus">Initiative Focus *</Label>
              <Input
                id="focus"
                value={srapData.srap_2_0_implementation_initiative_focus}
                onChange={(e) =>
                  handleChange(
                    "srap_2_0_implementation_initiative_focus",
                    e.target.value
                  )
                }
                className={
                  errors.srap_2_0_implementation_initiative_focus
                    ? "border-red-500 p-1"
                    : "p-1"
                }
              />
              {errors.srap_2_0_implementation_initiative_focus && (
                <p className="text-sm text-red-500">
                  {errors.srap_2_0_implementation_initiative_focus}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">SRAP objectives *</Label>
              <Input
                id="focus"
                value={srapData.srap_2_0_objectives}
                onChange={(e) =>
                  handleChange("srap_2_0_objectives", e.target.value)
                }
                className={
                  errors.srap_2_0_objectives ? "border-red-500 p-1" : "p-1"
                }
              />
              {errors.srap_2_0_objectives && (
                <p className="text-sm text-red-500">
                  {errors.srap_2_0_objectives}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_source">Data Source *</Label>
              <Input
                id="data_source"
                value={srapData.data_source}
                onChange={(e) => handleChange("data_source", e.target.value)}
                className={errors.data_source ? "border-red-500 p-1" : "p-1"}
              />
              {errors.data_source && (
                <p className="text-sm text-red-500">{errors.data_source}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Status of projects *</Label>
              <Input
                id="focus"
                value={srapData.status_of_projects}
                onChange={(e) =>
                  handleChange("status_of_projects", e.target.value)
                }
                className={
                  errors.status_of_projects ? "border-red-500 p-1" : "p-1"
                }
              />
              {errors.status_of_projects && (
                <p className="text-sm text-red-500">
                  {errors.status_of_projects}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Percentage completion of project *</Label>
              <Input
                id="percentage_completion_of_project"
                type="number"
                min="0"
                max="100"
                value={srapData.percentage_completion_of_project}
                onChange={(e) => {
                  let value = Number(e.target.value);

                  // Clamp between 0 and 100
                  if (value > 100) value = 100;
                  if (value < 0) value = 0;

                  handleChange("percentage_completion_of_project", value);
                }}
                className={
                  errors.percentage_completion_of_project
                    ? "border-red-500 p-1"
                    : "p-1"
                }
              />

              {errors.percentage_completion_of_project && (
                <p className="text-sm text-red-500">
                  {errors.percentage_completion_of_project}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">sector *</Label>
              <Input
                id="focus"
                value={srapData.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                className={errors.sector ? "border-red-500 p-1" : "p-1"}
              />
              {errors.sector && (
                <p className="text-sm text-red-500">{errors.sector}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus">Type of report expected *</Label>
              <Input
                id="focus"
                value={srapData.type_of_report_expected}
                onChange={(e) =>
                  handleChange("type_of_report_expected", e.target.value)
                }
                className={
                  errors.type_of_report_expected ? "border-red-500 p-1" : "p-1"
                }
              />
              {errors.type_of_report_expected && (
                <p className="text-sm text-red-500">
                  {errors.type_of_report_expected}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">year *</Label>
              <select
                id="year"
                className={`w-full border p-2 rounded ${errors.year ? "border-red-500" : "border-gray-300"}`}
                value={srapData.year}
                onChange={(e) => handleChange("year", Number(e.target.value))}
              >
                <option value="">Select Year</option>
                {yearsList.map((y) => (
                  <option key={y.id} value={y.year}>
                    {y.year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Annual target *</Label>
              <Input
                id="focus"
                type="number"
                value={srapData.annual_target}
                onChange={(e) => handleChange("annual_target", e.target.value)}
                className={errors.annual_target ? "border-red-500 p-1" : "p-1"}
              />
              {errors.annual_target && (
                <p className="text-sm text-red-500">{errors.annual_target}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Q1 target *</Label>
              <Input
                id="focus"
                type="number"
                value={srapData.q1_target}
                onChange={(e) => handleChange("q1_target", e.target.value)}
                className={errors.q1_target ? "border-red-500 p-1" : "p-1"}
              />
              {errors.q1_target && (
                <p className="text-sm text-red-500">{errors.q1_target}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Q2 target *</Label>
              <Input
                id="focus"
                type="number"
                value={srapData.q2_target}
                onChange={(e) => handleChange("q2_target", e.target.value)}
                className={errors.q2_target ? "border-red-500 p-1" : "p-1"}
              />
              {errors.q2_target && (
                <p className="text-sm text-red-500">{errors.q2_target}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus">Q3 target *</Label>
              <Input
                id="focus"
                type="number"
                value={srapData.q3_target}
                onChange={(e) => handleChange("q3_target", e.target.value)}
                className={errors.q3_target ? "border-red-500 p-1" : "p-1"}
              />
              {errors.q3_target && (
                <p className="text-sm text-red-500">{errors.q3_target}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus">Q4 target *</Label>
              <Input
                id="focus"
                type="number"
                value={srapData.q4_target}
                onChange={(e) => handleChange("q4_target", e.target.value)}
                className={errors.q4_target ? "border-red-500 p-1" : "p-1"}
              />
              {errors.q4_target && (
                <p className="text-sm text-red-500">{errors.q4_target}</p>
              )}
            </div>
          </div>

          {/* ... Keep the rest of your fields unchanged (objectives, initiatives, etc.) */}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !srapData.pillar_id ||
                !srapData.srap_2_0_implementation_initiative_focus ||
                !srapData.srap_2_0_objectives ||
                !srapData.status_of_projects ||
                !srapData.percentage_completion_of_project ||
                !srapData.sector ||
                !srapData.type_of_report_expected ||
                !srapData.year ||
                !srapData.annual_target ||
                !srapData.q1_target ||
                !srapData.q2_target ||
                !srapData.q3_target ||
                !srapData.q4_target
              }
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />{" "}
              {loading ? "Creating..." : "Create SRAP"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() =>
                setSrapData({
                  pillar_id: "",
                  srap_2_0_implementation_initiative_focus: "",
                  srap_2_0_objectives: "",
                  data_source: "",
                  // srap_2_0_initiatives: "",
                  initiative_code: "",
                  status_of_projects: "",
                  percentage_completion_of_project: "",
                  sector: "",
                  type_of_report_expected: "",
                  year: 2025,
                  annual_target: "",
                  q1_target: "",
                  q2_target: "",
                  q3_target: "",
                  q4_target: "",
                })
              }
            >
              <X className="h-4 w-4 mr-1" /> Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SrapCreation;
