import Image from "next/image";

const GALLERY = [
  {
    src: "/stadium-dusk.jpg",
    alt: "Stadium exterior at dusk",
    accent: "turf" as const,
  },
  {
    src: "/action-tackle.jpg",
    alt: "Football action mid-play",
    accent: "gold" as const,
  },
  {
    src: "/park-football.jpg",
    alt: "Casual football practice",
    accent: "turf" as const,
  },
  {
    src: "/fantasy-trophy.jpg",
    alt: "Football and championship trophy",
    accent: "gold" as const,
  },
];

export default function ActionGallery() {
  return (
    <section className="border-t border-panel-border bg-night/60">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GALLERY.map((item) => (
            <div
              key={item.src}
              className={`group relative aspect-[3/4] overflow-hidden border border-panel-border transition-colors duration-150 ${
                item.accent === "turf"
                  ? "hover:border-turf/50"
                  : "hover:border-gold/50"
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover grayscale transition-transform duration-500 group-hover:scale-105"
              />
              {/* Duotone via mix-blend-mode: color, keeps real photos in the brand palette */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 mix-blend-color ${
                  item.accent === "turf"
                    ? "photo-duotone-turf"
                    : "photo-duotone-gold"
                }`}
              />
              <div
                aria-hidden
                className="photo-scrim pointer-events-none absolute inset-0"
              />
            </div>
          ))}
        </div>

        {/* Headline laid across the strip like a broadcast lower-third.
            pointer-events-none so the photos keep their hover treatment.
            theme-dark keeps the type light in both site themes — these photos
            are dark whichever way the page is flipped. */}
        <div className="theme-dark pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div aria-hidden className="gallery-band absolute inset-x-0 -inset-y-12" />
          <h2 className="relative whitespace-nowrap px-4 text-center font-display text-[13px] font-bold tracking-tight text-pop sm:px-6 sm:text-2xl md:text-3xl lg:text-4xl">
            Sports are fun.{" "}
            <span className="text-gold">Coding should be too.</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
