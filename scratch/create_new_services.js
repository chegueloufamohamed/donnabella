const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STORE_DOMAIN = 'fzxn09-gw.myshopify.com';
const SCRATCH_DIR = '/Users/naeladvertising/.gemini/antigravity/brain/1da68a82-84f6-4874-8d97-f962079f4a93/scratch';

const queryFile = path.join(SCRATCH_DIR, 'create_product_query.graphql');
const variablesFile = path.join(SCRATCH_DIR, 'create_product_vars.json');

// GraphQL Mutation using productSet
const mutationQuery = `
mutation productSet($input: ProductSetInput!) {
  productSet(input: $input) {
    product {
      id
      title
      variants(first: 50) {
        edges {
          node {
            id
            title
            price
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

fs.writeFileSync(queryFile, mutationQuery, 'utf8');

const servicesToCreate = [
  {
    id: "gid://shopify/Product/8675585228937", // Existing Women's Massage
    title: "Women's Massage",
    descriptionHtml: "Relax, rebalance, renew.",
    productType: "Service",
    tags: ["Women", "Massage"],
    options: ["Style"],
    variants: [
      { price: "300.00", options: ["Aromatherapy"] },
      { price: "375.00", options: ["Deep Tissue"] },
      { price: "350.00", options: ["Madero Slimming"] },
      { price: "375.00", options: ["Lymphatic"] },
      { price: "300.00", options: ["Balinese"] },
      { price: "300.00", options: ["Thai Massage"] },
      { price: "415.00", options: ["Soothing Massage with Lava Shells"] },
      { price: "350.00", options: ["Hot Stone"] },
      { price: "165.00", options: ["Back & Shoulder"] },
      { price: "150.00", options: ["Head & Shoulder"] },
      { price: "150.00", options: ["Foot"] }
    ]
  },
  {
    id: "gid://shopify/Product/8675585425545", // Existing Couples Massage
    title: "Couples Massage",
    descriptionHtml: "A side-by-side massage for two — release tension and restore calm, together.",
    productType: "Service",
    tags: ["Couples", "Massage"],
    options: ["Style"],
    variants: [
      { price: "550.00", options: ["Couple Massage"] },
      { price: "700.00", options: ["Couple Deep Tissue"] },
      { price: "550.00", options: ["Couple Swedish"] }
    ]
  },
  {
    id: "gid://shopify/Product/8675585032329", // Existing Women's Waxing
    title: "Women's Waxing",
    descriptionHtml: "Gentle, beautifully smooth skin.",
    productType: "Service",
    tags: ["Women", "Waxing"],
    options: ["Area"],
    variants: [
      { price: "85.00", options: ["Full Arm"] },
      { price: "60.00", options: ["Half Arm"] },
      { price: "45.00", options: ["Under Arm"] },
      { price: "50.00", options: ["Bikini Line"] },
      { price: "75.00", options: ["Brazilian"] },
      { price: "400.00", options: ["Full Body"] },
      { price: "50.00", options: ["Half Leg"] },
      { price: "100.00", options: ["Full Leg"] },
      { price: "120.00", options: ["Full Face with Eyebrow Thread"] },
      { price: "35.00", options: ["Upper Lip"] },
      { price: "100.00", options: ["Full Face Thread"] }
    ]
  },
  {
    // New Product Women's Eyelashes
    title: "Women's Eyelashes",
    descriptionHtml: "Lash & Brow Enhancements at Home.",
    productType: "Service",
    tags: ["Women", "Eyelashes"],
    options: ["Style"],
    variants: [
      { price: "400.00", options: ["Hybrid"] },
      { price: "250.00", options: ["Eyelashes Classic"] },
      { price: "75.00", options: ["Eyebrow Tinting"] }
    ]
  }
];

const results = [];

async function run() {
  console.log(`Starting update/creation of ${servicesToCreate.length} products...`);
  
  for (let i = 0; i < servicesToCreate.length; i++) {
    const s = servicesToCreate[i];
    console.log(`\nProcessing [${i+1}/${servicesToCreate.length}] Product: "${s.title}"...`);
    
    // Construct variables for productSet input
    const productOptions = s.options.map(optionName => {
      const valuesSet = new Set();
      s.variants.forEach(v => {
        if (v.options && v.options[0]) {
          valuesSet.add(v.options[0]);
        }
      });
      return {
        name: optionName,
        values: Array.from(valuesSet).map(val => ({ name: val }))
      };
    });

    const variants = s.variants.map(v => {
      return {
        price: v.price,
        optionValues: s.options.map((optionName, optIndex) => {
          return {
            optionName: optionName,
            name: v.options[optIndex]
          };
        })
      };
    });
    
    const variables = {
      input: {
        title: s.title,
        descriptionHtml: s.descriptionHtml,
        productType: s.productType,
        tags: s.tags,
        productOptions: productOptions,
        variants: variants
      }
    };
    
    if (s.id) {
      variables.input.id = s.id;
    }
    
    fs.writeFileSync(variablesFile, JSON.stringify(variables), 'utf8');
    
    try {
      const cmd = `shopify store execute --store "${STORE_DOMAIN}" --allow-mutations --query-file "${queryFile}" --variable-file "${variablesFile}" --json`;
      const output = execSync(cmd, { encoding: 'utf8' });
      const parsed = JSON.parse(output);
      
      if (parsed.productSet && parsed.productSet.userErrors && parsed.productSet.userErrors.length > 0) {
        console.error(`  Error:`, parsed.productSet.userErrors);
        results.push({ title: s.title, status: 'FAILED', errors: parsed.productSet.userErrors });
      } else if (parsed.productSet && parsed.productSet.product) {
        const prod = parsed.productSet.product;
        const variantsList = prod.variants.edges.map(edge => ({
          title: edge.node.title,
          price: edge.node.price,
          id: edge.node.id.split('/').pop() // Get just the numeric ID
        }));
        
        console.log(`  Success! ID: ${prod.id}`);
        variantsList.forEach(v => {
          console.log(`    - Variant "${v.title}": ${v.id} (AED ${v.price})`);
        });
        
        results.push({
          title: s.title,
          status: 'SUCCESS',
          productId: prod.id,
          variants: variantsList
        });
      } else {
        console.error(`  Unexpected response:`, parsed);
        results.push({ title: s.title, status: 'FAILED', errors: ['Unexpected format'] });
      }
    } catch (err) {
      console.error(`  Execution error:`, err.message);
      results.push({ title: s.title, status: 'FAILED', errors: [err.message] });
    }
  }
  
  fs.writeFileSync(path.join(SCRATCH_DIR, 'new_services_report.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('\n--- FINISHED ---');
  console.log(`Report saved to: ${path.join(SCRATCH_DIR, 'new_services_report.json')}`);
}

run();
