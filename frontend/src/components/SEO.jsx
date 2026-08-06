import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, type = 'website', image = '/src/assets/logo.png', url = window.location.href }) => {
  const siteName = 'Housynest';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Housynest - The modern way to rent and manage properties.'} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
