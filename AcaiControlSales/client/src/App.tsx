import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sales from "@/pages/sales";
import Products from "@/pages/products";
import Vendors from "@/pages/vendors";
import Reports from "@/pages/reports";
import CashFlow from "@/pages/cashflow";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Sprout, Calendar } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Sales} />
      <Route path="/sales" component={Sales} />
      <Route path="/products" component={Products} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/reports" component={Reports} />
      <Route path="/cashflow" component={CashFlow} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const currentDateTime = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center">
                  <div className="md:hidden mr-3">
                    <Sprout className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    AçaíControl
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <Calendar className="inline mr-2 h-4 w-4" />
                    {currentDateTime}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
              <Router />
            </main>
          </div>
          
          <MobileNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
