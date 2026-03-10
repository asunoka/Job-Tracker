import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProspectSchema, STATUSES, INTEREST_LEVELS } from "@shared/schema";
import type { InsertProspect, Prospect } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";

function isDateInPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const input = new Date(dateStr + "T00:00:00");
  return input < today;
}

interface EditProspectFormProps {
  prospect: Prospect;
  onSuccess?: () => void;
}

export function EditProspectForm({ prospect, onSuccess }: EditProspectFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertProspect>({
    resolver: zodResolver(insertProspectSchema),
    defaultValues: {
      companyName: prospect.companyName,
      roleTitle: prospect.roleTitle,
      jobUrl: prospect.jobUrl ?? "",
      status: prospect.status as InsertProspect["status"],
      interestLevel: prospect.interestLevel as InsertProspect["interestLevel"],
      salary: prospect.salary ?? "",
      updateDate: prospect.updateDate ?? "",
      importantDate: prospect.importantDate ?? "",
      notes: prospect.notes ?? "",
    },
  });

  const importantDateValue = form.watch("importantDate");

  const mutation = useMutation({
    mutationFn: async (data: InsertProspect) => {
      await apiRequest("PATCH", `/api/prospects/${prospect.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({ title: "Prospect updated" });
      onSuccess?.();
    },
    onError: () => {
      toast({ title: "Failed to update prospect", variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Google" {...field} data-testid="input-edit-company-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roleTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Product Manager" {...field} data-testid="input-edit-role-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job URL (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ""}
                  data-testid="input-edit-job-url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} data-testid={`option-edit-status-${s}`}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interestLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-edit-interest">
                      <SelectValue placeholder="Select interest" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTEREST_LEVELS.map((level) => (
                      <SelectItem key={level} value={level} data-testid={`option-edit-interest-${level}`}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. $120k, $90k-$110k, ~$100k"
                  {...field}
                  value={field.value ?? ""}
                  data-testid="input-edit-salary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="updateDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Update Date (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ?? ""}
                    data-testid="input-edit-update-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="importantDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Important Date (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ?? ""}
                    className={isDateInPast(importantDateValue ?? "") ? "border-red-500 text-red-600" : ""}
                    data-testid="input-edit-important-date"
                  />
                </FormControl>
                {isDateInPast(importantDateValue ?? "") && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1" data-testid="warning-edit-important-date-past">
                    <AlertTriangle className="w-3 h-3" />
                    This date has already passed
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                  data-testid="input-edit-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save-prospect">
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
}
