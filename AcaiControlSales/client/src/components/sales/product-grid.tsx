import { Soup, IceCream, Scale, Wheat } from "lucide-react";
import type { Product } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const productIcons = {
  "acai-500ml": Soup,
  "acai-1000ml": IceCream,
  "acai-custom": Scale,
  "tapioca-flour": Wheat,
  "cassava-flour": Wheat,
};

const productStyles = {
  "acai-500ml": "bg-gradient-to-br from-purple-500 to-purple-700",
  "acai-1000ml": "bg-gradient-to-br from-purple-600 to-purple-800",
  "acai-custom": "bg-gradient-to-br from-purple-700 to-purple-900",
  "tapioca-flour": "bg-gradient-to-br from-amber-400 to-amber-600",
  "cassava-flour": "bg-gradient-to-br from-yellow-600 to-orange-600",
};

export default function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Produtos</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {products.map((product) => {
          const Icon = productIcons[product.type as keyof typeof productIcons] || Soup;
          const styleClass = productStyles[product.type as keyof typeof productStyles] || "bg-gradient-to-br from-gray-500 to-gray-700";
          
          return (
            <div
              key={product.id}
              className={cn(
                "rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-105 min-h-[120px] flex flex-col justify-center",
                styleClass
              )}
              onClick={() => onSelectProduct(product)}
            >
              <div className="flex items-center justify-center mb-2">
                <Icon className="h-8 w-8" />
              </div>
              <h4 className="font-semibold text-center text-sm mb-1">{product.name}</h4>
              <p className="text-xs text-center opacity-90">
                {product.type === "acai-custom" 
                  ? `R$ ${parseFloat(product.pricePerLiter || "0").toFixed(2)}/L`
                  : `R$ ${parseFloat(product.price).toFixed(2)}`
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
