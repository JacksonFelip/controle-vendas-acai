import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, salesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, DollarSign, Users, ShoppingCart } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["/api/reports/daily-stats", dateRange.startDate],
    queryFn: () => reportsApi.getDailyStats(new Date(dateRange.startDate)),
  });

  const { data: vendorStats = [] } = useQuery({
    queryKey: ["/api/reports/vendor-stats", dateRange.startDate, dateRange.endDate],
    queryFn: () => reportsApi.getVendorStats(
      new Date(dateRange.startDate), 
      new Date(dateRange.endDate)
    ),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["/api/sales", dateRange.startDate, dateRange.endDate],
    queryFn: () => salesApi.getAll(
      new Date(dateRange.startDate), 
      new Date(dateRange.endDate)
    ),
  });

  // Calculate product stats
  const productStats = sales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const productName = item.product.name;
      if (!acc[productName]) {
        acc[productName] = { quantity: 0, revenue: 0 };
      }
      acc[productName].quantity += parseFloat(item.quantity);
      acc[productName].revenue += parseFloat(item.total);
    });
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topProducts = Object.entries(productStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sales.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {sales.reduce((sum, sale) => sum + parseFloat(sale.commission), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {sales.length > 0 
                ? (sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0) / sales.length).toFixed(2)
                : "0,00"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorStats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma venda no período</p>
            ) : (
              <div className="space-y-4">
                {vendorStats.map((vendor) => (
                  <div key={vendor.vendorId} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{vendor.vendorName}</h4>
                      <p className="text-sm text-gray-600">{vendor.totalSales} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">R$ {vendor.totalRevenue}</p>
                      <p className="text-sm text-purple-600">R$ {vendor.totalCommissions} comissão</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma venda no período</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map(([productName, stats]) => (
                  <div key={productName} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{productName}</h4>
                      <p className="text-sm text-gray-600">
                        {stats.quantity.toFixed(1)} unidades/litros
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">R$ {stats.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma venda no período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produtos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.vendor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.items.map(item => `${item.product.name} (${item.quantity})`).join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amazon-600">
                        R$ {parseFloat(sale.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-acai-600">
                        R$ {parseFloat(sale.commission).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.paymentMethod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
