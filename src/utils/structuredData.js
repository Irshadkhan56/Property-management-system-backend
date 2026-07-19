const generatePropertySchema = (property, baseUrl = '') => {
  if (!property) return null;

  const url = baseUrl ? `${baseUrl}/properties/${property.slug}` : `/properties/${property.slug}`;
  
  // Determine standard schema.org type
  let schemaType = 'SingleFamilyResidence';
  const propType = property.propertyType ? property.propertyType.toLowerCase() : '';
  
  if (propType.includes('flat') || propType.includes('apartment')) {
    schemaType = 'Apartment';
  } else if (propType.includes('plot') || propType.includes('land') || propType.includes('commercial')) {
    schemaType = 'Landform';
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    'name': property.title,
    'description': property.description,
    'url': url,
    'image': property.featuredImage || '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': property.address,
      'addressLocality': property.area,
      'addressRegion': property.city,
      'addressCountry': 'PK',
    },
    'floorSize': {
      '@type': 'QuantitativeValue',
      'value': property.areaSize,
      'unitText': property.areaUnit,
    }
  };

  // Add room details if applicable
  if (property.bedrooms && property.bedrooms > 0) {
    schema.numberOfBedrooms = property.bedrooms;
  }
  if (property.bathrooms && property.bathrooms > 0) {
    schema.numberOfBathrooms = property.bathrooms;
  }

  // Add pricing offer metadata
  schema.offers = {
    '@type': 'Offer',
    'price': property.price,
    'priceCurrency': 'PKR',
    'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days validation
    'availability': property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    'businessFunction': property.category === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
  };

  return schema;
};

module.exports = {
  generatePropertySchema,
};
