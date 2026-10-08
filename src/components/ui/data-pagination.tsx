import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: DataPaginationProps) => {
  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 5;

    if (showEllipsis) {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-end gap-4 mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      {renderPageNumbers().map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <div key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        }

        return (
          <Button
            key={page}
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={cn(
              "w-9 h-9 flex items-center gap-1 p-2",
              currentPage === page 
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};
