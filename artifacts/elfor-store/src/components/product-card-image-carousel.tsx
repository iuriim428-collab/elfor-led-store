import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { hasDarkBackgroundImage, sortProductImages } from "@/lib/product-images";
import { resolveStorageUrl } from "@/lib/utils";

interface ProductCardImageCarouselProps {
  imageUrl?: string | null;
  images?: string[];
  name: string;
}

export function ProductCardImageCarousel({
  imageUrl,
  images = [],
  name,
}: ProductCardImageCarouselProps) {
  const allImages = useMemo(() => {
    const normalized = [...(imageUrl ? [imageUrl] : []), ...images]
      .filter(Boolean)
      .map((url) => resolveStorageUrl(url));

    return sortProductImages(normalized);
  }, [imageUrl, images]);

  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [allImages]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const syncActiveIndex = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    syncActiveIndex();
    api.on("reInit", syncActiveIndex);
    api.on("select", syncActiveIndex);

    return () => {
      api.off("reInit", syncActiveIndex);
      api.off("select", syncActiveIndex);
    };
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.scrollTo(0, true);
  }, [api, allImages]);

  const hasImages = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;
  const showPrevious = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    api?.scrollPrev();
  };

  const showNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    api?.scrollNext();
  };

  const showSlide = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    api?.scrollTo(index);
  };

  return (
    <div className="group/image relative aspect-square overflow-hidden border-b border-border bg-white">
      {hasImages ? (
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: hasMultipleImages }}
          className="h-full w-full"
        >
          <CarouselContent className="ml-0 h-full">
            {allImages.map((url, index) => {
              const hasDarkBackground = hasDarkBackgroundImage(url);
              const isReducedImage = hasDarkBackground;

              return (
                <CarouselItem key={`${url}-${index}`} className="h-full pl-0">
                  <div
                    className={`flex h-full w-full items-center justify-center ${
                      hasDarkBackground ? "bg-[#1a1a1a]" : "bg-white"
                    } ${
                      isReducedImage ? "p-4" : "p-1"
                    }`}
                  >
                    <img
                      src={url}
                      alt={name}
                      className={`h-full w-full object-contain object-center transition-transform duration-300 ${
                        isReducedImage
                          ? "group-hover/image:scale-100 max-h-[88%] max-w-[88%]"
                          : "group-hover/image:scale-[1.02]"
                      }`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#555] font-mono text-xs">
          No photo
        </div>
      )}

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-100 transition-opacity hover:bg-black/75 md:opacity-0 md:group-hover/image:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-100 transition-opacity hover:bg-black/75 md:opacity-0 md:group-hover/image:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-black/55 text-[10px] text-white font-mono">
            {activeIndex + 1} / {allImages.length}
          </div>
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1 px-10">
            {allImages.map((url, index) => (
              <button
                key={`${url}-dot-${index}`}
                type="button"
                onClick={(event) => showSlide(event, index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
