import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  BrandId,
  BranchId,
  PosUnitId,
  UserRole,
  PosUnit,
  ViewMode,
  Product,
  CartItem,
  Order,
  InventoryItem,
  PurchaseOrder,
  StaffMember,
  ExpenseRecord,
  DamagedInventoryRecord,
  InventoryTransferRecord,
  StaffConsumptionRecord,
  StaffShift,
  StaffTimesheet,
} from '../types';
import {
  BRANDS,
  BRANCHES,
  POS_UNITS,
  INITIAL_ORDERS,
  INVENTORY_ITEMS,
  PURCHASE_ORDERS,
  STAFF_MEMBERS,
  INITIAL_EXPENSES,
  INITIAL_DAMAGED_GOODS,
  PRODUCTS,
} from '../data/mockData';

export interface RecipeDeductionNotice {
  orderId: string;
  items: { ingredientName: string; quantityDeducted: string; remainingStock: string }[];
}

const APP_SETTINGS_KEY = 'globalservices-app-settings-v1';
const getLocalDateKey = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};
interface SavedAppSettings {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  taxRate: number;
}

const loadAppSettings = (): SavedAppSettings => {
  const defaults: SavedAppSettings = { language: 'en', theme: 'light', soundEnabled: true, taxRate: 0 };
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = JSON.parse(window.localStorage.getItem(APP_SETTINGS_KEY) || '{}') as Partial<SavedAppSettings>;
    return {
      language: saved.language === 'ar' ? 'ar' : defaults.language,
      theme: saved.theme === 'dark' ? 'dark' : defaults.theme,
      soundEnabled: typeof saved.soundEnabled === 'boolean' ? saved.soundEnabled : defaults.soundEnabled,
      taxRate: typeof saved.taxRate === 'number' && saved.taxRate >= 0 && saved.taxRate <= 100 ? saved.taxRate : defaults.taxRate,
    };
  } catch {
    return defaults;
  }
};

interface AppContextType {
  // Navigation & Filters
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedBrand: BrandId | 'all';
  setSelectedBrand: (b: BrandId | 'all') => void;
  selectedBranch: BranchId | 'all';
  setSelectedBranch: (b: BranchId | 'all') => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  dateRange: string;
  setDateRange: (range: string) => void;

  // POS Unit Architecture & Role Login
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentPosUnitId: PosUnitId;
  setCurrentPosUnitId: (id: PosUnitId) => void;
  posUnits: PosUnit[];
  currentPosUnit: PosUnit;
  loginAsCashier: (unitId: PosUnitId) => void;
  loginAsAdmin: () => void;

  // Language & Theme
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  isRTL: boolean;
  t: (en: string, ar: string) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  saveAppSettings: () => boolean;
  designVariant: 'grove' | 'dune' | 'harbor';
  setDesignVariant: (variant: 'grove' | 'dune' | 'harbor') => void;

  // Sound & Audio feedback
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  playSound: (type: 'beep' | 'success' | 'bell' | 'bump') => void;

