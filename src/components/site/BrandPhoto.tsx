import { Camera } from "lucide-react";
import type { BrandPhoto as Photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Renders an original Loner Leather photo. If the photo has not been added to
 * the project yet, an empty frame is shown instead of a stock stand-in.
 */
export function BrandPhoto({
  photo,
  className,
  imgClassName,
  priority = false,
}: {
  photo: Photo;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  if (!photo.src) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-2xl border border-dashed border-border bg-secondary p-8 text-center",
          className,
        )}
      >
        <div className="max-w-xs">
          <Camera className="mx-auto h-6 w-6 text-primary" />
          <p className="font-display mt-3 text-lg">{photo.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Waiting for the original Loner Leather photo. No stock or generated image is used here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={photo.src}
      alt={photo.alt}
      loading={priority ? "eager" : "lazy"}
      className={cn("h-full w-full object-contain", imgClassName, className)}
    />
  );
}
