import { List, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataViewToggleProps {
  view: "table" | "grid";
  onViewChange: (view: "table" | "grid") => void;
}

export const DataViewToggle = ({ view, onViewChange }: DataViewToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">View:</span>
      <div className="flex rounded-md gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-md  p-1 flex items-center justify-center ",
            view === "table" &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-[4px] "
          )}
          onClick={() => onViewChange("table")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-md  p-1 flex items-center justify-center ",

            view === "grid" &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={() => onViewChange("grid")}
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
