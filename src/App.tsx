import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { DataManagementModal } from './components/DataManagementModal';
import { RemisionModal } from './components/RemisionModal';
import { NewRentalModal } from './components/NewRentalModal';
import { ReturnCheckInModal } from './components/ReturnCheckInModal';
import { PaymentModal } from './components/PaymentModal';
import { InventoryModal } from './components/InventoryModal';
import { ClientModal } from './components/ClientModal';

// Views
import { OverviewView } from './views/OverviewView';
import { InventoryView } from './views/InventoryView';
import { ClientsView } from './views/ClientsView';
import { RentalsView } from './views/RentalsView';
import { ReturnsView } from './views/ReturnsView';
import { BillingView } from './views/BillingView';
import { AlertsView } from './views/AlertsView';
import { SupabaseView } from './views/SupabaseView';

import { RentalOrder } from './types';
import { WifiOff } from 'lucide-react';

function DashboardApp() {
  const { role, setRole, orders } = useData();

  // Active view state
  const [activeView, setActiveView] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isNewRentalOpen, setIsNewRentalOpen] = useState(false);
  const [isNewInventoryOpen, setIsNewInventoryOpen] = useState(false);
  const [inventoryDefaultType, setInventoryDefaultType] = useState<'scaffold' | 'machinery'>('scaffold');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  const [selectedRemisionOrder, setSelectedRemisionOrder] = useState<RentalOrder | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<RentalOrder | null>(null);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<RentalOrder | null>(null);

  // Offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If no role selected, render clean role selector grid
  if (!role) {
    return <RoleSelector onSelectRole={(selectedRole) => setRole(selectedRole)} />;
  }

  // Handlers
  const handleOpenRemision = (order: RentalOrder) => {
    setSelectedRemisionOrder(order);
  };

  const handleOpenReturnCheckIn = (order: RentalOrder) => {
    setSelectedReturnOrder(order);
  };

  const handleOpenPayment = (order: RentalOrder) => {
    setSelectedPaymentOrder(order);
  };

  const handleOpenNewItem = (defaultType: 'scaffold' | 'machinery') => {
    setInventoryDefaultType(defaultType);
    setIsNewInventoryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Offline banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="w-4 h-4" />
          <span>Modo Sin Conexión (Offline) — Todos los datos se almacenan localmente en el dispositivo.</span>
        </div>
      )}

      {/* Unified Institutional Header */}
      <Header
        activeView={activeView}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => setActiveView(view)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Content Area (Clean, no redundant tabs) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-full overflow-x-hidden">
          {activeView === 'overview' && (
            <OverviewView
              onNavigate={(view) => setActiveView(view)}
              onOpenNewRental={() => setIsNewRentalOpen(true)}
              onOpenReturnCheckIn={handleOpenReturnCheckIn}
              onOpenRemision={handleOpenRemision}
            />
          )}

          {activeView === 'inventory' && (
            <InventoryView onOpenNewItemModal={handleOpenNewItem} />
          )}

          {activeView === 'clients' && (
            <ClientsView
              onOpenNewClientModal={() => setIsNewClientOpen(true)}
              onOpenRemision={handleOpenRemision}
            />
          )}

          {activeView === 'rentals' && (
            <RentalsView
              onOpenNewRental={() => setIsNewRentalOpen(true)}
              onOpenRemision={handleOpenRemision}
              onOpenReturnCheckIn={handleOpenReturnCheckIn}
              onOpenPaymentModal={handleOpenPayment}
            />
          )}

          {activeView === 'returns' && (
            <ReturnsView
              onOpenReturnCheckIn={handleOpenReturnCheckIn}
              onOpenRemision={handleOpenRemision}
            />
          )}

          {activeView === 'billing' && (
            <BillingView
              onOpenPaymentModal={handleOpenPayment}
              onOpenRemision={handleOpenRemision}
            />
          )}

          {activeView === 'alerts' && (
            <AlertsView
              onOpenReturnCheckIn={handleOpenReturnCheckIn}
              onOpenRemision={handleOpenRemision}
              onOpenPaymentModal={handleOpenPayment}
            />
          )}

          {activeView === 'supabase' && <SupabaseView />}
        </main>
      </div>

      {/* Fixed Bottom Bar on Mobile & Tablet */}
      <BottomBar activeView={activeView} onSelectView={(view) => setActiveView(view)} />

      {/* Global Modals */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      <NewRentalModal
        isOpen={isNewRentalOpen}
        onClose={() => setIsNewRentalOpen(false)}
        onOrderCreated={(orderId) => {
          const created = orders.find((o) => o.id === orderId);
          if (created) {
            setSelectedRemisionOrder(created);
          }
        }}
      />

      <RemisionModal
        order={selectedRemisionOrder}
        onClose={() => setSelectedRemisionOrder(null)}
      />

      <ReturnCheckInModal
        order={selectedReturnOrder}
        onClose={() => setSelectedReturnOrder(null)}
      />

      <PaymentModal
        order={selectedPaymentOrder}
        onClose={() => setSelectedPaymentOrder(null)}
      />

      <InventoryModal
        isOpen={isNewInventoryOpen}
        onClose={() => setIsNewInventoryOpen(false)}
        defaultType={inventoryDefaultType}
      />

      <ClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <DashboardApp />
    </DataProvider>
  );
}
