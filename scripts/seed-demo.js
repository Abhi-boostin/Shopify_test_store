#!/usr/bin/env node

/**
 * Seed demo products to Shopify store
 * 
 * Usage:
 *   node scripts/seed-demo.js
 * 
 * Requirements:
 *   - DEMO_ADMIN_SECRET set in .env.local
 *   - Server running at http://localhost:3000 (or set SERVER_URL env var)
 *   - CSV file at data/shopify_demo_products.csv
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const DEMO_ADMIN_SECRET = process.env.DEMO_ADMIN_SECRET;
const CSV_PATH = path.join(__dirname, '..', 'data', 'shopify_demo_products.csv');

if (!DEMO_ADMIN_SECRET) {
  console.error('❌ Error: DEMO_ADMIN_SECRET not found in environment');
  console.error('Make sure .env.local exists and contains DEMO_ADMIN_SECRET');
  process.exit(1);
}

if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ Error: CSV file not found at ${CSV_PATH}`);
  console.error('Make sure data/shopify_demo_products.csv exists');
  process.exit(1);
}

async function createProduct(productData) {
  try {
    const response = await fetch(`${SERVER_URL}/api/admin/create-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-admin-secret': DEMO_ADMIN_SECRET,
      },
      body: JSON.stringify({ product: productData }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    return result.product;
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

async function seedProducts() {
  console.log('🌱 Starting product seeding...\n');
  console.log(`Server: ${SERVER_URL}`);
  console.log(`CSV: ${CSV_PATH}\n`);

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = [];
  let lineNumber = 0;
  let created = 0;
  let failed = 0;

  for await (const line of rl) {
    lineNumber++;

    if (lineNumber === 1) {
      headers = parseCSVLine(line);
      console.log('CSV Headers:', headers.join(', '));
      console.log('');
      continue;
    }

    const values = parseCSVLine(line);
    
    if (values.length < headers.length) {
      console.log(`⚠️  Skipping line ${lineNumber}: incomplete data`);
      continue;
    }

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });

    // Build product object
    const product = {
      title: row['Title'] || `Product ${lineNumber}`,
      body_html: row['Body (HTML)'] || '',
      vendor: row['Vendor'] || 'Demo Store',
      product_type: row['Type'] || 'General',
      tags: row['Tags'] || '',
      status: row['Status'] || 'active',
      variants: [
        {
          option1: row['Option1 Value'] || 'Default',
          price: row['Variant Price'] || '0.00',
          sku: row['Variant SKU'] || '',
          inventory_quantity: parseInt(row['Variant Inventory Qty'] || '10'),
        },
      ],
    };

    if (row['Option1 Name']) {
      product.options = [{ name: row['Option1 Name'], values: [row['Option1 Value']] }];
    }

    if (row['Image Src']) {
      product.images = [{ src: row['Image Src'] }];
    }

    try {
      const created_product = await createProduct(product);
      console.log(`✅ Created: ${product.title} (ID: ${created_product.id})`);
      created++;
    } catch (error) {
      console.error(`❌ Failed: ${product.title} - ${error.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Seeding complete!');
  console.log(`✅ Created: ${created}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${lineNumber - 1}`);
}

// Run seeding
seedProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
