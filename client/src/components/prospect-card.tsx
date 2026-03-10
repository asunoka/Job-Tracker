import { useState } from "react";
import type { Prospect } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Pencil, Flame, ThumbsUp, Minus, DollarSign, CalendarClock, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditProspectForm } from "./edit-prospect-form";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const input = new Date(dateStr + "T00:00:00");
  return input < today;
}

function InterestIndicator({ level }: { level: string }) {
  switch (level) {
    case "High":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400" data-testid="interest-high">
          <Flame className="w-3 h-3" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400" data-testid="interest-medium">
          <ThumbsUp className="w-3 h-3" />
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground" data-testid="interest-low">
          <Minus className="w-3 h-3" />
          Low
        </span>
      );
    default:
      return null;
  }
}

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/prospects/${prospect.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({ title: "Prospect deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete prospect", variant: "destructive" });
    },
  });

  const importantDatePast = prospect.importantDate ? isDateInPast(prospect.importantDate) : false;

  return (
    <>
      <div
        className="group bg-card border border-card-border rounded-md p-3 space-y-2 hover-elevate cursor-pointer transition-all duration-150"
        onClick={() => setEditOpen(true)}
        data-testid={`card-prospect-${prospect.id}`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm leading-tight truncate" data-testid={`text-company-${prospect.id}`}>
              {prospect.companyName}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`text-role-${prospect.id}`}>
              {prospect.roleTitle}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              data-testid={`button-edit-${prospect.id}`}
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${prospect.id}`}
            >
              <Trash2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <InterestIndicator level={prospect.interestLevel} />
        </div>

        {prospect.salary && (
          <div
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            data-testid={`text-salary-${prospect.id}`}
          >
            <DollarSign className="w-3 h-3" />
            <span>{prospect.salary}</span>
          </div>
        )}

        {(prospect.updateDate || prospect.importantDate) && (
          <div className="flex flex-col gap-1" data-testid={`dates-${prospect.id}`}>
            {prospect.updateDate && (
              <div
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"
                data-testid={`text-update-date-${prospect.id}`}
              >
                <CalendarClock className="w-3 h-3" />
                <span>Updated: {formatDate(prospect.updateDate)}</span>
              </div>
            )}
            {prospect.importantDate && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  importantDatePast
                    ? "text-red-500 dark:text-red-400"
                    : "text-violet-600 dark:text-violet-400"
                }`}
                data-testid={`text-important-date-${prospect.id}`}
              >
                {importantDatePast ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <CalendarClock className="w-3 h-3" />
                )}
                <span>
                  Important: {formatDate(prospect.importantDate)}
                  {importantDatePast && " (passed)"}
                </span>
              </div>
            )}
          </div>
        )}

        {prospect.jobUrl && (
          <a
            href={prospect.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
            data-testid={`link-job-url-${prospect.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            Posting
          </a>
        )}

        {prospect.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-notes-${prospect.id}`}>
            {prospect.notes}
          </p>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prospect</DialogTitle>
          </DialogHeader>
          <EditProspectForm prospect={prospect} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