  // POS & Cart
  cart: CartItem[];
  addToCart: (product: Product, modifiers?: string[], notes?: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  // Orders
  orders: Order[];
  createOrder: (paymentMethod: 'cash' | 'card' | 'talabat' | 'snoonu', orderType: Order['orderType'], customerName?: string, tableNumber?: string) => Order;
  lastRecipeDeduction: RecipeDeductionNotice | null;
  clearLastRecipeDeduction: () => void;

  // Inventory & Recipes
  inventory: InventoryItem[];
  updateInventoryStock: (itemId: string, newClosingStock: number) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  updateActualClosingStock: (itemId: string, actualCount: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'> & { id?: string }) => InventoryItem;
  damagedGoods: DamagedInventoryRecord[];
  logDamagedStock: (record: Omit<DamagedInventoryRecord, 'id' | 'date'>) => void;
  inventoryTransfers: InventoryTransferRecord[];
  createInventoryTransfer: (inventoryItemId: string, destinationBranchId: BranchId, quantity: number) => boolean;
  receiveInventoryTransfer: (transferId: string, receivedQuantity: number, receivedBy: string) => boolean;
  staffConsumptionRecords: StaffConsumptionRecord[];
  createStaffConsumption: (staffId: string) => StaffConsumptionRecord | null;
  totalDamagedLoss: number;

  // Purchases & Expenses
  purchases: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status'], notes?: string) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  expenses: ExpenseRecord[];
  addExpense: (exp: Omit<ExpenseRecord, 'id'>) => void;
  totalExpenses: number;

  // Products & Menu
  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Staff
  staff: StaffMember[];
  addStaffMember: (member: Omit<StaffMember, 'id'>) => StaffMember;
  updateStaffMember: (id: string, updatedFields: Partial<StaffMember>) => void;
  updateStaffStatus: (staffId: string, status: StaffMember['status']) => void;
  staffShifts: StaffShift[];
  addStaffShift: (shift: Omit<StaffShift, 'id'>) => void;
  updateStaffShift: (id: string, updates: Partial<StaffShift>) => void;
  staffTimesheets: StaffTimesheet[];
  clockInStaff: (staffId: string, shiftId?: string) => void;
  clockOutStaff: (staffId: string) => void;
  reviewStaffTimesheet: (id: string) => void;

  // Sales Tracking & Live POS metrics
  totalTodaySales: number;
  totalMonthlySales: number;
  liveSessionSalesTotal: number;
  liveSessionOrdersCount: number;
  getBrandLiveMetrics: (brandId: BrandId) => { addedRevenue: number; addedOrdersCount: number };

  // Utilities
  activeCashier: string;
  formatCurrency: (amount: number) => string;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentViewInternal] = useState<ViewMode>('dashboard');
  const [selectedBrand, setSelectedBrand] = useState<BrandId | 'all'>('all');
  const [selectedBranch, setSelectedBranch] = useState<BranchId | 'all'>('west-walk');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>('Oct 1 - Oct 31, 2026');

  const toggleSidebar = () => {
    playSound('beep');
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Multi-POS Login state: 'admin' sees all modules & all POS; 'cashier' sees ONLY their unit's POS
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentPosUnitId, setCurrentPosUnitId] = useState<PosUnitId>('coffee-shop');

  const [initialSettings] = useState(loadAppSettings);
  const [language, setLanguage] = useState<'en' | 'ar'>(initialSettings.language);
  const [theme, setTheme] = useState<'light' | 'dark'>(initialSettings.theme);
  const [designVariant, setDesignVariant] = useState<'grove' | 'dune' | 'harbor'>('grove');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled);
  const [taxRate, setTaxRate] = useState<number>(initialSettings.taxRate);

