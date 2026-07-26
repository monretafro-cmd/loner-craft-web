import type { BrandPhoto as Photo } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Renders an original Loner Leather photo. Renders nothing when the photo has
 * not been added to the project yet — never a stock or generated stand-in.
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
  if (!photo.src) return null;

  return (
    <img
      src={photo.src}
      alt={photo.alt}
      loading={priority ? "eager" : "lazy"}
      className={cn("h-full w-full object-cover object-center", className, imgClassName)}
    />
  );
}
