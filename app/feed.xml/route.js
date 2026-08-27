import { getAllPublications } from "@/lib/publications";

export async function GET() {
  const pubs = getAllPublications();
  const siteUrl = "https://nicocipher.dev";
  const now = new Date().toUTCString();

  const items = pubs.map((p) => {
    const url = `${siteUrl}/publications/${p.type}/${p.slug}`;
    return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.summary || ""}]]></description>
      <category>${p.type}</category>
    </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NICOCIPHER — Engineering Portfolio</title>
    <link>${siteUrl}</link>
    <description>Evidence-backed engineering publications across cybersecurity, infrastructure, networking, and software engineering.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
