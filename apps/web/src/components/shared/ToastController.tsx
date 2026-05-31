import { toast, Toaster as SonnerToaster } from "sonner";

interface ToastProps {
  message: string;
  description?: string;
}

export const ToastController = {
  success: ({ message, description }: ToastProps) => {
    toast.success(message, {
      description,
    });
  },
  error: ({ message, description }: ToastProps) => {
    toast.error(message, {
      description,
    });
  },
  info: ({ message, description }: ToastProps) => {
    toast.info(message, {
      description,
    });
  },
  warning: ({ message, description }: ToastProps) => {
    toast.warning(message, {
      description,
    });
  },
  loading: ({ message, description }: ToastProps) => {
    return toast.loading(message, {
      description,
    });
  },
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
};

export const Toaster = SonnerToaster;
