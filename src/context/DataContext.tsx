import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  ScaffoldItem,
  MachineryItem,
  Client,
  RentalOrder,
  DamageRecord,
  PaymentRecord,
} from '../types';
import {
  INITIAL_SCAFFOLDING,
  INITIAL_MACHINERY,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_DAMAGES,
} from '../data/sampleData';

const STORAGE_KEY = 'andamios_data_v1';
const SUPPRESS_DEMO_KEY = 'andamios_suppress_demo_data';
const ROLE_KEY = 'andamios_active_role';

interface DataContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  scaffolding: ScaffoldItem[];
  machinery: MachineryItem[];
  clients: Client[];
  orders: RentalOrder[];
  damages: DamageRecord[];
  isDemoSuppressed: boolean;
  
  // Scaffolding actions
  addScaffoldItem: (item: Omit<ScaffoldItem, 'id'>) => void;
  updateScaffoldItem: (id: string, item: Partial<ScaffoldItem>) => void;
  deleteScaffoldItem: (id: string) => void;
  
  // Machinery actions
  addMachineryItem: (item: Omit<MachineryItem, 'id'>) => void;
  updateMachineryItem: (id: string, item: Partial<MachineryItem>) => void;
  deleteMachineryItem: (id: string) => void;
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => string;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addWorksiteToClient: (clientId: string, worksite: Omit<Client['worksites'][0], 'id'>) => void;
  
  // Rental Order actions
  createOrder: (order: Omit<RentalOrder, 'id' | 'createdAt'>) => string;
  updateOrder: (id: string, order: Partial<RentalOrder>) => void;
  processReturnCheckIn: (
    orderId: string,
    scaffoldReturns: Array<{ itemId: string; returnedQty: number; damagedQty: number; lostQty: number }>,
    machineryReturns: Array<{ itemId: string; returned: boolean; damaged?: boolean; damageNotes?: string }>,
    newDamageNotes?: string
  ) => void;
  
  // Payment actions
  addPaymentToOrder: (orderId: string, payment: Omit<PaymentRecord, 'id'>) => void;
  updateDepositStatus: (orderId: string, status: RentalOrder['depositStatus'], returnedAmount: number, notes?: string) => void;
  
  // Damage/Merma actions
  addDamageRecord: (damage: Omit<DamageRecord, 'id'>) => void;
  
  // Demo & Supabase Data Management
  wipeAllSampleData: () => void;
  restoreSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => boolean;
  getSupabaseSchemaSQL: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    return (localStorage.getItem(ROLE_KEY) as UserRole) || null;
  });

  const [isDemoSuppressed, setIsDemoSuppressed] = useState<boolean>(() => {
    return localStorage.getItem(SUPPRESS_DEMO_KEY) === 'true';
  });

  const [scaffolding, setScaffolding] = useState<ScaffoldItem[]>(() => {
    const suppressed = localStorage.getItem(SUPPRESS_DEMO_KEY) === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_scaffolding`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return suppressed ? [] : INITIAL_SCAFFOLDING;
  });

  const [machinery, setMachinery] = useState<MachineryItem[]>(() => {
    const suppressed = localStorage.getItem(SUPPRESS_DEMO_KEY) === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_machinery`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return suppressed ? [] : INITIAL_MACHINERY;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const suppressed = localStorage.getItem(SUPPRESS_DEMO_KEY) === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return suppressed ? [] : INITIAL_CLIENTS;
  });

  const [orders, setOrders] = useState<RentalOrder[]>(() => {
    const suppressed = localStorage.getItem(SUPPRESS_DEMO_KEY) === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return suppressed ? [] : INITIAL_ORDERS;
  });

  const [damages, setDamages] = useState<DamageRecord[]>(() => {
    const suppressed = localStorage.getItem(SUPPRESS_DEMO_KEY) === 'true';
    const saved = localStorage.getItem(`${STORAGE_KEY}_damages`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return suppressed ? [] : INITIAL_DAMAGES;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_scaffolding`, JSON.stringify(scaffolding));
  }, [scaffolding]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_machinery`, JSON.stringify(machinery));
  }, [machinery]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_damages`, JSON.stringify(damages));
  }, [damages]);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(ROLE_KEY, newRole);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
  };

  // Recalculate scaffolding item availability dynamically based on orders
  const refreshScaffoldCounts = (
    currentScaffolding: ScaffoldItem[],
    currentOrders: RentalOrder[],
    currentDamages: DamageRecord[]
  ): ScaffoldItem[] => {
    return currentScaffolding.map(item => {
      let rented = 0;
      currentOrders.forEach(o => {
        if (o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida') {
          const match = o.scaffoldingItems.find(si => si.itemId === item.id);
          if (match) {
            // Outstanding pieces currently in client possession
            const activeInField = Math.max(0, match.deliveredQty - match.returnedQty - match.lostQty);
            rented += activeInField;
          }
        }
      });

      const maint = item.maintenanceQty || 0;
      const available = Math.max(0, item.totalQty - rented - maint);

      return {
        ...item,
        rentedQty: rented,
        availableQty: available,
      };
    });
  };

  // Scaffolding CRUD
  const addScaffoldItem = (itemData: Omit<ScaffoldItem, 'id'>) => {
    const newItem: ScaffoldItem = {
      ...itemData,
      id: `scaff-${Date.now()}`,
    };
    setScaffolding(prev => [...prev, newItem]);
  };

  const updateScaffoldItem = (id: string, itemData: Partial<ScaffoldItem>) => {
    setScaffolding(prev =>
      prev.map(item => (item.id === id ? { ...item, ...itemData } : item))
    );
  };

  const deleteScaffoldItem = (id: string) => {
    setScaffolding(prev => prev.filter(item => item.id !== id));
  };

  // Machinery CRUD
  const addMachineryItem = (itemData: Omit<MachineryItem, 'id'>) => {
    const newItem: MachineryItem = {
      ...itemData,
      id: `mach-${Date.now()}`,
    };
    setMachinery(prev => [...prev, newItem]);
  };

  const updateMachineryItem = (id: string, itemData: Partial<MachineryItem>) => {
    setMachinery(prev =>
      prev.map(item => (item.id === id ? { ...item, ...itemData } : item))
    );
  };

  const deleteMachineryItem = (id: string) => {
    setMachinery(prev => prev.filter(item => item.id !== id));
  };

  // Client CRUD
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): string => {
    const newId = `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      worksites: clientData.worksites.map((ws, i) => ({
        ...ws,
        id: ws.id || `ws-${Date.now()}-${i}`,
      })),
    };
    setClients(prev => [...prev, newClient]);
    return newId;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev =>
      prev.map(cli => (cli.id === id ? { ...cli, ...clientData } : cli))
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(cli => cli.id !== id));
  };

  const addWorksiteToClient = (clientId: string, worksite: Omit<Client['worksites'][0], 'id'>) => {
    const newWorksite = {
      ...worksite,
      id: `ws-${Date.now()}`,
    };
    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            worksites: [...c.worksites, newWorksite],
          };
        }
        return c;
      })
    );
  };

  // Rental Order Creation
  const createOrder = (orderData: Omit<RentalOrder, 'id' | 'createdAt'>): string => {
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    const newId = `REN-${year}-${String(count).padStart(4, '0')}`;

    const newOrder: RentalOrder = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);

    // Update machinery status to 'rentado'
    if (orderData.machineryItems.length > 0) {
      setMachinery(prev =>
        prev.map(mach => {
          const match = orderData.machineryItems.find(mi => mi.itemId === mach.id);
          if (match) {
            return {
              ...mach,
              status: 'rentado',
              currentRentalId: newId,
              currentClientName: orderData.clientName,
            };
          }
          return mach;
        })
      );
    }

    // Refresh scaffolding stock
    setScaffolding(prev => refreshScaffoldCounts(prev, nextOrders, damages));

    return newId;
  };

  const updateOrder = (id: string, orderData: Partial<RentalOrder>) => {
    setOrders(prev => {
      const updated = prev.map(o => (o.id === id ? { ...o, ...orderData } : o));
      setScaffolding(s => refreshScaffoldCounts(s, updated, damages));
      return updated;
    });
  };

  // Process Return / Check-In with Partial Return & Damages handling
  const processReturnCheckIn = (
    orderId: string,
    scaffoldReturns: Array<{ itemId: string; returnedQty: number; damagedQty: number; lostQty: number }>,
    machineryReturns: Array<{ itemId: string; returned: boolean; damaged?: boolean; damageNotes?: string }>,
    newDamageNotes?: string
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let additionalDamageFee = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const newDamages: DamageRecord[] = [];

    // Process scaffolding pieces
    const updatedScaffoldingItems = order.scaffoldingItems.map(item => {
      const ret = scaffoldReturns.find(r => r.itemId === item.itemId);
      if (!ret) return item;

      const newlyReturned = Math.max(0, ret.returnedQty);
      const newlyDamaged = Math.max(0, ret.damagedQty);
      const newlyLost = Math.max(0, ret.lostQty);

      if (newlyDamaged > 0) {
        const damageCost = Math.round(newlyDamaged * (item.replacementCost * 0.4)); // Costo de reparación
        additionalDamageFee += damageCost;
        newDamages.push({
          id: `merma-${Date.now()}-${item.code}`,
          date: todayStr,
          rentalId: order.id,
          clientName: order.clientName,
          worksiteName: order.worksiteName,
          itemType: 'andamio',
          itemName: item.name,
          identifier: item.code,
          quantity: newlyDamaged,
          issueType: 'doblez',
          costCharged: damageCost,
          depositDeducted: true,
          notes: newDamageNotes || 'Pieza dañada en obra durante renta.',
        });
      }

      if (newlyLost > 0) {
        const lossCost = newlyLost * item.replacementCost; // Reposición completa
        additionalDamageFee += lossCost;
        newDamages.push({
          id: `merma-lost-${Date.now()}-${item.code}`,
          date: todayStr,
          rentalId: order.id,
          clientName: order.clientName,
          worksiteName: order.worksiteName,
          itemType: 'andamio',
          itemName: item.name,
          identifier: item.code,
          quantity: newlyLost,
          issueType: 'faltante',
          costCharged: lossCost,
          depositDeducted: true,
          notes: 'Pieza faltante no devuelta por el cliente.',
        });
      }

      return {
        ...item,
        returnedQty: item.returnedQty + newlyReturned,
        damagedQty: item.damagedQty + newlyDamaged,
        lostQty: item.lostQty + newlyLost,
      };
    });

    // Process machinery
    const updatedMachineryItems = order.machineryItems.map(m => {
      const ret = machineryReturns.find(r => r.itemId === m.itemId);
      if (!ret) return m;

      if (ret.damaged) {
        const machDamageCost = Math.round(m.replacementCost * 0.15);
        additionalDamageFee += machDamageCost;
        newDamages.push({
          id: `merma-mach-${Date.now()}-${m.serialNumber}`,
          date: todayStr,
          rentalId: order.id,
          clientName: order.clientName,
          worksiteName: order.worksiteName,
          itemType: 'maquinaria',
          itemName: m.name,
          identifier: m.serialNumber,
          quantity: 1,
          issueType: 'mantenimiento_mayor',
          costCharged: machDamageCost,
          depositDeducted: true,
          notes: ret.damageNotes || 'Equipo devuelto con averías mecánicas.',
        });
      }

      return {
        ...m,
        returned: ret.returned || m.returned,
        returnDate: ret.returned ? todayStr : m.returnDate,
        damaged: ret.damaged || m.damaged,
        damageNotes: ret.damageNotes || m.damageNotes,
      };
    });

    // Check if fully returned or partial
    const allScaffoldingBack = updatedScaffoldingItems.every(
      si => (si.returnedQty + si.lostQty) >= si.deliveredQty
    );
    const allMachineryBack = updatedMachineryItems.every(mi => mi.returned);
    const isCompleted = allScaffoldingBack && allMachineryBack;

    const newStatus: RentalOrder['status'] = isCompleted ? 'completada' : 'parcial';
    const totalDue = order.rentalSubtotal + order.damageFees + additionalDamageFee;

    const updatedOrder: RentalOrder = {
      ...order,
      scaffoldingItems: updatedScaffoldingItems,
      machineryItems: updatedMachineryItems,
      status: newStatus,
      damageFees: order.damageFees + additionalDamageFee,
      totalDue: totalDue,
      actualReturnDate: isCompleted ? todayStr : undefined,
    };

    const nextOrders = orders.map(o => (o.id === orderId ? updatedOrder : o));
    setOrders(nextOrders);

    // Update machinery status in master inventory
    setMachinery(prev =>
      prev.map(mach => {
        const ret = machineryReturns.find(r => r.itemId === mach.id);
        if (ret && ret.returned) {
          return {
            ...mach,
            status: ret.damaged ? 'mantenimiento' : 'disponible',
            currentRentalId: undefined,
            currentClientName: undefined,
            maintenanceNotes: ret.damaged ? ret.damageNotes : undefined,
          };
        }
        return mach;
      })
    );

    if (newDamages.length > 0) {
      setDamages(prev => [...newDamages, ...prev]);
    }

    // Refresh scaffold counts
    setScaffolding(prev => refreshScaffoldCounts(prev, nextOrders, [...damages, ...newDamages]));
  };

  // Payments
  const addPaymentToOrder = (orderId: string, paymentData: Omit<PaymentRecord, 'id'>) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const newPayment: PaymentRecord = {
          ...paymentData,
          id: `pay-${Date.now()}`,
        };
        const newPaidTotal = o.amountPaid + paymentData.amount;
        let newPaymentStatus: RentalOrder['paymentStatus'] = 'pendiente';
        if (newPaidTotal >= o.totalDue) {
          newPaymentStatus = 'pagado';
        } else if (newPaidTotal > 0) {
          newPaymentStatus = 'abono_parcial';
        }

        return {
          ...o,
          amountPaid: newPaidTotal,
          paymentStatus: newPaymentStatus,
          payments: [...o.payments, newPayment],
        };
      })
    );
  };

  const updateDepositStatus = (
    orderId: string,
    status: RentalOrder['depositStatus'],
    returnedAmount: number,
    notes?: string
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          depositStatus: status,
          depositReturnedAmount: returnedAmount,
          depositNotes: notes || o.depositNotes,
        };
      })
    );
  };

  const addDamageRecord = (damageData: Omit<DamageRecord, 'id'>) => {
    const newRecord: DamageRecord = {
      ...damageData,
      id: `merma-${Date.now()}`,
    };
    setDamages(prev => [newRecord, ...prev]);
  };

  // Wipe all sample data and set persistence suppression flag
  const wipeAllSampleData = () => {
    setScaffolding([]);
    setMachinery([]);
    setClients([]);
    setOrders([]);
    setDamages([]);
    setIsDemoSuppressed(true);

    localStorage.setItem(SUPPRESS_DEMO_KEY, 'true');
    localStorage.removeItem(`${STORAGE_KEY}_scaffolding`);
    localStorage.removeItem(`${STORAGE_KEY}_machinery`);
    localStorage.removeItem(`${STORAGE_KEY}_clients`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_damages`);
  };

  // Restore sample demo data
  const restoreSampleData = () => {
    setScaffolding(INITIAL_SCAFFOLDING);
    setMachinery(INITIAL_MACHINERY);
    setClients(INITIAL_CLIENTS);
    setOrders(INITIAL_ORDERS);
    setDamages(INITIAL_DAMAGES);
    setIsDemoSuppressed(false);

    localStorage.removeItem(SUPPRESS_DEMO_KEY);
    localStorage.setItem(`${STORAGE_KEY}_scaffolding`, JSON.stringify(INITIAL_SCAFFOLDING));
    localStorage.setItem(`${STORAGE_KEY}_machinery`, JSON.stringify(INITIAL_MACHINERY));
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(`${STORAGE_KEY}_damages`, JSON.stringify(INITIAL_DAMAGES));
  };

  const exportDatabaseJSON = (): string => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      scaffolding,
      machinery,
      clients,
      orders,
      damages,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.scaffolding) setScaffolding(parsed.scaffolding);
      if (parsed.machinery) setMachinery(parsed.machinery);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.damages) setDamages(parsed.damages);
      setIsDemoSuppressed(true);
      localStorage.setItem(SUPPRESS_DEMO_KEY, 'true');
      return true;
    } catch (e) {
      console.error('Invalid JSON import', e);
      return false;
    }
  };

  // Generate complete Supabase PostgreSQL schema and seeds for easy deployment
  const getSupabaseSchemaSQL = (): string => {
    return `-- ============================================================
-- SCHEMA SUPABASE / POSTGRESQL PARA ANDAMIOS Y MAQUINARIA
-- Sistema de Gestión de Renta, Inventario, Obras y Cobranza
-- ============================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: INVENTARIO DE ANDAMIOS (Piezas sueltas por cantidad/volumen)
CREATE TABLE IF NOT EXISTS scaffolding_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- marcos, crucetas, plataformas, llantas, tornillos, accesorios
    description TEXT,
    unit VARCHAR(20) DEFAULT 'pieza',
    total_qty INT NOT NULL DEFAULT 0,
    available_qty INT NOT NULL DEFAULT 0,
    rented_qty INT NOT NULL DEFAULT 0,
    maintenance_qty INT NOT NULL DEFAULT 0,
    daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    weekly_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    monthly_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    replacement_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: INVENTARIO DE MAQUINARIA (Equipos individuales serializados)
CREATE TABLE IF NOT EXISTS machinery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    power_source VARCHAR(50), -- Gasolina, Eléctrico, Diésel
    status VARCHAR(50) NOT NULL DEFAULT 'disponible', -- disponible, rentado, mantenimiento, baja
    current_rental_id VARCHAR(50),
    current_client_name VARCHAR(255),
    daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    weekly_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    monthly_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    replacement_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    maintenance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: CLIENTES
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    tax_id VARCHAR(50), -- RFC / Identificación fiscal
    fiscal_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA: DIRECCIONES DE OBRA (Ubicación física de entrega)
CREATE TABLE IF NOT EXISTS worksites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    site_contact VARCHAR(255),
    site_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA: ÓRDENES DE RENTA / PEDIDOS
CREATE TABLE IF NOT EXISTS rental_orders (
    id VARCHAR(50) PRIMARY KEY, -- Folio ej. REN-2025-0001
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    worksite_id UUID REFERENCES worksites(id) ON DELETE RESTRICT,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    worksite_name VARCHAR(255) NOT NULL,
    worksite_address TEXT NOT NULL,
    site_contact VARCHAR(255),
    site_phone VARCHAR(50),
    start_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'activa', -- activa, parcial, completada, vencida
    rate_type VARCHAR(20) NOT NULL DEFAULT 'semana', -- dia, semana, mes
    deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    deposit_status VARCHAR(50) NOT NULL DEFAULT 'retenido', -- retenido, parcialmente_retenido, devuelto
    deposit_returned_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    deposit_notes TEXT,
    rental_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    damage_fees NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- pendiente, abono_parcial, pagado
    delivery_authorized_by VARCHAR(255),
    client_received_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA: DETALLE DE ANDAMIOS RENTADOS
CREATE TABLE IF NOT EXISTS order_scaffolding_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) REFERENCES rental_orders(id) ON DELETE CASCADE,
    scaffold_id UUID REFERENCES scaffolding_items(id),
    code VARCHAR(50),
    name VARCHAR(255),
    delivered_qty INT NOT NULL DEFAULT 0,
    returned_qty INT NOT NULL DEFAULT 0,
    damaged_qty INT NOT NULL DEFAULT 0,
    lost_qty INT NOT NULL DEFAULT 0,
    daily_rate NUMERIC(10,2),
    weekly_rate NUMERIC(10,2),
    monthly_rate NUMERIC(10,2),
    replacement_cost NUMERIC(10,2)
);

-- 8. TABLA: DETALLE DE MAQUINARIA RENTADA
CREATE TABLE IF NOT EXISTS order_machinery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) REFERENCES rental_orders(id) ON DELETE CASCADE,
    machinery_id UUID REFERENCES machinery_items(id),
    serial_number VARCHAR(100),
    name VARCHAR(255),
    returned BOOLEAN DEFAULT FALSE,
    return_date DATE,
    damaged BOOLEAN DEFAULT FALSE,
    damage_notes TEXT,
    daily_rate NUMERIC(10,2),
    weekly_rate NUMERIC(10,2),
    monthly_rate NUMERIC(10,2),
    replacement_cost NUMERIC(10,2)
);