  const saveAppSettings = () => {
    try {
      window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify({ language, theme, soundEnabled, taxRate }));
      return true;
    } catch {
      return false;
    }
  };

  // Data states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    [...INVENTORY_ITEMS].sort((a, b) => a.name.localeCompare(b.name))
  );
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [receivedPurchaseIds, setReceivedPurchaseIds] = useState<Set<string>>(
    () => new Set(PURCHASE_ORDERS.filter((po) => po.status === 'Delivered').map((po) => po.id))
  );
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [damagedGoods, setDamagedGoods] = useState<DamagedInventoryRecord[]>(INITIAL_DAMAGED_GOODS);
  const [inventoryTransfers, setInventoryTransfers] = useState<InventoryTransferRecord[]>([]);
  const [staffConsumptionRecords, setStaffConsumptionRecords] = useState<StaffConsumptionRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_MEMBERS);
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>([]);
  const [staffTimesheets, setStaffTimesheets] = useState<StaffTimesheet[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [lastRecipeDeduction, setLastRecipeDeduction] = useState<RecipeDeductionNotice | null>(null);

  const currentPosUnit = POS_UNITS.find((u) => u.id === currentPosUnitId) || POS_UNITS[0];
  const activeCashier = userRole === 'admin' ? 'Master Admin (HQ Group)' : currentPosUnit.operatorName;
  const isRTL = language === 'ar';

  // Role switching
  const loginAsCashier = (unitId: PosUnitId) => {
    playSound('beep');
    setUserRole('cashier');
    setCurrentPosUnitId(unitId);
    setCurrentViewInternal('pos');
    setCart([]);
  };

  const loginAsAdmin = () => {
    playSound('success');
    setUserRole('admin');
    setCurrentViewInternal('dashboard');
  };

  const setCurrentView = (view: ViewMode) => {
    // If logged in as cashier, lock navigation to 'pos' only
    if (userRole === 'cashier' && view !== 'pos') {
      playSound('bump');
      return;
    }
    setCurrentViewInternal(view);
  };

  // Sync theme & RTL with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);
  }, [theme, isRTL, language]);

  const toggleTheme = () => {
    playSound('beep');
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  // Web Audio Synthesizer
  const playSound = (type: 'beep' | 'success' | 'bell' | 'bump') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'bump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // AudioContext policy
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-QA', {
      maximumFractionDigits: 0,
    }).format(amount);
    return language === 'ar' ? `${formatted} ر.ق` : `QAR ${formatted}`;
  };

  // Cart operations
  const addToCart = (product: Product, modifiers: string[] = [], notes?: string) => {
    playSound('beep');
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && JSON.stringify(item.selectedModifiers) === JSON.stringify(modifiers)
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1, selectedModifiers: modifiers, notes }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    playSound('beep');
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    playSound('bump');
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTax = parseFloat((cartSubtotal * (taxRate / 100)).toFixed(2));
  const cartTotal = cartSubtotal + cartTax;

  // Create order with AUTOMATIC RECIPE STOCK DEPLETION
  const createOrder = (
    paymentMethod: 'cash' | 'card' | 'talabat' | 'snoonu',
    orderType: Order['orderType'] = 'dine-in',
    customerName: string = 'Walk-in Guest',
    tableNumber?: string
  ): Order => {
    const nextOrderNum = (1000 + orders.length + 1).toString();
    const effectiveBrand = cart[0]?.product.brandId || currentPosUnit.brandId;
    const effectiveBranch = selectedBranch === 'all' ? 'west-walk' : selectedBranch;

    // 1. Calculate Recipe Ingredient Depletions across all items in cart
    const recipeDeductionsMap = new Map<string, { name: string; totalQty: number; unit: string }>();
    const deductionLogs: { ingredientName: string; quantityDeducted: string; remainingStock: string }[] = [];

    cart.forEach((cartItem) => {
      const recipe = cartItem.product.recipe;
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach((ing) => {
          const usedAmt = ing.portionQty * cartItem.quantity;
          const branchStock = inventory.find((item) => item.location === effectiveBranch && item.sourceInventoryItemId === ing.inventoryItemId);
          const stockItemId = branchStock?.id || ing.inventoryItemId;
          const current = recipeDeductionsMap.get(stockItemId) || { name: ing.name, totalQty: 0, unit: ing.unit };
          current.totalQty += usedAmt;
          recipeDeductionsMap.set(stockItemId, current);
        });
      }
    });

    // 2. Deplete Inventory in real-time
    if (recipeDeductionsMap.size > 0) {
      setInventory((prevInv) =>
        prevInv.map((invItem) => {
          const deduction = recipeDeductionsMap.get(invItem.id);
          if (deduction) {
            const newUsed = parseFloat((invItem.used + deduction.totalQty).toFixed(3));
            const newClosing = Math.max(0, parseFloat((invItem.closingStock - deduction.totalQty).toFixed(3)));

            deductionLogs.push({
              ingredientName: invItem.name,
              quantityDeducted: `-${deduction.totalQty} ${deduction.unit}`,
              remainingStock: `${newClosing} ${invItem.unit}`,
            });

            return {
              ...invItem,
              used: newUsed,
              closingStock: newClosing,
            };
          }
          return invItem;
        })
      );

      setLastRecipeDeduction({
        orderId: nextOrderNum,
        items: deductionLogs,
      });
    }

    const deductedSummary = Array.from(recipeDeductionsMap.values()).map(
      (d) => `${d.name}: -${d.totalQty.toFixed(2)} ${d.unit}`
    );

    const newOrder: Order = {
      id: nextOrderNum,
      brandId: effectiveBrand,
      branchId: effectiveBranch,
      posUnitId: cart[0]?.product.posUnitId || currentPosUnitId,
      orderType,
      items: [...cart],
      subtotal: cartSubtotal,
      tax: cartTax,
      discount: 0,
      total: cartTotal,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'Completed',
      createdAt: new Date(),
      cashierName: activeCashier,
      customerName,
      tableNumber: tableNumber || (orderType === 'dine-in' ? 'Table 08' : undefined),
      deductedIngredientsSummary: deductedSummary,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setLastCreatedOrder(newOrder);

    // Audio chime & confetti
    playSound('success');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0D9488', '#14B8A6', '#F97316', '#A855F7'],
      });
    } catch {
      // ignore
    }

    return newOrder;
  };

  const clearLastRecipeDeduction = () => {
    setLastRecipeDeduction(null);
  };

  // Inventory operations
  const updateInventoryStock = (itemId: string, newClosingStock: number) => {
    playSound('beep');
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, closingStock: newClosingStock } : item))
    );
  };

  const updateInventoryItem = (itemId: string, updates: Partial<InventoryItem>) => {
    playSound('bell');
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const updateActualClosingStock = (itemId: string, actualCount: number) => {
    playSound('beep');
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              actualClosingStock: actualCount,
              lastCountDate: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'> & { id?: string }): InventoryItem => {
    playSound('success');
    const newItem: InventoryItem = {
      ...itemData,
      nameAr: itemData.nameAr || itemData.name,
      id: itemData.id || `inv-${Date.now()}`,
    };
    setInventory((prev) => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    return newItem;
  };

  const logDamagedStock = (record: Omit<DamagedInventoryRecord, 'id' | 'date'>) => {
    playSound('bump');
    const newRecord: DamagedInventoryRecord = {
      ...record,
      id: `DMG-${200 + damagedGoods.length + 1}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    if (record.wasteType === 'menu' && record.productId) {
      const product = products.find((item) => item.id === record.productId);
      const ingredientUse = new Map<string, number>();
      product?.recipe?.ingredients.forEach((ingredient) => {
        const branchStock = inventory.find((item) => item.location === record.branchId && item.sourceInventoryItemId === ingredient.inventoryItemId);
        const stockItemId = branchStock?.id || ingredient.inventoryItemId;
        ingredientUse.set(stockItemId, (ingredientUse.get(stockItemId) || 0) + ingredient.portionQty * record.quantity);
      });
      setInventory((prev) => prev.map((item) => {
        const amount = ingredientUse.get(item.id);
        return amount ? { ...item, used: item.used + amount, closingStock: Math.max(0, item.closingStock - amount) } : item;
      }));
    } else if (record.inventoryItemId) {
      setInventory((prev) => prev.map((item) => item.id === record.inventoryItemId
        ? { ...item, closingStock: Math.max(0, parseFloat((item.closingStock - record.quantity).toFixed(2))) }
        : item));
    }
    // 2. Append to damaged goods ledger (financial loss write-off)
    setDamagedGoods((prev) => [newRecord, ...prev]);
  };

  const createInventoryTransfer = (inventoryItemId: string, destinationBranchId: BranchId, quantity: number) => {
    const sourceItem = inventory.find((item) => item.id === inventoryItemId);
    if (!sourceItem || sourceItem.location !== 'main-store' || destinationBranchId === 'main-store' || quantity <= 0 || quantity > sourceItem.closingStock) return false;
    const record: InventoryTransferRecord = {
      id: `TRF-${300 + inventoryTransfers.length + 1}`,
      inventoryItemId,
      itemName: sourceItem.name,
      quantity,
      unit: sourceItem.unit,
      sourceBranchId: sourceItem.location,
      destinationBranchId,
      status: 'In Transit',
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sentBy: activeCashier,
    };
    setInventory((prev) => prev.map((item) => item.id === inventoryItemId ? { ...item, closingStock: item.closingStock - quantity } : item));
    setInventoryTransfers((prev) => [record, ...prev]);
    playSound('success');
    return true;
  };

  const receiveInventoryTransfer = (transferId: string, receivedQuantity: number, receivedBy: string) => {
    const transfer = inventoryTransfers.find((item) => item.id === transferId);
    const sourceItem = transfer && inventory.find((item) => item.id === transfer.inventoryItemId);
    if (!transfer || !sourceItem || transfer.status !== 'In Transit' || receivedQuantity <= 0 || receivedQuantity > transfer.quantity) return false;

    setInventory((prev) => {
      const matchingBatch = prev.find((item) =>
        item.location === transfer.destinationBranchId &&
        (item.sourceInventoryItemId === sourceItem.id || item.name === sourceItem.name) &&
        item.expiryDate === sourceItem.expiryDate &&
        item.batchNumber === sourceItem.batchNumber
      );
      if (matchingBatch) {
        return prev.map((item) => item.id === matchingBatch.id ? {
          ...item,
          sourceInventoryItemId: item.sourceInventoryItemId || sourceItem.id,
          closingStock: item.closingStock + receivedQuantity,
        } : item);
      }
      const destinationItem: InventoryItem = {
        ...sourceItem,
        id: `inv-transfer-${Date.now()}`,
        location: transfer.destinationBranchId,
        sourceInventoryItemId: sourceItem.id,
        openingStock: 0,
        purchased: 0,
        used: 0,
        closingStock: receivedQuantity,
        actualClosingStock: receivedQuantity,
      };
      return [...prev, destinationItem].sort((a, b) => a.name.localeCompare(b.name));
    });
    setInventoryTransfers((prev) => prev.map((item) => item.id === transferId ? {
      ...item,
      status: 'Received',
      receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      receivedQuantity,
      receivedBy,
    } : item));
    playSound('success');
    return true;
  };

  const createStaffConsumption = (staffId: string) => {
    const member = staff.find((item) => item.id === staffId);
    if (!member || cart.length === 0) return null;
    const ingredientUse = new Map<string, number>();
    cart.forEach((cartItem) => cartItem.product.recipe?.ingredients.forEach((ingredient) => {
      const branchStock = inventory.find((item) => item.location === member.location && item.sourceInventoryItemId === ingredient.inventoryItemId);
      const stockItemId = branchStock?.id || ingredient.inventoryItemId;
      ingredientUse.set(stockItemId, (ingredientUse.get(stockItemId) || 0) + ingredient.portionQty * cartItem.quantity);
    }));
    const deductions = Array.from(ingredientUse.entries());
    if (deductions.some(([id, amount]) => (inventory.find((item) => item.id === id)?.closingStock ?? 0) < amount)) return null;
    setInventory((prev) => prev.map((item) => {
      const amount = ingredientUse.get(item.id);
      return amount ? { ...item, used: item.used + amount, closingStock: Math.max(0, item.closingStock - amount) } : item;
    }));
    const record: StaffConsumptionRecord = {
      id: `SC-${500 + staffConsumptionRecords.length + 1}`,
      staffId,
      staffName: member.name,
      branchId: member.location,
      posUnitId: cart[0].product.posUnitId,
      items: [...cart],
      quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      cost: parseFloat(cart.reduce((sum, item) => sum + item.product.cost * item.quantity, 0).toFixed(2)),
      loggedBy: activeCashier,
      createdAt: new Date(),
    };
    setStaffConsumptionRecords((prev) => [record, ...prev]);
    setCart([]);
    playSound('success');
    return record;
  };

  const totalDamagedLoss = damagedGoods.reduce((sum, d) => sum + d.totalFinancialLoss, 0);

  // Purchases operations (Recording ordered goods with batch expiry tracking)
  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id'>) => {
    playSound('success');
    const newPo: PurchaseOrder = {
      ...poData,
      id: `PUR-${9200 + purchases.length + 1}`,
    };
    setPurchases((prev) => [newPo, ...prev]);

    // Automatically update or assign as new inventory item based on expiry!
    if (poData.targetInventoryItemId) {
      const isDelivered = poData.status === 'Delivered';
      if (isDelivered) {
        setReceivedPurchaseIds((prev) => new Set(prev).add(newPo.id));
      }
      setInventory((prev) => {
        const targetItem = prev.find((i) => i.id === poData.targetInventoryItemId);
        if (
          targetItem &&
          targetItem.expiryDate &&
          poData.expiryDate &&
          targetItem.expiryDate !== poData.expiryDate
        ) {
          // Different expiry date: Assign as a separate new inventory item!
          const baseName = targetItem.name
            .replace(/\s*\(Batch.*?\)/gi, '')
            .replace(/\s*\(Exp:.*?\)/gi, '')
            .trim();
          const batchSuffix = poData.batchNumber
            ? `(Batch ${poData.batchNumber} • Exp: ${poData.expiryDate})`
            : `(Exp: ${poData.expiryDate})`;
          const newBatchName = `${baseName} ${batchSuffix}`;

          const newBatchItem: InventoryItem = {
            ...targetItem,
            id: `inv-${Date.now()}`,
            name: newBatchName,
            nameAr: newBatchName,
            expiryDate: poData.expiryDate,
            batchNumber: poData.batchNumber || undefined,
            openingStock: 0,
            purchased: isDelivered ? poData.quantityTotal : 0,
            used: 0,
            closingStock: isDelivered ? poData.quantityTotal : 0,
            actualClosingStock: isDelivered ? poData.quantityTotal : undefined,
            lastPurchaseRef: poData.invoiceNumber || newPo.id,
          };
          newPo.targetInventoryItemId = newBatchItem.id;
          return [...prev, newBatchItem].sort((a, b) => a.name.localeCompare(b.name));
        }

        return prev.map((item) => {
          if (item.id === poData.targetInventoryItemId) {
            const newPurchased = isDelivered ? item.purchased + poData.quantityTotal : item.purchased;
            const newClosing = isDelivered ? item.closingStock + poData.quantityTotal : item.closingStock;
            return {
              ...item,
              expiryDate: poData.expiryDate || item.expiryDate,
              supplier: poData.supplier || item.supplier,
              batchNumber: poData.batchNumber || item.batchNumber,
              lastPurchaseRef: poData.invoiceNumber || newPo.id,
              purchased: newPurchased,
              closingStock: newClosing,
            };
          }
          return item;
        });
      });
    }
  };

  const updatePurchaseOrderStatus = (id: string, status: PurchaseOrder['status'], notes?: string) => {
    playSound(status === 'Rejected' ? 'bump' : 'bell');
    const existingPo = purchases.find((p) => p.id === id);

    // If marked Delivered and associated with an inventory SKU, sync stock & expiry
    const shouldReceive =
      existingPo &&
      status === 'Delivered' &&
      !receivedPurchaseIds.has(id) &&
      Boolean(existingPo.targetInventoryItemId);

    if (shouldReceive && existingPo?.targetInventoryItemId) {
      setReceivedPurchaseIds((prev) => new Set(prev).add(id));
      setInventory((prev) => {
        const targetItem = prev.find((i) => i.id === existingPo.targetInventoryItemId);
        if (
          targetItem &&
          targetItem.expiryDate &&
          existingPo.expiryDate &&
          targetItem.expiryDate !== existingPo.expiryDate
        ) {
          // Different expiry date: assign as a separate new inventory item
          const baseName = targetItem.name
            .replace(/\s*\(Batch.*?\)/gi, '')
            .replace(/\s*\(Exp:.*?\)/gi, '')
            .trim();
          const batchSuffix = existingPo.batchNumber
            ? `(Batch ${existingPo.batchNumber} • Exp: ${existingPo.expiryDate})`
            : `(Exp: ${existingPo.expiryDate})`;
          const newBatchName = `${baseName} ${batchSuffix}`;

          const newBatchItem: InventoryItem = {
            ...targetItem,
            id: `inv-${Date.now()}`,
            name: newBatchName,
            nameAr: newBatchName,
            expiryDate: existingPo.expiryDate,
            batchNumber: existingPo.batchNumber || undefined,
            openingStock: 0,
            purchased: existingPo.quantityTotal,
            used: 0,
            closingStock: existingPo.quantityTotal,
            actualClosingStock: existingPo.quantityTotal,
            lastPurchaseRef: existingPo.invoiceNumber || existingPo.id,
          };
          return [...prev, newBatchItem].sort((a, b) => a.name.localeCompare(b.name));
        }

        return prev.map((item) => {
          if (item.id === existingPo.targetInventoryItemId) {
            return {
              ...item,
              expiryDate: existingPo.expiryDate || item.expiryDate,
              batchNumber: existingPo.batchNumber || item.batchNumber,
              lastPurchaseRef: existingPo.invoiceNumber || existingPo.id,
              purchased: item.purchased + existingPo.quantityTotal,
              closingStock: item.closingStock + existingPo.quantityTotal,
            };
          }
          return item;
        });
      });
    }

    setPurchases((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          const now = new Date().toISOString().split('T')[0];
          return {
            ...po,
            status,
            notes: notes !== undefined ? notes : po.notes,
            ...(status === 'Ordered' || status === 'Delivered'
              ? {
                  approvedBy: po.approvedBy || 'Admin Manager',
                  approvalDate: po.approvalDate || now,
                }
              : status === 'Rejected'
              ? {
                  approvedBy: 'Admin (Rejected)',
                  approvalDate: now,
                }
              : {}),
          };
        }
        return po;
      })
    );
  };

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>) => {
    playSound('bell');
    setPurchases((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          const updatedPo = { ...po, ...updates };
          if (updatedPo.targetInventoryItemId && (updates.expiryDate || updates.batchNumber)) {
            setInventory((prevInv) =>
              prevInv.map((item) => {
                if (item.id === updatedPo.targetInventoryItemId) {
                  return {
                    ...item,
                    expiryDate: updates.expiryDate || item.expiryDate,
                    batchNumber: updates.batchNumber || item.batchNumber,
                  };
                }
                return item;
              })
            );
          }
          return updatedPo;
        }
        return po;
      })
    );
  };

  // Operating Expenses operations (non-stock purchases: Kahramaa, rent, maintenance, marketing, supplies)
  const addExpense = (expData: Omit<ExpenseRecord, 'id'>) => {
    playSound('success');
    const newExp: ExpenseRecord = {
      ...expData,
      id: `EXP-${100 + expenses.length + 1}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Staff operations
  const addStaffMember = (memberData: Omit<StaffMember, 'id'>): StaffMember => {
    playSound('success');
    const newMember: StaffMember = {
      ...memberData,
      id: `emp-${Date.now()}`,
    };
    setStaff((prev) => [newMember, ...prev]);
    return newMember;
  };

  const updateStaffMember = (id: string, updatedFields: Partial<StaffMember>) => {
    playSound('beep');
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  const updateStaffStatus = (staffId: string, status: StaffMember['status']) => {
    playSound('beep');
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, status } : s)));
  };

  const addStaffShift = (shiftData: Omit<StaffShift, 'id'>) => {
    const shift: StaffShift = { ...shiftData, id: `SHIFT-${Date.now()}` };
    setStaffShifts((prev) => [...prev, shift]);
    playSound('success');
  };

  const updateStaffShift = (id: string, updates: Partial<StaffShift>) => {
    setStaffShifts((prev) => prev.map((shift) => shift.id === id ? { ...shift, ...updates } : shift));
  };

  const clockInStaff = (staffId: string, shiftId?: string) => {
    const today = getLocalDateKey();
    const open = staffTimesheets.some((entry) => entry.staffId === staffId && !entry.clockOut);
    if (open) return;
    setStaffTimesheets((prev) => [{
      id: `TIME-${Date.now()}`, staffId, shiftId, date: today,
      clockIn: new Date().toISOString(), status: 'Open',
    }, ...prev]);
    updateStaffStatus(staffId, 'On Shift');
    playSound('success');
  };

  const clockOutStaff = (staffId: string) => {
    const open = staffTimesheets.find((entry) => entry.staffId === staffId && !entry.clockOut);
    if (!open) return;
    setStaffTimesheets((prev) => prev.map((entry) => entry.id === open.id
      ? { ...entry, clockOut: new Date().toISOString(), status: 'Pending Review' }
      : entry));
    updateStaffStatus(staffId, 'Off Duty');
    playSound('success');
  };

  const reviewStaffTimesheet = (id: string) => {
    setStaffTimesheets((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: 'Approved' } : entry));
    playSound('success');
  };

  // Products & Menu Recipe Operations
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    playSound('success');
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    playSound('beep');
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updatedFields };
          // If recipe ingredients changed, recalculate cost & gross margin
          if (updated.recipe && updated.recipe.ingredients) {
            const foodCost = updated.recipe.ingredients.reduce(
              (sum, ing) => sum + (ing.costPerPortion || 0),
              0
            );
            const margin = updated.price > 0
              ? Math.max(0, Math.round(((updated.price - foodCost) / updated.price) * 100))
              : 0;
            updated.cost = parseFloat(foodCost.toFixed(2));
            updated.recipe.totalFoodCost = updated.cost;
            updated.recipe.grossMarginPercent = margin;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    playSound('bump');
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Real-time sales calculations from POS activity
  const BASELINE_TODAY_SALES = 28450;
  const BASELINE_MONTHLY_SALES = 514650;

  const initialOrderIds = new Set(INITIAL_ORDERS.map((o) => o.id));
  const newOrdersPlaced = orders.filter((o) => !initialOrderIds.has(o.id));
  const liveSessionSalesTotal = newOrdersPlaced.reduce((sum, o) => sum + o.total, 0);
  const liveSessionOrdersCount = newOrdersPlaced.length;

  const totalTodaySales = BASELINE_TODAY_SALES + liveSessionSalesTotal;
  const totalMonthlySales = BASELINE_MONTHLY_SALES + liveSessionSalesTotal;

  const getBrandLiveMetrics = (brandId: BrandId) => {
    const brandNewOrders = newOrdersPlaced.filter((o) => o.brandId === brandId);
    const addedRevenue = brandNewOrders.reduce((sum, o) => sum + o.total, 0);
    const addedOrdersCount = brandNewOrders.length;
    return { addedRevenue, addedOrdersCount };
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedBrand,
        setSelectedBrand,
        selectedBranch,
        setSelectedBranch,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        dateRange,
        setDateRange,
        userRole,
        setUserRole,
        currentPosUnitId,
        setCurrentPosUnitId,
        posUnits: POS_UNITS,
        currentPosUnit,
        loginAsCashier,
        loginAsAdmin,
        language,
        setLanguage,
        isRTL,
        t,
        theme,
        toggleTheme,
        taxRate,
        setTaxRate,
        saveAppSettings,
        designVariant,
        setDesignVariant,
        soundEnabled,
        setSoundEnabled,
        playSound,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        orders,
        createOrder,
        lastRecipeDeduction,
        clearLastRecipeDeduction,
        inventory,
        updateInventoryStock,
        updateInventoryItem,
        updateActualClosingStock,
        addInventoryItem,
        damagedGoods,
        logDamagedStock,
        inventoryTransfers,
        createInventoryTransfer,
        receiveInventoryTransfer,
        staffConsumptionRecords,
        createStaffConsumption,
        totalDamagedLoss,
        purchases,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        updatePurchaseOrder,
        expenses,
        addExpense,
        totalExpenses,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        staff,
        addStaffMember,
        updateStaffMember,
        updateStaffStatus,
        staffShifts,
        addStaffShift,
        updateStaffShift,
        staffTimesheets,
        clockInStaff,
        clockOutStaff,
        reviewStaffTimesheet,
        totalTodaySales,
        totalMonthlySales,
        liveSessionSalesTotal,
        liveSessionOrdersCount,
        getBrandLiveMetrics,
        activeCashier,
        formatCurrency,
        lastCreatedOrder,
        setLastCreatedOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
