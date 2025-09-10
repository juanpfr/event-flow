import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OrganizerDashboard from "./pages/dashboard/OrganizerDashboard";
import ParticipantDashboard from "./pages/dashboard/ParticipantDashboard";
import AuthGuard from "./components/AuthGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard/admin" 
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminDashboard />
              </AuthGuard>
            } 
          />
          <Route 
            path="/dashboard/organizer" 
            element={
              <AuthGuard allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </AuthGuard>
            } 
          />
          <Route 
            path="/dashboard/participant" 
            element={
              <AuthGuard allowedRoles={['participant']}>
                <ParticipantDashboard />
              </AuthGuard>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
