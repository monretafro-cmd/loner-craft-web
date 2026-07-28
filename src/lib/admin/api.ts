import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TableName =
  | "products"
  | "product_images"
  | "product_variants"
  | "categories"
  | "customers"
  | "customer_notes"
  | "orders"
  | "order_items"
  | "order_status_history"
  | "whatsapp_logs"
  | "inventory_history"
  | "coupons"
  | "reviews"
  | "messages"
  | "delivery_zones"
  | "notifications"
  | "homepage_content"
  | "site_settings"
  | "media"
  | "audit_logs"
  | "profiles"
  | "user_roles";

type RowsOptions = {
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  eq?: Record<string, string | number | boolean | null>;
  enabled?: boolean;
};

export function rowsKey(table: TableName, options: RowsOptions = {}) {
  return ["admin", table, options.select ?? "*", options.orderBy ?? "", options.eq ?? {}, options.limit ?? 0];
}

export async function fetchRows<T = any>(table: TableName, options: RowsOptions = {}): Promise<T[]> {
  let query = supabase.from(table).select(options.select ?? "*");
  if (options.eq) {
    for (const [key, value] of Object.entries(options.eq)) {
      query = value === null ? query.is(key, null) : query.eq(key, value as never);
    }
  }
  if (options.orderBy) query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

export function useRows<T = any>(table: TableName, options: RowsOptions = {}) {
  return useQuery({
    queryKey: rowsKey(table, options),
    queryFn: () => fetchRows<T>(table, options),
    enabled: options.enabled ?? true,
  });
}

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (table?: TableName) =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "admin" &&
        (!table || query.queryKey[1] === table),
    });
}

export async function logAudit(input: {
  action: string;
  page?: string;
  recordType?: string;
  recordId?: string;
  newValue?: unknown;
  oldValue?: unknown;
}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_logs").insert({
    admin_id: data.user.id,
    admin_name: data.user.email ?? null,
    action: input.action,
    page: input.page ?? null,
    record_type: input.recordType ?? null,
    record_id: input.recordId ?? null,
    new_value: (input.newValue ?? null) as never,
    old_value: (input.oldValue ?? null) as never,
  });
}

export function useSaveRow(table: TableName, page?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (values: Record<string, unknown> & { id?: string }) => {
      const { id, ...rest } = values;
      if (id) {
        const { data, error } = await supabase.from(table).update(rest as never).eq("id", id).select().single();
        if (error) throw error;
        await logAudit({ action: "update", page, recordType: table, recordId: id, newValue: rest });
        return data;
      }
      const { data, error } = await supabase.from(table).insert(rest as never).select().single();
      if (error) throw error;
      await logAudit({ action: "create", page, recordType: table, recordId: (data as any)?.id, newValue: rest });
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRow(table: TableName, page?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await logAudit({ action: "delete", page, recordType: table, recordId: id });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadFile(bucket: "product-images" | "media", file: File, folder = "uploads") {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (signError) throw signError;
  return { url: data.signedUrl, path };
}