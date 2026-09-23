import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flendly | Who Lends Who?",
    short_name: "Flendly",
    description: "Gen Z-friendly money and peer loan tracker for friends.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#FFE600",
    icons: [
      {
        src: "/brand/flendly-symbol.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/brand/flendly-symbol.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/brand/flendly-symbol.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
