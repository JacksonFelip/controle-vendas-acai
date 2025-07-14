import { Link, useLocation } from "wouter";
import { ShoppingCart, Package, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Vendedores", href: "/vendors", icon: Users },
  { name: "Relatórios", href: "/reports", icon: TrendingUp },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-purple-900 border-t border-purple-800 z-50">
      <nav className="flex justify-around py-2">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/sales" && location === "/");
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center py-2 px-1 transition-colors",
                  isActive ? "text-green-300" : "text-purple-300"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
