export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/workspace",
    },
    sitemap: "https://nicocipher.dev/sitemap.xml",
  };
}
