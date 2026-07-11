import { Helmet } from "react-helmet-async";

const SITE_NAME = "Apna Enterprise";
const BASE_URL = "https://apnaenterprise.in";
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

interface SeoProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  canonicalOverride?: string;
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

export default function Seo({
  title,
  description,
  keywords,
  path = "/",
  canonicalOverride,
  image = DEFAULT_IMAGE,
  ogTitle,
  ogDescription,
  noindex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = canonicalOverride || `${BASE_URL}${path}`;
  const resolvedOgTitle = ogTitle ? `${ogTitle} | ${SITE_NAME}` : fullTitle;
  const resolvedOgDesc = ogDescription || description;

  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={image} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
