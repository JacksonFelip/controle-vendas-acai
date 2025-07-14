import { Link, useLocation } from "wouter";
import { Sprout, ShoppingCart, Package, Users, TrendingUp, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Vendedores", href: "/vendors", icon: Users },
  { name: "Relatórios", href: "/reports", icon: TrendingUp },
  { name: "Fluxo de Caixa", href: "/cashflow", icon: Wallet },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-purple-900 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Sprout className="h-8 w-8 text-green-500 mr-3" />
          <h1 className="text-xl font-bold text-white">AçaíControl</h1>
        </div>
        
        <div className="mt-8">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href === "/sales" && location === "/");
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-purple-800 text-white"
                        : "text-purple-100 hover:bg-purple-800"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive ? "text-green-300" : "text-purple-300"
                      )}
                    />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User Profile Section */}
        <div className="flex-shrink-0 flex border-t border-purple-800 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-acai-200">Gerente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
