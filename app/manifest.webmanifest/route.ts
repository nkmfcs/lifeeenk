export function GET() {
  return Response.json(
    {
      name: "LifeOS",
      short_name: "LifeOS",
      start_url: "/",
      display: "standalone",
      background_color: "#0F1114",
      theme_color: "#0F1114",
      lang: "ru",
      icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
