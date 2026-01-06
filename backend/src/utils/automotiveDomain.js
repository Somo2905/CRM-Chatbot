// Automotive retail domain utilities for context enrichment and normalization

// Common automotive metadata fields
const AUTOMOTIVE_FIELDS = {
  DEALER_ID: 'dealer_id',
  DEALERSHIP_NAME: 'dealership_name',
  VIN: 'vin',
  MAKE: 'make',
  MODEL: 'model',
  YEAR: 'year',
  SERVICE_ID: 'service_id',
  CUSTOMER_ID: 'customer_id',
  SERVICE_TYPE: 'service_type', // maintenance, repair, inspection, etc
  MILEAGE: 'mileage',
  STATUS: 'status', // open, closed, scheduled, completed
};

function enrichContextWithAutomotiveFilter(metadata, filter = {}) {
  // e.g. { make: 'Tesla', year: 2024 } -> only retrieve docs for Tesla 2024
  const enriched = { ...metadata };
  if (filter.make) enriched.make = filter.make;
  if (filter.model) enriched.model = filter.model;
  if (filter.year) enriched.year = filter.year;
  if (filter.dealer_id) enriched.dealer_id = filter.dealer_id;
  if (filter.service_type) enriched.service_type = filter.service_type;
  return enriched;
}

function buildAutomotiveSystemPrompt(context = {}) {
  const dealer = context.dealership_name || 'our dealership';
  const prompt = `You are a knowledgeable automotive customer service assistant for ${dealer}. 
You help customers with:
- Vehicle information (specs, features, maintenance, recalls)
- Service requests and scheduling
- Warranty information
- Financing and trade-in options
- Parts and accessories
- Owner manuals and documentation

Always reference specific document sources and cite VINs, service IDs, or customer info when relevant.
Be professional, helpful, and domain-aware.`;
  return prompt;
}

module.exports = {
  AUTOMOTIVE_FIELDS,
  enrichContextWithAutomotiveFilter,
  buildAutomotiveSystemPrompt,
};
