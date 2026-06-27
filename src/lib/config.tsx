import { 
  FileText, CheckCircle2, Send, 
  Loader2, XCircle, AlertTriangle, Ban 
} from "lucide-react";

export const MISSION_STATUS_CONFIG = {
  DRAFT: {
    labelKey: "draft", //OK//
    color: "text-neutral-200 border-neutral-600 bg-neutral-800/40",
    icon: FileText,
  },
  READY: {
    labelKey: "status.ready", //OK//
    color: "text-teal-200 border-teal-500/10 bg-teal-800/40",
    icon: CheckCircle2,
  },
  SENT: {
    labelKey: "status.sent", //OK//
    color: "text-blue-200 border-blue-400/10 bg-blue-800/40",
    icon: Send,
  },
  IN_PROGRESS: {
    labelKey: "status.active",
    color: "text-teal-200 border-teal-400/20 bg-teal-800/40",
    icon: Loader2, 
  },
  COMPLETED: {
    labelKey: "status.done", //OK//
    color: "text-green-200 border-green-400/20 bg-green-600/40",
    icon: CheckCircle2,
  },
  FAILED: {
    labelKey: "status.failed", //OK//
    color: "text-red-200 border-red-500/20 bg-red-800/40",
    icon: AlertTriangle,
  },
  CANCELLED: {
    labelKey: "status.canceled",
    color: "text-neutral-400 border-neutral-100/10 bg-neutral-800/50",
    icon: Ban,
  },
} as const;