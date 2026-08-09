import { getAllPublications } from "@/lib/publications";

const BASE_URL = "https://nicocipher.dev";

export default function sitemap() {
  const publications = getAllPublications();

  const publicationEntries = publications.map((pub) => ({
    url: `${BASE_URL}/publications/${pub.type}/${pub.slug}`,
    lastModified: pub.date || new Date().toISOString().split("T")[0],
    changeFrequency: pub.status === "active" ? "weekly" : "monthly",
    priority: pub.featured ? 0.8 : 0.6,
  }));

  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/publications`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/systems`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [...staticPages, ...publicationEntries];
}
