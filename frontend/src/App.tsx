import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import PackageDetail from "./pages/PackageDetail";
import StarredPage from "./pages/StarredPage";
import LanguagesPage from "./pages/LanguagesPage";
import AlternativesPage from "./pages/AlternativesPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/package/:id" element={<PackageDetail />} />
          <Route path="/languages" element={<LanguagesPage />} />
          <Route path="/languages/:lang" element={<SearchPage />} />
          <Route path="/alternatives" element={<AlternativesPage />} />
          <Route path="/starred" element={<StarredPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;