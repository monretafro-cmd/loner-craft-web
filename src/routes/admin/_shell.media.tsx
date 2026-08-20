import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  FolderPlus, 
  MoreVertical, 
  Copy, 
  Trash2,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/_shell/media")({
  component: MediaLibraryPage,
});

function MediaLibraryPage() {
  const { data: media, isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      // In a real app, this would list files from Supabase Storage
      // For now, we fetch product images as proxy for media library
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const folders = [
    { name: "Products", count: media?.length || 0 },
    { name: "Packaging", count: 0 },
    { name: "Hero Sections", count: 0 },
    { name: "Reviews", count: 0 },
    { name: "Brand Assets", count: 0 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full bg-stone-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-stone-100 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#241812]">Media Library</h1>
          <p className="text-stone-500 text-sm mt-1">Manage images and assets for your store</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-stone-200 gap-2">
            <FolderPlus size={18} />
            New Folder
          </Button>
          <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white gap-2">
            <Upload size={18} />
            Upload Media
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {folders.map((folder) => (
          <Card key={folder.name} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 bg-stone-50 rounded-full text-stone-400 group-hover:bg-[#8A4D25]/10 group-hover:text-[#8A4D25] transition-colors">
                <Folder size={24} />
              </div>
              <h4 className="text-sm font-medium text-[#241812]">{folder.name}</h4>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">{folder.count} Items</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              placeholder="Search media..." 
              className="pl-10 border-stone-200 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-stone-200/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {(media || []).map((item: any) => (
            <div key={item.id} className="group relative aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 hover:border-[#8A4D25] transition-colors">
              <img 
                src={item.url} 
                alt={item.alt_text || "Media item"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white text-stone-800">
                  <Copy size={14} />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white text-stone-800">
                  <MoreVertical size={14} />
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600/90 hover:bg-red-600">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {(!media || media.length === 0) && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-400 space-y-4">
              <ImageIcon size={64} strokeWidth={1} />
              <p>No media files found. Start by uploading some.</p>
              <Button className="bg-[#8A4D25] hover:bg-[#241812] text-white">
                Upload First Item
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
