import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProspectSchema, STATUSES, INTEREST_LEVELS } from "@shared/schema";
import type { InsertProspect } from "@shared/schema";
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

function getTodayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function isDateInPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const input = new Date(dateStr + "T00:00:00");
  return input < today;
}

export function AddProspectForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();

  const form = useForm<InsertProspect>({
    resolver: zodResolver(insertProspectSchema),
    defaultValues: {
      companyName: "",
      roleTitle: "",
      jobUrl: "",
      status: "Bookmarked",
      interestLevel: "Medium",
      salary: "",
      updateDate: getTodayString(),
      importantDate: "",
      notes: "",
    },
  });

  const importantDateValue = form.watch("importantDate");

  const mutation = useMutation({
    mutationFn: async (data: InsertProspect) => {
      await apiRequest("POST", "/api/prospects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      form.reset();
      toast({ title: "Prospect added successfully" });
      onSuccess?.();
    },
    onError: () => {
      toast({ title: "Failed to add prospect", variant: "destructive" });
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
                <Input placeholder="e.g. Google" {...field} data-testid="input-company-name" />
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
                <Input placeholder="e.g. Product Manager" {...field} data-testid="input-role-title" />
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
                  data-testid="input-job-url"
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} data-testid={`option-status-${s}`}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-interest">
                      <SelectValue placeholder="Select interest" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTEREST_LEVELS.map((level) => (
                      <SelectItem key={level} value={level} data-testid={`option-interest-${level}`}>
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
                  data-testid="input-salary"
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
                    data-testid="input-update-date"
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
                    data-testid="input-important-date"
                  />
                </FormControl>
                {isDateInPast(importantDateValue ?? "") && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1" data-testid="warning-important-date-past">
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
                  data-testid="input-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-prospect">
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Prospect"
          )}
        </Button>
      </form>
    </Form>
  );
}
