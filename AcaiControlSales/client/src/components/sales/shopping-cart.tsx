import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import type { Product, Vendor } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  onSelectVendor: (vendor: Vendor) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: (paymentMethod: string) => void;
}

const paymentMethods = [
  { id: "cash", name: "Dinheiro", icon: "💵" },
  { id: "card", name: "Cartão", icon: "💳" },
  { id: "pix", name: "PIX", icon: "📱" },
  { id: "transfer", name: "Transferência", icon: "🏦" },
];

export default function ShoppingCart({
  items,
  vendors,
  selectedVendor,
  onSelectVendor,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: ShoppingCartProps) {
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const commission = selectedVendor ? subtotal * parseFloat(selectedVendor.commissionRate) : 0;
  const total = subtotal;

  const handleCheckout = () => {
    if (!selectedPayment || !selectedVendor) return;
    onCheckout(selectedPayment);
  };

  return (
    <div className="space-y-6">
      {/* Current Sale */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Carrinho de Compras</h3>
        
        {/* Cart Items */}
        <div className="space-y-3 mb-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Quantidade: {item.quantity}
                    {item.product.type === "acai-custom" && " L"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">R$ {item.total.toFixed(2)}</p>
                  <button
                    className="text-red-500 text-sm hover:text-red-700"
                    onClick={() => onRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vendor Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
          <Select value={selectedVendor?.id.toString() || ""} onValueChange={(value) => {
            const vendor = vendors.find(v => v.id.toString() === value);
            if (vendor) onSelectVendor(vendor);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar vendedor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                  {vendor.name} ({(parseFloat(vendor.commissionRate) * 100).toFixed(1)}% comissão)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
            </div>
            {selectedVendor && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Comissão:</span>
                <span className="font-medium text-purple-600">R$ {commission.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-purple-700">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {items.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    selectedPayment === method.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-300 hover:border-purple-600 hover:bg-purple-50"
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <div className="text-lg mb-1">{method.icon}</div>
                  <span className="text-sm">{method.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {items.length > 0 && (
            <>
              <Button
                onClick={handleCheckout}
                disabled={!selectedVendor || !selectedPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                Finalizar Venda
              </Button>
              <Button
                onClick={onClearCart}
                variant="outline"
                className="w-full"
              >
                Limpar Carrinho
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
