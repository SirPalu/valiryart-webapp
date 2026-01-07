import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const SEOHead = ({
  title = "ValiryArt - Creazioni Artigianali Personalizzate",
  description = "Creazioni artigianali personalizzate: incisioni su legno a mano con pirografo, torte scenografiche e allestimenti eventi a Roma. Ogni opera è unica.",
  keywords = "incisioni legno, pirografia, torte decorative, allestimenti eventi, creazioni artigianali, regali personalizzati, Roma",
  image = "/logo.png",
  url = "https://www.valiryart.com",
  type = "website",
  author = "Valeria - ValiryArt",
  noindex = false
}) => {
  const fullTitle = title.includes('ValiryArt') ? title : `${title} | ValiryArt`;
  const fullUrl = url.startsWith('http') ? url : `https://www.valiryart.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://www.valiryart.com${image}`;

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Meta Tags Base */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="ValiryArt" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
};

// Provider component per wrappare l'app
export const SEOProvider = ({ children }) => {
  return <HelmetProvider>{children}</HelmetProvider>;
};

export default SEOHead;