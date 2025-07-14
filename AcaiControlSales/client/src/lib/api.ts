import { apiRequest } from "./queryClient";
import type { 
  Product, 
  Vendor, 
  SaleWithItems, 
  DailyStats, 
  VendorStats, 
  CashFlowEntry,
  InsertProduct,
  InsertVendor,
  InsertSale,
  InsertSaleItem,
  InsertCashFlowEntry
} from "@shared/schema";

// Products API
export const productApi = {
  getAll: (): Promise<Product[]> =>
    fetch("/api/products").then(res => res.json()),
  
  getById: (id: number): Promise<Product> =>
    fetch(`/api/products/${id}`).then(res => res.json()),
  
  create: async (product: InsertProduct): Promise<Product> => {
    const res = await apiRequest("POST", "/api/products", product);
    return res.json();
  },
  
  update: async (id: number, product: Partial<InsertProduct>): Promise<Product> => {
    const res = await apiRequest("PATCH", `/api/products/${id}`, product);
    return res.json();
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/products/${id}`);
  },
};

// Vendors API
export const vendorApi = {
  getAll: (): Promise<Vendor[]> =>
    fetch("/api/vendors").then(res => res.json()),
  
  getById: (id: number): Promise<Vendor> =>
    fetch(`/api/vendors/${id}`).then(res => res.json()),
  
  create: async (vendor: InsertVendor): Promise<Vendor> => {
    const res = await apiRequest("POST", "/api/vendors", vendor);
    return res.json();
  },
  
  update: async (id: number, vendor: Partial<InsertVendor>): Promise<Vendor> => {
    const res = await apiRequest("PATCH", `/api/vendors/${id}`, vendor);
    return res.json();
  },
  
  delete: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/vendors/${id}`);
  },
};

// Sales API
export const salesApi = {
  getAll: (startDate?: Date, endDate?: Date): Promise<SaleWithItems[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    
    const url = `/api/sales${params.toString() ? `?${params.toString()}` : ""}`;
    return fetch(url).then(res => res.json());
  },
  
  getById: (id: number): Promise<SaleWithItems> =>
    fetch(`/api/sales/${id}`).then(res => res.json()),
  
  create: async (sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithItems> => {
    const res = await apiRequest("POST", "/api/sales", { sale, items });
    return res.json();
  },
};

// Reports API
export const reportsApi = {
  getDailyStats: (date?: Date): Promise<DailyStats> => {
    const params = new URLSearchParams();
    if (date) params.append("date", date.toISOString());
    
    const url = `/api/reports/daily-stats${params.toString() ? `?${params.toString()}` : ""}`;
    return fetch(url).then(res => res.json());
  },
  
  getVendorStats: (startDate?: Date, endDate?: Date): Promise<VendorStats[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    
    const url = `/api/reports/vendor-stats${params.toString() ? `?${params.toString()}` : ""}`;
    return fetch(url).then(res => res.json());
  },
};

// Cash Flow API
export const cashFlowApi = {
  getAll: (startDate?: Date, endDate?: Date): Promise<CashFlowEntry[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    
    const url = `/api/cashflow${params.toString() ? `?${params.toString()}` : ""}`;
    return fetch(url).then(res => res.json());
  },
  
  create: async (entry: InsertCashFlowEntry): Promise<CashFlowEntry> => {
    const res = await apiRequest("POST", "/api/cashflow", entry);
    return res.json();
  },
};
