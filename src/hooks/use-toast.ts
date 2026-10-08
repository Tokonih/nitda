import { toast as sonnerToast } from "sonner"

// Shim types to satisfy TS/Linters if they check
type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "warning" | "info" | null
  action?: any
  [key: string]: any
}


function toast({ title, description, variant, ...props }: ToastProps) {
  // Map "destructive" to Error (Red)
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...props
    })
  }

  // Map "warning" to Warning (Yellow)
  if (variant === "warning") {
    return sonnerToast.warning(title, {
      description,
      ...props
    })
  }

  // Map "info" to Info (Blue)
  if (variant === "info") {
    return sonnerToast.info(title, {
      description,
      ...props
    })
  }

  // Map default to Success (Green)
  return sonnerToast.success(title, {
    description,
    ...props
  })
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id)
  }
}

export { useToast, toast }
