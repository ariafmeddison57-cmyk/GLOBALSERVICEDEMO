import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Bike,
  Sparkles,
  CheckCircle2,
  Printer,
  ArrowRight,
  Clock,
  Flame,
  Coffee,
  X,
  UtensilsCrossed,
  Tag,
  Receipt,
  Boxes,
  ChefHat,
  CakeSlice,
  Building2,
  Lock,
  Unlock,
  Layers,
  Store,
  Tablet,
  Monitor,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANDS, BRANCHES, POS_UNITS } from '../../data/mockData';
import { PosUnitId, OrderType, Product, Order } from '../../types';

export const POSView: React.FC = () => {
  const {
    userRole,
    currentPosUnitId,
    setCurrentPosUnitId,
    currentPosUnit,
    posUnits,
    loginAsCashier,
    loginAsAdmin,
    activeCashier,
    products,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    createOrder,
    lastRecipeDeduction,
    clearLastRecipeDeduction,
    formatCurrency,
    t,
    language,
    setCurrentView,
    isRTL,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>('Table 05');
  const [customerName, setCustomerName] = useState<string>('');
  const [completedOrderModal, setCompletedOrderModal] = useState<Order | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState<boolean>(false);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [inspectingRecipeProduct, setInspectingRecipeProduct] = useState<Product | null>(null);

  // Tablet Optimization: Cart Drawer toggle for tablet viewports
  const [isTabletCartOpen, setIsTabletCartOpen] = useState<boolean>(false);
  const [tabletLayoutMode, setTabletLayoutMode] = useState<'responsive' | 'tablet-station'>('responsive');

  // Admin filter: when admin, can view all units or filter by specific unit
  const [adminPosFilter, setAdminPosFilter] = useState<PosUnitId | 'all'>('all');

  const effectiveUnitFilter = userRole === 'admin' ? adminPosFilter : currentPosUnitId;

  const filteredProducts = products.filter((p) => {
    const matchesUnit = effectiveUnitFilter === 'all' || p.posUnitId === effectiveUnitFilter;
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUnit && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All Items', nameAr: 'كافة الأصناف', icon: UtensilsCrossed },
    { id: 'coffee', name: 'Coffee', nameAr: 'قهوة', icon: Coffee },
    { id: 'tea', name: 'Tea & Boba', nameAr: 'شاي وبوبا', icon: Sparkles },
    { id: 'desserts', name: 'Desserts & Pastry', nameAr: 'حلويات ومخبوزات', icon: CakeSlice },
    { id: 'food', name: 'Food & Loaded Fries', nameAr: 'وجبات وبطاطس', icon: Flame },
    { id: 'beverages', name: 'Beverages', nameAr: 'مشروبات', icon: Coffee },
  ];

  const handleCheckout = (method: 'cash' | 'card' | 'talabat' | 'snoonu') => {
    if (cart.length === 0) return;
    if (method === 'cash') {
      setCashTendered(cartTotal);
      setIsCashModalOpen(true);
      return;
    }
    const order = createOrder(method, orderType, customerName || undefined, tableNumber);
    setCompletedOrderModal(order);
    setIsTabletCartOpen(false);
  };

  const finalizeCashPayment = () => {
    setIsCashModalOpen(false);
    const order = createOrder('cash', orderType, customerName || undefined, tableNumber);
    setCompletedOrderModal(order);
    setIsTabletCartOpen(false);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-neutral-950 font-sans select-none overflow-hidden">
      {/* 1. TOP POS STATION BAR (Compact, Tablet-Friendly, Refined Slate Theme) */}
      <div className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 px-4 sm:px-6 py-2.5 shrink-0 z-10">
        <div className="flex items-center justify-between gap-3">
          {/* Active Terminal Brand & Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-neutral-100 truncate">
                  {userRole === 'admin'
                    ? adminPosFilter === 'all'
                      ? t('All 5 Units POS (HQ Admin)', 'كافة نقاط البيع للمجموعة')
                      : `${posUnits.find((u) => u.id === adminPosFilter)?.name} (Admin)`
                    : currentPosUnit.name}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                {t('Cashier:', 'الكاشير:')} <span className="font-semibold text-slate-800 dark:text-neutral-200">{activeCashier}</span> • {t('Terminal:', 'الجهاز:')} {userRole === 'admin' ? 'HUB-MASTER' : currentPosUnit.terminalId}
              </p>
            </div>
          </div>

          {/* Unit Switcher or Tablet Layout Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tablet Mode Helper Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-neutral-800 text-[11px] text-slate-600 dark:text-neutral-400 font-semibold border border-slate-200 dark:border-neutral-700">
              <Tablet className="w-3.5 h-3.5" />
              <span>10" Tablet Ready</span>
            </div>

            {/* Admin Filter Tabs */}
            {userRole === 'admin' ? (
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 overflow-x-auto max-w-[280px] sm:max-w-none">
                <button
                  onClick={() => setAdminPosFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    adminPosFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400'
                  }`}
                >
                  {t('All', 'الكل')}
                </button>
                {posUnits.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setAdminPosFilter(u.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      adminPosFilter === u.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    {u.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={loginAsAdmin}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-neutral-700"
              >
                <Unlock className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('Admin', 'المدير')}</span>
              </button>
            )}

            {/* Tablet Cart Toggle Button (Visible on tablet/mobile screens) */}
            <button
              onClick={() => setIsTabletCartOpen(!isTabletCartOpen)}
              className="xl:hidden relative px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{formatCurrency(cartTotal)}</span>
              {totalCartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL CATEGORY SCROLL STRIP (Optimized for 10-inch tablets so width is not eaten by a sidebar) */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-manipulation ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-neutral-800/80 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t(cat.name, cat.nameAr)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN POS WORKSPACE: Center Product Grid + Right Adaptive Cart Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Product Catalog Center Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-neutral-950 overflow-hidden">
          {/* Fast Search & Catalog Count Bar */}
          <div className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search products or ingredients...', 'بحث في الأصناف أو المكونات...')}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 font-semibold shrink-0">
              {filteredProducts.length} {t('items available', 'صنف متاح')}
            </div>
          </div>

          {/* Touch-Friendly Responsive Grid (2 cols on small tablet, 3-4 cols on 10" tablet, 4-5 on desktop) */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const brand = BRANDS.find((b) => b.id === product.brandId);
                const hasRecipe = product.recipe && product.recipe.ingredients.length > 0;
                const inCartItem = cart.find((c) => c.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-slate-400 dark:hover:border-neutral-600 transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.98] touch-manipulation"
                  >
                    <div>
                      {/* Product Photo */}
                      <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                            {brand?.name}
                          </span>
                        </div>
                        {product.isPopular && (
                          <div className="absolute top-2 right-2">
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-extrabold uppercase">
                              ★ HOT
                            </span>
                          </div>
                        )}
                        {inCartItem && (
                          <div className="absolute bottom-2 right-2">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center shadow-md">
                              {inCartItem.quantity}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="p-3">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight line-clamp-1">
                          {t(product.name, product.nameAr)}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-1">
                          {product.description}
                        </p>

                        {/* BOM Recipe link button */}
                        {hasRecipe && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingRecipeProduct(product);
                              }}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                            >
                              <ChefHat className="w-3 h-3" />
                              <span>{t('BOM Stock Recipe', 'مكونات الوصفة')}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {product.prepTimeMinutes}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Instant Touch Add */}
                    <div className="p-3 pt-0 flex items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrency(product.price)}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 flex items-center justify-center font-bold shadow-xs active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. CART PANEL: Fixed on Desktop (xl:flex), Modal Slide-Out Drawer on Tablets */}
        <div
          className={`
            fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-neutral-900 border-l border-slate-200 dark:border-neutral-800 flex flex-col justify-between shadow-2xl transition-transform duration-200
            xl:static xl:translate-x-0 xl:shadow-none xl:w-84 2xl:w-96
            ${isTabletCartOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
          `}
        >
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-neutral-100">
                  {t('Station Order', 'طلب المحطة')}
                </h3>
                {totalCartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[10px] font-bold">
                    {totalCartCount} items
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    {t('Clear', 'إفراغ')}
                  </button>
                )}
                {/* Close Drawer button for tablet view */}
                <button
                  onClick={() => setIsTabletCartOpen(false)}
                  className="xl:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Order Type Selector Pills */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
              {(['dine-in', 'takeaway', 'talabat'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 rounded-lg capitalize transition-all ${
                    orderType === type
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400'
                  }`}
                >
                  {type === 'dine-in' ? t('Dine-In', 'محلي') : type === 'takeaway' ? t('Takeaway', 'سفري') : 'Talabat'}
                </button>
              ))}
            </div>

            {/* Table / Customer quick fields */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Table / Spot"
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100"
              />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-800">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Receipt className="w-10 h-10 stroke-[1.2] mb-2 text-slate-300 dark:text-neutral-700" />
                <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                  {t('No items in cart', 'السلة فارغة')}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                  {t('Tap menu dishes to add and trigger live recipe stock deduction.', 'المس الأصناف لإضافتها واستهلاك المخزون فورياً.')}
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 first:pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-neutral-100 truncate">
                        {t(item.product.name, item.product.nameAr)}
                      </h5>
                      <span className="text-[11px] font-mono text-slate-500">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-black text-xs text-slate-900 dark:text-neutral-100 font-mono">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-0.5 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-neutral-700 flex items-center justify-center text-slate-700 dark:text-neutral-200 hover:bg-slate-200 shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-neutral-700 flex items-center justify-center text-slate-700 dark:text-neutral-200 hover:bg-slate-200 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Bottom Summary & Payment Buttons */}
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-neutral-800/60 border-t border-slate-200 dark:border-neutral-800 space-y-2.5">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-neutral-400">
                <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                <span className="font-bold text-slate-800 dark:text-neutral-200 font-mono">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-neutral-700">
                <span>{t('Total Due', 'الإجمالي المستحق')}</span>
                <span className="font-mono text-slate-950 dark:text-white">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* High-Contrast Tender Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout('cash')}
                className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all touch-manipulation"
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>{t('Cash', 'نقداً')}</span>
              </button>

              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout('card')}
                className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all touch-manipulation"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('Card (POS)', 'بطاقة')}</span>
              </button>

              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout('talabat')}
                className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all touch-manipulation"
              >
                <Bike className="w-4 h-4" />
                <span>Talabat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button for Tablet/Mobile if drawer is closed and items exist */}
      {!isTabletCartOpen && totalCartCount > 0 && (
        <div className="xl:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setIsTabletCartOpen(true)}
            className="px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 font-extrabold text-xs shadow-2xl flex items-center gap-2.5 active:scale-95 transition-all border border-slate-700"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{totalCartCount} {t('Items in Cart', 'عناصر')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-mono text-amber-300 dark:text-amber-600">{formatCurrency(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* 5. ORDER CREATED MODAL (with live BOM depletion notification) */}
      {completedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2.5">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-neutral-100">
                {t(`Order #${completedOrderModal.id} Processed`, `تم تنفيذ الطلب #${completedOrderModal.id}`)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                {t('Settled via', 'طريقة الدفع:')} <strong className="uppercase">{completedOrderModal.paymentMethod}</strong> • {formatCurrency(completedOrderModal.total)}
              </p>
            </div>

            {/* LIVE RECIPE STOCK DEPLETION NOTICE */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-slate-900 dark:text-neutral-100 font-bold text-xs mb-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{t('Live Inventory Stock Deducted via BOM Recipe:', 'المكونات المخصومة من المخزون فورياً:')}</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {lastRecipeDeduction?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-neutral-800">
                    <span className="font-semibold text-slate-800 dark:text-neutral-200">{item.ingredientName}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{item.quantityDeducted}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
                {t('Inventory closing stock updated with zero manual paperwork.', 'تم تحديث رصيد المخزون التلقائي دون معاملات ورقية.')}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => {
                  setCompletedOrderModal(null);
                  setCurrentView('inventory');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Boxes className="w-4 h-4" />
                <span>{t('Check Inventory Stock →', 'فحص المخزون ←')}</span>
              </button>

              <button
                onClick={() => setCompletedOrderModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold"
              >
                {t('Next Order', 'الطلب التالي')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. BOM RECIPE INSPECTOR MODAL */}
      {inspectingRecipeProduct && inspectingRecipeProduct.recipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-neutral-100">
                    {inspectingRecipeProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    {t('Bill of Materials (BOM) & Inventory Stock Link', 'مكونات الطبق والربط بالمستودع')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingRecipeProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                <span>{t('Ingredient', 'المكون')}</span>
                <span>{t('Per Portion', 'لكل وجبة')}</span>
                <span>{t('Portion Cost', 'التكلفة')}</span>
              </div>
              {inspectingRecipeProduct.recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-800 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-neutral-100">{ing.name}</span>
                  <span className="font-mono text-slate-600 dark:text-neutral-300">
                    {ing.portionQty} {ing.unit}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {formatCurrency(ing.costPerPortion)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">{t('Food Cost:', 'تكلفة الطعام:')}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-1 font-mono">
                  {formatCurrency(inspectingRecipeProduct.recipe.totalFoodCost)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">{t('Gross Margin:', 'هامش الربح:')}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 ml-1 font-mono">
                  {inspectingRecipeProduct.recipe.grossMarginPercent}%
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectingRecipeProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold"
              >
                {t('Close', 'إغلاق')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CASH TENDER MODAL */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-neutral-800">
            <h3 className="text-base font-black text-slate-900 dark:text-neutral-100 text-center mb-1">
              {t('Cash Payment Tender', 'دفع نقدي')}
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              {t('Amount Due:', 'المبلغ المستحق:')} <strong className="text-slate-900 dark:text-neutral-100">{formatCurrency(cartTotal)}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400">{t('Cash Received (QAR):', 'المبلغ المستلم:')}</label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full mt-1 p-3 text-lg font-bold font-mono rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center"
                />
              </div>

              {cashTendered >= cartTotal && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-center">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">{t('Change to Return:', 'المتبقي للعميل:')}</span>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatCurrency(cashTendered - cartTotal)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-neutral-300"
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={finalizeCashPayment}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold"
              >
                {t('Confirm Payment', 'تأكيد الدفع')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
