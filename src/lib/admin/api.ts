import { supabase } from "@/integrations/supabase/client";

export const adminApi = {
  stats: async () => {
    // Basic stats aggregation
    const [products, orders, customers, lowStock] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total, created_at, status, customer_name, city, order_number", { count: "exact" }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).lt("stock", 5)
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = (orders.data || [])
      .filter(o => new Date(o.created_at) >= today)
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

    return {
      productCount: products.count || 0,
      orderCount: orders.count || 0,
      customerCount: customers.count || 0,
      lowStockCount: lowStock.count || 0,
      salesToday,
      recentOrders: (orders.data || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
    };
  },

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
    // We'll add more methods as we build the pages
  },

  orders: {
    list: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  },

  access: {
    listProfiles: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    updateStatus: async (id: string, status: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    }
  }
};
