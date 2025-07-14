import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productApi, vendorApi, salesApi, reportsApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProductGrid from "@/components/sales/product-grid";
import ShoppingCart, { type CartItem } from "@/components/sales/shopping-cart";
import CustomQuantityModal from "@/components/sales/custom-quantity-modal";
import RecentTransactions from "@/components/sales/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users } from "lucide-react";
import type { Product, Vendor, InsertSale, InsertSaleItem } from "@shared/schema";

export default function Sales() {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [selectedCustomProduct, setSelectedCustomProduct] = useState<Product | null>(null);

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productApi.getAll,
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/vendors"],
    queryFn: vendorApi.getAll,
  });

  const { data: recentSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales"],
    queryFn: () => salesApi.getAll(),
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["/api/reports/daily-stats"],
    queryFn: () => reportsApi.getDailyStats(),
  });

  // Mutations
  const createSaleMutation = useMutation({
    mutationFn: ({ sale, items }: { sale: InsertSale; items: InsertSaleItem[] }) =>
      salesApi.create(sale, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/daily-stats"] });
      setCart([]);
      setSelectedVendor(null);
      toast({
        title: "Venda realizada com sucesso!",
        description: "A venda foi processada e adicionada ao sistema.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao processar venda",
        description: "Ocorreu um erro ao processar a venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSelectProduct = (product: Product) => {
    if (product.type === "acai-custom") {
      setSelectedCustomProduct(product);
      setCustomModalOpen(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleCustomQuantity = (quantity: number) => {
    if (selectedCustomProduct) {
      addToCart(selectedCustomProduct, quantity);
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    const unitPrice = product.type === "acai-custom" 
      ? parseFloat(product.pricePerLiter || "0") 
      : parseFloat(product.price);
    
    const total = unitPrice * quantity;

    const newItem: CartItem = {
      product,
      quantity,
      unitPrice,
      total,
    };

    setCart(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckout = (paymentMethod: string) => {
    if (!selectedVendor || cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const commission = subtotal * parseFloat(selectedVendor.commissionRate);

    const sale: InsertSale = {
      vendorId: selectedVendor.id,
      subtotal: subtotal.toFixed(2),
      commission: commission.toFixed(2),
      total: subtotal.toFixed(2),
      paymentMethod,
    };

    const items: InsertSaleItem[] = cart.map(item => ({
      saleId: 0, // Will be set by the backend
      productId: item.product.id,
      quantity: item.quantity.toFixed(3),
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2),
    }));

    createSaleMutation.mutate({ sale, items });
  };

  if (productsLoading || vendorsLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dailyStats?.totalSales || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {dailyStats?.totalRevenue || "0,00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {dailyStats?.totalCommissions || "0,00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sales Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductGrid products={products} onSelectProduct={handleSelectProduct} />
        </div>
        
        <div>
          <ShoppingCart
            items={cart}
            vendors={vendors}
            selectedVendor={selectedVendor}
            onSelectVendor={setSelectedVendor}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions sales={recentSales} />

      {/* Custom Quantity Modal */}
      <CustomQuantityModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        product={selectedCustomProduct}
        onConfirm={handleCustomQuantity}
      />
    </div>
  );
}
