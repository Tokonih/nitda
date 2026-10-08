import { X } from "lucide-react";
import { useEffect } from "react";

export const CustomDialog = ({ open, onOpenChange, title, description, children, className = "" }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div className={`relative z-50 w-full max-w-[95vw] sm:max-w-md mx-[2.5vw] sm:mx-4 nitda-card rounded-lg shadow-lg p-5 sm:p-6 flex flex-col ${className}`}>
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
};
