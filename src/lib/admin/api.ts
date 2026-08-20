import { supabase } from "@/integrations/supabase/client";

export const adminApi = {
  products: {
    list: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug),
          images:product_images(*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    updateStatus: async (id: string, status: string) => {
      const { error } = await supabase
        .from("products")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    }
  },
  orders: {
    list: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    updateStatus: async (id: string, status: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    }
  },
  stats: async () => {
    const [products, orders] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount", { count: "exact" })
    ]);
    
    const totalSales = (orders.data || []).reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0);
    
    return {
      productCount: products.count || 0,
      orderCount: orders.count || 0,
      totalSales
    };
  }
};
