import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import PackageDetail from "./pages/PackageDetail";
import StarredPage from "./pages/StarredPage";
import LanguagesPage from "./pages/LanguagesPage";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/package/:id" element={<PackageDetail />} />
          <Route path="/languages" element={<LanguagesPage />} />
          <Route path="/languages/:lang" element={<SearchPage />} />
          <Route path="/starred" element={<StarredPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;