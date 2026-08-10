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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
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
                className="pointer-events-none absolute inset-0 mix-blend-color"
                style={{
                  backgroundColor: item.accent === "turf" ? "#3FD973" : "#F2C94C",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-night/35"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