-- 9. TABLA: REGISTRO DE PAGOS / COBRANZA
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) REFERENCES rental_orders(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- efectivo, transferencia, tarjeta, cheque
    receipt_number VARCHAR(100),
    notes TEXT,
    received_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA: REGISTRO DE DAÑOS, MERMAS Y FALTANTES
CREATE TABLE IF NOT EXISTS damage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    order_id VARCHAR(50),
    client_name VARCHAR(255),
    worksite_name VARCHAR(255),
    item_type VARCHAR(50), -- andamio, maquinaria
    item_name VARCHAR(255),
    identifier VARCHAR(100),
    quantity INT DEFAULT 1,
    issue_type VARCHAR(50), -- rotura, doblez, faltante, mantenimiento_mayor
    cost_charged NUMERIC(10,2) DEFAULT 0.00,
    deposit_deducted BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE scaffolding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE machinery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksites ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_scaffolding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_machinery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON scaffolding_items FOR ALL USING (true);
CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON machinery_items FOR ALL USING (true);
CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON clients FOR ALL USING (true);
CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON worksites FOR ALL USING (true);
CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON rental_orders FOR ALL USING (true);
CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON payment_records FOR ALL USING (true);
CREATE POLICY "Acceso público lectura/escritura para usuarios autenticados" 
ON damage_records FOR ALL USING (true);
`;
  };

  return (
    <DataContext.Provider
      value={{
        role,
        setRole,
        scaffolding,
        machinery,
        clients,
        orders,
        damages,
        isDemoSuppressed,
        addScaffoldItem,
        updateScaffoldItem,
        deleteScaffoldItem,
        addMachineryItem,
        updateMachineryItem,
        deleteMachineryItem,
        addClient,
        updateClient,
        deleteClient,
        addWorksiteToClient,
        createOrder,
        updateOrder,
        processReturnCheckIn,
        addPaymentToOrder,
        updateDepositStatus,
        addDamageRecord,
        wipeAllSampleData,
        restoreSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,
        getSupabaseSchemaSQL,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
