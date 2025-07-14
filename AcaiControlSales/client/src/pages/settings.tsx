import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Save, DollarSign, Settings as SettingsIcon, User } from "lucide-react";
import type { Product, InsertProduct } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const [priceChanges, setPriceChanges] = useState<Record<number, { price: string; pricePerLiter: string }>>({});
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    emailNotifications: false,
    lowStockAlerts: true,
    dailyReports: true,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productApi.getAll,
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: number; product: Partial<InsertProduct> }) =>
      productApi.update(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Preço atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar preço",
        variant: "destructive",
      });
    },
  });

  const handlePriceChange = (productId: number, field: 'price' | 'pricePerLiter', value: string) => {
    setPriceChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      }
    }));
  };

  const savePrice = (product: Product) => {
    const changes = priceChanges[product.id];
    if (!changes) return;

    const updateData: Partial<InsertProduct> = {};
    
    if (changes.price !== undefined && changes.price !== product.price) {
      updateData.price = changes.price;
    }
    
    if (changes.pricePerLiter !== undefined && changes.pricePerLiter !== (product.pricePerLiter || "")) {
      updateData.pricePerLiter = changes.pricePerLiter || null;
    }

    if (Object.keys(updateData).length > 0) {
      updateProductMutation.mutate({ id: product.id, product: updateData });
      setPriceChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[product.id];
        return newChanges;
      });
    }
  };

  const getCurrentPrice = (product: Product) => {
    return priceChanges[product.id]?.price ?? product.price;
  };

  const getCurrentPricePerLiter = (product: Product) => {
    return priceChanges[product.id]?.pricePerLiter ?? (product.pricePerLiter || "");
  };

  const hasChanges = (product: Product) => {
    const changes = priceChanges[product.id];
    if (!changes) return false;
    
    return (changes.price !== undefined && changes.price !== product.price) ||
           (changes.pricePerLiter !== undefined && changes.pricePerLiter !== (product.pricePerLiter || ""));
  };

  const saveAllSystemSettings = () => {
    // In a real application, this would save to backend
    toast({
      title: "Configurações salvas com sucesso!",
      description: "As configurações do sistema foram atualizadas.",
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
      </div>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Preços
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Preços</CardTitle>
              <p className="text-sm text-gray-600">
                Ajuste os preços dos produtos conforme a época ou demanda do mercado
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">Tipo: {product.type}</p>
                      </div>
                      {hasChanges(product) && (
                        <Button
                          onClick={() => savePrice(product)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updateProductMutation.isPending}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`price-${product.id}`}>Preço (R$)</Label>
                        <Input
                          id={`price-${product.id}`}
                          type="number"
                          step="0.01"
                          value={getCurrentPrice(product)}
                          onChange={(e) => handlePriceChange(product.id, 'price', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {product.type === "acai-custom" && (
                        <div>
                          <Label htmlFor={`pricePerLiter-${product.id}`}>Preço por Litro (R$)</Label>
                          <Input
                            id={`pricePerLiter-${product.id}`}
                            type="number"
                            step="0.01"
                            value={getCurrentPricePerLiter(product)}
                            onChange={(e) => handlePriceChange(product.id, 'pricePerLiter', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    {hasChanges(product) && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-sm text-amber-800">
                          <strong>Alterações pendentes:</strong> Clique em "Salvar" para aplicar as mudanças
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <p className="text-sm text-gray-600">
                Configure as preferências e comportamentos do sistema
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Backup Automático</Label>
                  <p className="text-sm text-gray-600">
                    Realize backup automático dos dados diariamente
                  </p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, autoBackup: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Notificações por Email</Label>
                  <p className="text-sm text-gray-600">
                    Receba notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Alertas de Estoque Baixo</Label>
                  <p className="text-sm text-gray-600">
                    Receba alertas quando os produtos estiverem com estoque baixo
                  </p>
                </div>
                <Switch
                  checked={systemSettings.lowStockAlerts}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, lowStockAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Relatórios Diários</Label>
                  <p className="text-sm text-gray-600">
                    Gere relatórios de vendas automaticamente todos os dias
                  </p>
                </div>
                <Switch
                  checked={systemSettings.dailyReports}
                  onCheckedChange={(checked) => 
                    setSystemSettings(prev => ({ ...prev, dailyReports: checked }))
                  }
                />
              </div>

              <Separator />

              <Button 
                onClick={saveAllSystemSettings}
                className="w-full bg-amazon-500 hover:bg-amazon-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <p className="text-sm text-gray-600">
                Gerencie suas informações pessoais e preferências
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-amazon-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-2xl">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Admin</h3>
                  <p className="text-sm text-gray-600">Gerente</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    defaultValue="Administrador do Sistema"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="admin@acaicontrol.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="(11) 99999-9999"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Função</Label>
                  <Input
                    id="role"
                    defaultValue="Gerente"
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <Button className="w-full bg-amazon-500 hover:bg-amazon-600">
                <Save className="mr-2 h-4 w-4" />
                Atualizar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
