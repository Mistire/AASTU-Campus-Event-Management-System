import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AASTU Campus Event Management System",
    short_name: "CEMS",
    description:
      "Discover, organize, and participate in campus events at Addis Ababa Science and Technology University.",
    start_url: "/discovery",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f172a",
    theme_color: "#38bdf8",
    categories: ["education", "social", "productivity"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      // 192 maskable – used by Android adaptive icons
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      // 192 any – standard icon
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      // 512 any – splash/install prompt
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // 512 maskable – used in modern Android launchers
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // screenshots: [] — add your own later:
    //   1. Drop desktop.png (1280×800) and mobile.png (390×844) into public/screenshots/
    //   2. Uncomment and fill in the screenshots array below
    shortcuts: [
      {
        name: "Browse Events",
        short_name: "Events",
        description: "Discover upcoming campus events",
        url: "/discovery",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My Events",
        short_name: "My Events",
        description: "View your registered events",
        url: "/my-events",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Manage events and users",
        url: "/dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
