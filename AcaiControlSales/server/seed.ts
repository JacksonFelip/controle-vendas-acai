import { db } from "./db";
import { products, vendors } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed products
  const defaultProducts = [
    { name: "Açaí 500ml", type: "acai-500ml", price: "8.50", pricePerLiter: null },
    { name: "Açaí 1L", type: "acai-1000ml", price: "15.00", pricePerLiter: null },
    { name: "Açaí Personalizado", type: "acai-custom", price: "0.00", pricePerLiter: "14.00" },
    { name: "Farinha de Tapioca", type: "tapioca-flour", price: "4.50", pricePerLiter: null },
    { name: "Farinha de Mandioca", type: "cassava-flour", price: "3.80", pricePerLiter: null },
  ];

  await db.insert(products).values(defaultProducts).onConflictDoNothing();

  // Seed vendors
  const defaultVendors = [
    { name: "Maria Silva", commissionRate: "0.1000" },
    { name: "João Santos", commissionRate: "0.0800" },
    { name: "Ana Costa", commissionRate: "0.1200" },
  ];

  await db.insert(vendors).values(defaultVendors).onConflictDoNothing();

  console.log("Database seeded successfully!");
}

seed().catch(console.error);