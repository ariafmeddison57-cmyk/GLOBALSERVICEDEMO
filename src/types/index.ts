export type BrandId = 'kahwatee' | 'kfries' | 'kboba' | 'kinda' | 'events';

export type BranchId = 'al-khor' | 'gulf-mall' | 'west-walk' | 'events-unit' | 'main-store';

export type PosUnitId = 'coffee-shop' | 'restaurant' | 'kboba' | 'kinda' | 'events';

export type UserRole = 'admin' | 'cashier';

export type ViewMode = 
  | 'dashboard' 
  | 'pos' 
  | 'menu'
  | 'inventory' 
  | 'purchases' 
  | 'expenses'
  | 'staff' 
  | 'payroll' 
  | 'reports' 
  | 'flow' 
  | 'settings';

export type OrderType = 'dine-in' | 'takeaway' | 'talabat' | 'snoonu' | 'catering';

export type PaymentMethod = 'cash' | 'card' | 'talabat' | 'snoonu';

export interface PosUnit {
  id: PosUnitId;
  name: string;
  nameAr: string;
  brandId: BrandId;
  terminalId: string;
  operatorName: string;
  operatorRole: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export type MeasurementUnit = 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'box' | 'carton' | 'shot' | 'oz' | 'cup' | 'can' | 'portion' | string;

export interface RecipeIngredient {
  inventoryItemId: string; // Links directly to InventoryItem.id
  name: string;
  nameAr?: string;
  portionQty: number;      // Quantity consumed per 1 order
  unit: MeasurementUnit;
  unitCost: number;        // QAR
  costPerPortion: number;  // portionQty * unitCost
}

export interface Recipe {
  productId: string;
  productName: string;
  prepInstructions?: string;
  ingredients: RecipeIngredient[];
  totalFoodCost: number;
  grossMarginPercent: number;
}

export interface Brand {
  id: BrandId;
  name: string;
  nameAr: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentHex: string;
  revenue: number;
  ordersCount: number;
  growth: number;
  iconName: string;
  pastelBg: string;
  accentColor: string;
}

export interface Branch {
  id: BranchId;
  name: string;
  nameAr: string;
  type: 'retail' | 'mall' | 'flagship' | 'pop-up' | 'commissary';
  city: string;
  isCommissary?: boolean;
}

export interface Product {
  id: string;
  brandId: BrandId;
  posUnitId: PosUnitId;
  name: string;
  nameAr: string;
  category: 'coffee' | 'tea' | 'desserts' | 'food' | 'beverages';
  categoryAr: string;
  price: number; // in QAR
  cost: number;  // in QAR
  prepTimeMinutes: number;
  image: string;
  description: string;
  inStock: boolean;
  calories?: number;
  portionUnit?: string;
  isPopular?: boolean;
  recipe?: Recipe;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  selectedModifiers?: string[];
}

export interface Order {
  id: string; // e.g. "1001"
  brandId: BrandId;
  branchId: BranchId;
  posUnitId: PosUnitId;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  status: 'Completed' | 'Pending' | 'Preparing';
  createdAt: Date;
  cashierName: string;
  tableNumber?: string;
  customerName?: string;
  deductedIngredientsSummary?: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  nameAr: string;
  brandIds: BrandId[];
  category: 'Beans & Leaves' | 'Dairy & Fresh' | 'Syrups & Flavors' | 'Packaging' | 'Proteins & Base' | 'Dry Goods';
  unit: MeasurementUnit;
  openingStock: number;
  purchased: number;
  used: number;
  closingStock: number; // System calculated theoretical stock
  actualClosingStock?: number; // Actual physical count manually entered by staff
  lastCountDate?: string;
  minReorderLevel: number;
  unitCost: number; // QAR
  location: BranchId;
  expiryDate: string; // YYYY-MM-DD (derived from received purchases)
  lastPurchaseRef?: string; // Purchase voucher or invoice reference
  batchNumber?: string;
  supplier: string;
  sourceInventoryItemId?: string;
}

export type DamageReason = 
  | 'Spoilage & Expired'
  | 'Dropped & Spilled'
  | 'Overcooked & Burned'
  | 'Crushed Packaging'
  | 'Prep Defect'
  | 'Temperature Abuse';

export interface DamagedInventoryRecord {
  id: string;
  inventoryItemId: string;
  itemName: string;
  itemNameAr: string;
  quantity: number;
  unit: MeasurementUnit;
  unitCost: number; // QAR
  totalFinancialLoss: number; // quantity * unitCost in QAR
  reason: DamageReason;
  branchId: BranchId;
  loggedBy: string;
  date: string;
  notes?: string;
  wasteType?: 'raw' | 'menu';
  productId?: string;
}

export interface InventoryTransferRecord {
  id: string;
  inventoryItemId: string;
  destinationItemId?: string;
  itemName: string;
  quantity: number;
  unit: MeasurementUnit;
  sourceBranchId: BranchId;
  destinationBranchId: BranchId;
  status: 'In Transit' | 'Received';
  sentAt: string;
  receivedAt?: string;
  receivedQuantity?: number;
  sentBy: string;
  receivedBy?: string;
}

export interface StaffConsumptionRecord {
  id: string;
  staffId: string;
  staffName: string;
  branchId: BranchId;
  posUnitId: PosUnitId;
  items: CartItem[];
  quantity: number;
  cost: number;
  loggedBy: string;
  createdAt: Date;
}

export type ExpenseCategory = 
  | 'Transport & Delivery Fuel'
  | 'Machine & Equipment Repairs'
  | 'Purchases Without Invoice (Cash)'
  | 'Small Things & Daily Supplies'
  | 'Utilities (Kahramaa)'
  | 'Cleaning & Sanitation'
  | 'Maintenance & Repairs'
  | 'Stationery & POS Paper'
  | 'Marketing & Ads'
  | 'Rent & Property'
  | 'Staff Uniforms'
  | 'Licenses & Government';

export interface ExpenseRecord {
  id: string;
  title: string;
  titleAr: string;
  category: ExpenseCategory;
  amount: number; // QAR
  date: string;
  branchId: BranchId;
  brandId?: BrandId;
  paidTo: string;
  paymentMethod: 'card' | 'bank-transfer' | 'petty-cash';
  receiptRef: string;
  loggedBy: string;
  hasInvoice?: boolean; // True if official invoice, False for cash/no-invoice purchase
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  expectedDelivery: string;
  quantityTotal: number;
  amount: number; // QAR
  status: 'Delivered' | 'Pending Approval' | 'Ordered' | 'Rejected';
  itemsSummary: string;
  branchDestination: BranchId;
  targetInventoryItemId?: string; // Associated inventory item SKU
  expiryDate?: string; // Batch expiry date recorded at time of purchase
  batchNumber?: string; // Supplier batch / lot number
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  location: BranchId;
  qidNumber: string;
  qidExpiry: string;
  foodHandlingExpiry: string;
  status: 'On Shift' | 'Break' | 'Off Duty';
  basicSalary: number;
  allowances: number;
  overtimeHours: number;
  hourlyOtRate: number;
  joinDate: string;
  phone: string;
}

export interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  role: string;
  location: BranchId;
  basicSalary: number;
  allowances: number;
  overtimeHours: number;
  overtimePay: number;
  deductions: number;
  netPay: number;
  bankIban: string;
  wpsStatus: 'Ready' | 'Processed' | 'Flagged';
}

export interface MenuEngineeringItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  volumeSold: number;
  profitMarginQar: number;
  classification: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
}
