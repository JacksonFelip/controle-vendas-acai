import {
  products,
  vendors,
  sales,
  saleItems,
  cashFlowEntries,
  type Product,
  type Vendor,
  type Sale,
  type SaleItem,
  type CashFlowEntry,
  type InsertProduct,
  type InsertVendor,
  type InsertSale,
  type InsertSaleItem,
  type InsertCashFlowEntry,
  type SaleWithItems,
  type DailyStats,
  type VendorStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Sales
  getSales(startDate?: Date, endDate?: Date): Promise<SaleWithItems[]>;
  getSale(id: number): Promise<SaleWithItems | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems>;

  // Reports
  getDailyStats(date?: Date): Promise<DailyStats>;
  getVendorStats(startDate?: Date, endDate?: Date): Promise<VendorStats[]>;

  // Cash Flow
  getCashFlowEntries(startDate?: Date, endDate?: Date): Promise<CashFlowEntry[]>;
  createCashFlowEntry(entry: InsertCashFlowEntry): Promise<CashFlowEntry>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private vendors: Map<number, Vendor> = new Map();
  private sales: Map<number, Sale> = new Map();
  private saleItems: Map<number, SaleItem> = new Map();
  private cashFlowEntries: Map<number, CashFlowEntry> = new Map();
  
  private currentProductId = 1;
  private currentVendorId = 1;
  private currentSaleId = 1;
  private currentSaleItemId = 1;
  private currentCashFlowId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed products
    const defaultProducts: InsertProduct[] = [
      { name: "Açaí 500ml", type: "acai-500ml", price: "8.50", pricePerLiter: null },
      { name: "Açaí 1L", type: "acai-1000ml", price: "15.00", pricePerLiter: null },
      { name: "Açaí Personalizado", type: "acai-custom", price: "0.00", pricePerLiter: "14.00" },
      { name: "Farinha de Tapioca", type: "tapioca-flour", price: "4.50", pricePerLiter: null },
      { name: "Farinha de Mandioca", type: "cassava-flour", price: "3.80", pricePerLiter: null },
    ];

    defaultProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { 
        ...product, 
        id, 
        active: true,
        pricePerLiter: product.pricePerLiter || null 
      });
    });

    // Seed vendors
    const defaultVendors: InsertVendor[] = [
      { name: "Maria Silva", commissionRate: "0.1000" },
      { name: "João Santos", commissionRate: "0.0800" },
      { name: "Ana Costa", commissionRate: "0.1200" },
    ];

    defaultVendors.forEach(vendor => {
      const id = this.currentVendorId++;
      this.vendors.set(id, { ...vendor, id, active: true });
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.active);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      active: true,
      pricePerLiter: product.pricePerLiter || null 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const existing = this.products.get(id);
    if (!existing) return false;
    
    existing.active = false;
    this.products.set(id, existing);
    return true;
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(v => v.active);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const newVendor: Vendor = { ...vendor, id, active: true };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existing = this.vendors.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...vendor };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const existing = this.vendors.get(id);
    if (!existing) return false;
    
    existing.active = false;
    this.vendors.set(id, existing);
    return true;
  }

  // Sales
  async getSales(startDate?: Date, endDate?: Date): Promise<SaleWithItems[]> {
    const salesArray = Array.from(this.sales.values());
    let filteredSales = salesArray;

    if (startDate || endDate) {
      filteredSales = salesArray.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        if (startDate && saleDate < startDate) return false;
        if (endDate && saleDate > endDate) return false;
        return true;
      });
    }

    return filteredSales.map(sale => this.populateSaleWithItems(sale));
  }

  async getSale(id: number): Promise<SaleWithItems | undefined> {
    const sale = this.sales.get(id);
    if (!sale) return undefined;
    return this.populateSaleWithItems(sale);
  }

  private populateSaleWithItems(sale: Sale): SaleWithItems {
    const vendor = this.vendors.get(sale.vendorId)!;
    const items = Array.from(this.saleItems.values())
      .filter(item => item.saleId === sale.id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId)!,
      }));

    return { ...sale, vendor, items };
  }

  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> {
    const saleId = this.currentSaleId++;
    const newSale: Sale = {
      ...sale,
      id: saleId,
      createdAt: new Date(),
    };
    
    this.sales.set(saleId, newSale);

    // Create sale items
    items.forEach(item => {
      const itemId = this.currentSaleItemId++;
      const newItem: SaleItem = { ...item, id: itemId, saleId };
      this.saleItems.set(itemId, newItem);
    });

    // Create cash flow entry for the sale
    const cashFlowId = this.currentCashFlowId++;
    const cashFlowEntry: CashFlowEntry = {
      id: cashFlowId,
      type: "income",
      description: `Venda #${saleId}`,
      amount: sale.total,
      saleId,
      createdAt: new Date(),
    };
    this.cashFlowEntries.set(cashFlowId, cashFlowEntry);

    return this.populateSaleWithItems(newSale);
  }

  // Reports
  async getDailyStats(date?: Date): Promise<DailyStats> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailySales = Array.from(this.sales.values()).filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startOfDay && saleDate <= endOfDay;
    });

    const totalSales = dailySales.length;
    const totalRevenue = dailySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalCommissions = dailySales.reduce((sum, sale) => sum + parseFloat(sale.commission), 0);

    // Find top vendor
    const vendorSales = new Map<number, number>();
    dailySales.forEach(sale => {
      vendorSales.set(sale.vendorId, (vendorSales.get(sale.vendorId) || 0) + 1);
    });
    
    let topVendorId = 0;
    let maxSales = 0;
    vendorSales.forEach((sales, vendorId) => {
      if (sales > maxSales) {
        maxSales = sales;
        topVendorId = vendorId;
      }
    });

    const topVendor = topVendorId ? this.vendors.get(topVendorId)?.name || "N/A" : "N/A";

    // Find top product
    const productSales = new Map<number, number>();
    dailySales.forEach(sale => {
      const items = Array.from(this.saleItems.values()).filter(item => item.saleId === sale.id);
      items.forEach(item => {
        productSales.set(item.productId, (productSales.get(item.productId) || 0) + parseFloat(item.quantity));
      });
    });

    let topProductId = 0;
    let maxQuantity = 0;
    productSales.forEach((quantity, productId) => {
      if (quantity > maxQuantity) {
        maxQuantity = quantity;
        topProductId = productId;
      }
    });

    const topProduct = topProductId ? this.products.get(topProductId)?.name || "N/A" : "N/A";

    return {
      totalSales,
      totalRevenue: totalRevenue.toFixed(2),
      totalCommissions: totalCommissions.toFixed(2),
      topVendor,
      topProduct,
    };
  }

  async getVendorStats(startDate?: Date, endDate?: Date): Promise<VendorStats[]> {
    const salesInPeriod = await this.getSales(startDate, endDate);
    const vendorStatsMap = new Map<number, VendorStats>();

    salesInPeriod.forEach(sale => {
      const existing = vendorStatsMap.get(sale.vendorId);
      if (existing) {
        existing.totalSales += 1;
        existing.totalRevenue = (parseFloat(existing.totalRevenue) + parseFloat(sale.total)).toFixed(2);
        existing.totalCommissions = (parseFloat(existing.totalCommissions) + parseFloat(sale.commission)).toFixed(2);
      } else {
        vendorStatsMap.set(sale.vendorId, {
          vendorId: sale.vendorId,
          vendorName: sale.vendor.name,
          totalSales: 1,
          totalRevenue: sale.total,
          totalCommissions: sale.commission,
        });
      }
    });

    return Array.from(vendorStatsMap.values());
  }

  // Cash Flow
  async getCashFlowEntries(startDate?: Date, endDate?: Date): Promise<CashFlowEntry[]> {
    const entries = Array.from(this.cashFlowEntries.values());
    
    if (!startDate && !endDate) return entries;

    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    });
  }

  async createCashFlowEntry(entry: InsertCashFlowEntry): Promise<CashFlowEntry> {
    const id = this.currentCashFlowId++;
    const newEntry: CashFlowEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      saleId: entry.saleId || null,
    };
    this.cashFlowEntries.set(id, newEntry);
    return newEntry;
  }
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.active, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ active: false })
      .where(eq(products.id, id))
      .returning();
    return result.length > 0;
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.active, true));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db
      .insert(vendors)
      .values(vendor)
      .returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db
      .update(vendors)
      .set({ active: false })
      .where(eq(vendors.id, id))
      .returning();
    return result.length > 0;
  }

  async getSales(startDate?: Date, endDate?: Date): Promise<SaleWithItems[]> {
    let query = db
      .select()
      .from(sales)
      .leftJoin(vendors, eq(sales.vendorId, vendors.id))
      .orderBy(desc(sales.createdAt));

    if (startDate && endDate) {
      query = query.where(and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      )) as any;
    } else if (startDate) {
      query = query.where(gte(sales.createdAt, startDate)) as any;
    } else if (endDate) {
      query = query.where(lte(sales.createdAt, endDate)) as any;
    }

    const salesWithVendors = await query;
    
    const salesWithItems: SaleWithItems[] = [];
    
    for (const saleWithVendor of salesWithVendors) {
      const sale = saleWithVendor.sales;
      const vendor = saleWithVendor.vendors!;
      
      const items = await db
        .select()
        .from(saleItems)
        .leftJoin(products, eq(saleItems.productId, products.id))
        .where(eq(saleItems.saleId, sale.id));
      
      salesWithItems.push({
        ...sale,
        vendor,
        items: items.map(item => ({
          ...item.sale_items,
          product: item.products!
        }))
      });
    }
    
    return salesWithItems;
  }

  async getSale(id: number): Promise<SaleWithItems | undefined> {
    const [saleWithVendor] = await db
      .select()
      .from(sales)
      .leftJoin(vendors, eq(sales.vendorId, vendors.id))
      .where(eq(sales.id, id));

    if (!saleWithVendor) return undefined;

    const sale = saleWithVendor.sales;
    const vendor = saleWithVendor.vendors!;

    const items = await db
      .select()
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, sale.id));

    return {
      ...sale,
      vendor,
      items: items.map(item => ({
        ...item.sale_items,
        product: item.products!
      }))
    };
  }

  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> {
    const [newSale] = await db
      .insert(sales)
      .values(sale)
      .returning();

    const saleItemsData = items.map(item => ({
      ...item,
      saleId: newSale.id
    }));

    const newSaleItems = await db
      .insert(saleItems)
      .values(saleItemsData)
      .returning();

    // Create cash flow entry
    await db.insert(cashFlowEntries).values({
      type: 'income',
      description: `Venda #${newSale.id}`,
      amount: newSale.total,
      saleId: newSale.id,
    });

    const createdSale = await this.getSale(newSale.id);
    return createdSale!;
  }

  async getDailyStats(date?: Date): Promise<DailyStats> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailySales = await db
      .select()
      .from(sales)
      .where(and(
        gte(sales.createdAt, startOfDay),
        lte(sales.createdAt, endOfDay)
      ));

    const totalSales = dailySales.length;
    const totalRevenue = dailySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalCommissions = dailySales.reduce((sum, sale) => sum + parseFloat(sale.commission), 0);

    // Find top vendor and product (simplified for database version)
    return {
      totalSales,
      totalRevenue: totalRevenue.toFixed(2),
      totalCommissions: totalCommissions.toFixed(2),
      topVendor: "Vendedor Principal", // TODO: Implement proper query
      topProduct: "Açaí 500ml", // TODO: Implement proper query
    };
  }

  async getVendorStats(startDate?: Date, endDate?: Date): Promise<VendorStats[]> {
    let query = db
      .select({
        vendorId: vendors.id,
        vendorName: vendors.name,
        totalSales: count(sales.id),
        totalRevenue: sum(sales.total),
        totalCommissions: sum(sales.commission),
      })
      .from(vendors)
      .leftJoin(sales, eq(vendors.id, sales.vendorId))
      .groupBy(vendors.id);

    if (startDate && endDate) {
      query = query.where(and(
        gte(sales.createdAt, startDate),
        lte(sales.createdAt, endDate)
      )) as any;
    }

    const result = await query;
    
    return result.map(row => ({
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      totalSales: Number(row.totalSales) || 0,
      totalRevenue: (Number(row.totalRevenue) || 0).toFixed(2),
      totalCommissions: (Number(row.totalCommissions) || 0).toFixed(2),
    }));
  }

  async getCashFlowEntries(startDate?: Date, endDate?: Date): Promise<CashFlowEntry[]> {
    let query = db
      .select()
      .from(cashFlowEntries)
      .orderBy(desc(cashFlowEntries.createdAt));

    if (startDate && endDate) {
      query = query.where(and(
        gte(cashFlowEntries.createdAt, startDate),
        lte(cashFlowEntries.createdAt, endDate)
      )) as any;
    }

    return await query;
  }

  async createCashFlowEntry(entry: InsertCashFlowEntry): Promise<CashFlowEntry> {
    const [newEntry] = await db
      .insert(cashFlowEntries)
      .values(entry)
      .returning();
    return newEntry;
  }
}

export const storage = new DatabaseStorage();
