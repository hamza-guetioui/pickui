import { AUTHOR, REPO_URL, SITE_NAME, SITE_URL } from "./site";

/** Renders a JSON-LD <script>. `<` is escaped so data can never close the tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}

export const author = { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url };

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/components`,
  description: "Free, hand-crafted React + Tailwind components with physics, 3D and tactile detail.",
  inLanguage: "en",
  author,
  publisher: author,
  sameAs: [REPO_URL],
};
