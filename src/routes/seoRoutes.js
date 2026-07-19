const express = require("express");
const Property = require("../models/propertyModel");

const router = express.Router();

// @desc    Health check for deployment
// @route   GET /
// @access  Public
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Property Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// @desc    Generate XML Sitemap dynamically
// @route   GET /sitemap.xml
// @access  Public
router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const properties = await Property.find(
      { status: "available" },
      "slug updatedAt",
    );

    const host = req.get("host");
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add home URL
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add properties listing URL
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/properties</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // Add property detail URLs
    properties.forEach((property) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/properties/${property.slug}</loc>\n`;
      xml += `    <lastmod>${property.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
});

// @desc    Generate Robots.txt dynamically
// @route   GET /robots.txt
// @access  Public
router.get("/robots.txt", (req, res) => {
  const host = req.get("host");
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  let txt = `User-agent: *\n`;
  txt += `Disallow: /api/admin/\n`;
  txt += `Disallow: /api/owners/\n`;
  txt += `Disallow: /api/dashboard/\n`;
  txt += `Allow: /\n\n`;
  txt += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  res.header("Content-Type", "text/plain");
  res.status(200).send(txt);
});

module.exports = router;
