import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'acai-500ml', 'acai-1000ml', 'acai-custom', 'tapioca-flour', 'cassava-flour'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }), // for custom açaí
  active: boolean("active").default(true).notNull(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(), // e.g., 0.1000 for 10%
  active: boolean("active").default(true).notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'pix', 'transfer'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const cashFlowEntries = pgTable("cash_flow_entries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'income', 'expense'
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  saleId: integer("sale_id").references(() => sales.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [sales.vendorId],
    references: [vendors.id],
  }),
  items: many(saleItems),
  cashFlowEntry: one(cashFlowEntries, {
    fields: [sales.id],
    references: [cashFlowEntries.saleId],
  }),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  saleItems: many(saleItems),
}));

export const cashFlowEntriesRelations = relations(cashFlowEntries, ({ one }) => ({
  sale: one(sales, {
    fields: [cashFlowEntries.saleId],
    references: [sales.id],
  }),
}));

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, active: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, active: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export const insertSaleItemSchema = createInsertSchema(saleItems).omit({ id: true });
export const insertCashFlowEntrySchema = createInsertSchema(cashFlowEntries).omit({ id: true, createdAt: true });

// Types
export type Product = typeof products.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type CashFlowEntry = typeof cashFlowEntries.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type InsertCashFlowEntry = z.infer<typeof insertCashFlowEntrySchema>;

// Extended types for API responses
export type SaleWithItems = Sale & {
  vendor: Vendor;
  items: (SaleItem & { product: Product })[];
};

export type DailyStats = {
  totalSales: number;
  totalRevenue: string;
  totalCommissions: string;
  topVendor: string;
  topProduct: string;
};

export type VendorStats = {
  vendorId: number;
  vendorName: string;
  totalSales: number;
  totalRevenue: string;
  totalCommissions: string;
};
