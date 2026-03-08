import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NewsFeedProvider } from "@/contexts/NewsFeedContext";
import { NotificationCenterProvider } from "@/contexts/NotificationCenterContext";
import { CommandPalette } from "@/components/CommandPalette";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NewsFeedProvider>
        <NotificationCenterProvider>
          <Toaster />
          <Sonner />
          <CommandPalette />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationCenterProvider>
      </NewsFeedProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
