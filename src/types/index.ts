export type UserRole = 'admin' | 'warehouse' | 'sales' | 'billing';

export interface RoleConfig {
  id: UserRole;
  title: string;
  shortTitle: string;
  iconName: string;
  badgeColor: string;
  description: string;
}

export type ScaffoldCategory = 'marcos' | 'crucetas' | 'plataformas' | 'llantas' | 'tornillos' | 'accesorios';

export interface ScaffoldItem {
  id: string;
  code: string;
  name: string;
  category: ScaffoldCategory;
  description: string;
  unit: string;
  totalQty: number;        // Cantidad total registrada
  availableQty: number;    // Cantidad disponible en bodega
  rentedQty: number;       // Cantidad en renta (fuera de almacén)
  maintenanceQty: number;  // Cantidad en reparación/mantenimiento
  dailyRate: number;       // Tarifa por día
  weeklyRate: number;      // Tarifa por semana
  monthlyRate: number;     // Tarifa por mes
  replacementCost: number; // Costo de reposición por daño/pérdida
}

export type MachineryStatus = 'disponible' | 'rentado' | 'mantenimiento' | 'baja';

export interface MachineryItem {
  id: string;
  serialNumber: string;    // Número de serie o código único
  name: string;
  brand: string;
  model: string;
  powerSource: string;     // Gasolina, Eléctrico, Diésel
  status: MachineryStatus;
  currentRentalId?: string;
  currentClientName?: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  replacementCost: number;
  maintenanceNotes?: string;
}

export interface Worksite {
  id: string;
  name: string;            // Nombre de la obra / proyecto (ej. Torre Bellavista)
  address: string;         // Dirección física completa donde se entrega el equipo
  siteContact: string;     // Residente o encargado en obra
  sitePhone: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;            // Nombre o razón social
  contactPerson: string;
  phone: string;
  email: string;
  taxId: string;           // RFC o Identificación fiscal
  fiscalAddress: string;   // Dirección fiscal / personal
  worksites: Worksite[];   // Direcciones de obra registradas
  createdAt: string;
  notes?: string;
}

export type RateType = 'dia' | 'semana' | 'mes';
export type RentalStatus = 'activa' | 'parcial' | 'completada' | 'vencida';
export type PaymentStatus = 'pendiente' | 'abono_parcial' | 'pagado';
export type DepositStatus = 'retenido' | 'parcialmente_retenido' | 'devuelto';

export interface RentalScaffoldItem {
  itemId: string;
  code: string;
  name: string;
  deliveredQty: number;    // Cantidad entregada inicialmente
  returnedQty: number;     // Cantidad devuelta a bodega
  damagedQty: number;      // Cantidad devuelta con daños
  lostQty: number;         // Cantidad no devuelta / perdida
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  replacementCost: number;
}

export interface RentalMachineryItem {
  itemId: string;
  serialNumber: string;
  name: string;
  brand: string;
  returned: boolean;
  returnDate?: string;
  damaged?: boolean;
  damageNotes?: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  replacementCost: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  receiptNumber?: string;
  notes?: string;
  receivedBy: string;
}

export interface RentalOrder {
  id: string;               // Folio ej. REN-2025-0101
  clientId: string;
  clientName: string;
  clientPhone: string;
  worksiteId: string;
  worksiteName: string;
  worksiteAddress: string;
  siteContact: string;
  sitePhone: string;
  startDate: string;        // Fecha de salida
  expectedReturnDate: string; // Fecha pactada de devolución
  actualReturnDate?: string;
  status: RentalStatus;
  rateType: RateType;
  scaffoldingItems: RentalScaffoldItem[];
  machineryItems: RentalMachineryItem[];
  depositAmount: number;    // Depósito en garantía retenido
  depositStatus: DepositStatus;
  depositReturnedAmount: number;
  depositNotes?: string;
  rentalSubtotal: number;
  damageFees: number;       // Cargos por roturas/pérdidas
  totalDue: number;         // Total general (renta + daños)
  amountPaid: number;       // Monto ya abonado/pagado
  paymentStatus: PaymentStatus;
  payments: PaymentRecord[];
  notes?: string;
  deliveryAuthorizedBy: string;
  clientReceivedBy?: string;
  createdAt: string;
}

export type MermaIssueType = 'rotura' | 'doblez' | 'faltante' | 'mantenimiento_mayor';

export interface DamageRecord {
  id: string;
  date: string;
  rentalId: string;
  clientName: string;
  worksiteName: string;
  itemType: 'andamio' | 'maquinaria';
  itemName: string;
  identifier: string;      // Código o No. de Serie
  quantity: number;
  issueType: MermaIssueType;
  costCharged: number;
  depositDeducted: boolean;
  notes: string;
}
