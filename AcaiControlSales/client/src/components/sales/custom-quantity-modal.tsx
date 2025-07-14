import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@shared/schema";

interface CustomQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number) => void;
}

export default function CustomQuantityModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: CustomQuantityModalProps) {
  const [quantity, setQuantity] = useState<string>("1.0");

  const pricePerLiter = product?.pricePerLiter ? parseFloat(product.pricePerLiter) : 0;
  const quantityNum = parseFloat(quantity) || 0;
  const total = pricePerLiter * quantityNum;

  const handleConfirm = () => {
    if (quantityNum > 0) {
      onConfirm(quantityNum);
      setQuantity("1.0");
      onClose();
    }
  };

  const handleClose = () => {
    setQuantity("1.0");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Açaí Personalizado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantidade (Litros)</Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Ex: 1.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Preço por litro: <span className="font-semibold text-purple-600">R$ {pricePerLiter.toFixed(2)}</span></p>
            <p className="text-lg font-semibold text-gray-800 mt-2">
              Total: <span className="text-green-600">R$ {total.toFixed(2)}</span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={quantityNum <= 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
