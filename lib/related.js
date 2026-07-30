import { getAllPublications } from "./publications";

export function getRelatedPublications(currentPub, limit = 3) {
  const all = getAllPublications().filter(
    (p) => !(p.type === currentPub.type && p.slug === currentPub.slug)
  );

  const scored = all.map((pub) => {
    let score = 0;

    // Explicit related match
    if (currentPub.related?.includes(pub.slug)) {
      score += 10;
    }

    // Shared tags
    const sharedTags = pub.tags.filter((t) => currentPub.tags?.includes(t));
    score += sharedTags.length * 2;

    // Shared domain
    if (pub.domain === currentPub.domain) {
      score += 1;
    }

    return { pub, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.pub);
}
