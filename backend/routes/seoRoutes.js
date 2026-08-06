import express from 'express';
import Property from '../models/Property.js';

const router = express.Router();

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: https://housynest.com/api/seo/sitemap.xml`);
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const properties = await Property.find({}).select('_id updatedAt');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://housynest.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://housynest.com/properties</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://housynest.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://housynest.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    properties.forEach(property => {
      xml += `
  <url>
    <loc>https://housynest.com/property/${property._id}</loc>
    <lastmod>${property.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
