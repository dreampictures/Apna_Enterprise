import { Helmet } from "react-helmet-async";

const SITE_NAME = "Apna Enterprise";
const BASE_URL = "https://apnaenterprise.in";
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

interface SeoProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

export default function Seo({
  title,
  description,
  keywords,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
}: SeoProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
