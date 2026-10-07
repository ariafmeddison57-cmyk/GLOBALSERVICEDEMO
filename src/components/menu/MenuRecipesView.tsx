import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Plus,
  Coffee,
  Flame,
  CakeSlice,
  Building2,
  Play,
  RotateCcw,
  Edit3,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BRANDS, POS_UNITS } from '../../data/mockData';
import { Product, PosUnitId, BrandId, RecipeIngredient } from '../../types';

interface PresetImage {
  name: string;
  url: string;
  category: string;
}

const PRESET_DISH_IMAGES: PresetImage[] = [
  {
    name: 'Specialty Latte',
    category: 'Coffee',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'V60 Drip Coffee',
    category: 'Coffee',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Truffle Loaded Fries',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Crispy Seasoned Fries',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Brown Sugar Boba',
    category: 'Tea & Boba',
    url: 'https://images.unsplash.com/photo-1558857563-b37cb3370be0?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Matcha Iced Latte',
    category: 'Tea & Boba',
    url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Croissant',
    category: 'Desserts',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Basque Cheesecake',
    category: 'Desserts',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Brioche Slider Burger',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cardamom Karak Chai',
    category: 'Tea',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Mocktail Cooler',
    category: 'Beverages',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  },
];

export const MenuRecipesView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    inventory,
    formatCurrency,
    t,
    setCurrentView,
    playSound,
  } = useApp();

  const [selectedBrandFilter, setSelectedBrandFilter] = useState<BrandId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0] || {} as Product);
  const [simulatedBatchSize, setSimulatedBatchSize] = useState<number>(25);

  // Modal State for Add / Edit Dish & Recipe
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [dishModalMode, setDishModalMode] = useState<'add' | 'edit'>('add');

  // Form State
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formCategory, setFormCategory] = useState<Product['category']>('coffee');
  const [formBrandId, setFormBrandId] = useState<BrandId>('kahwatee');
  const [formPosUnitId, setFormPosUnitId] = useState<PosUnitId>('coffee-shop');
  const [formPrice, setFormPrice] = useState<number>(26);
  const [formImage, setFormImage] = useState<string>(PRESET_DISH_IMAGES[0].url);
  const [formDescription, setFormDescription] = useState('');
  const [formPrepTime, setFormPrepTime] = useState<number>(3);
  const [formCalories, setFormCalories] = useState<number>(180);

  // Recipe BOM Ingredients State
  const [formIngredients, setFormIngredients] = useState<RecipeIngredient[]>([]);

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    setDishModalMode('add');
    setFormName('');
    setFormNameAr('');
    setFormCategory('coffee');
    setFormBrandId('kahwatee');
    setFormPosUnitId('coffee-shop');
    setFormPrice(28);
    setFormImage(PRESET_DISH_IMAGES[0].url);
    setFormDescription('Artisan specialty beverage crafted with single-origin beans and premium dairy.');
    setFormPrepTime(4);
    setFormCalories(210);

    // Default with 2 sample raw ingredients from inventory
    const defaultIng1 = inventory[0];
    const defaultIng2 = inventory[1];
    setFormIngredients([
      {
        inventoryItemId: defaultIng1?.id || 'raw-1',
        name: defaultIng1?.name || 'Specialty Coffee Beans',
        portionQty: 0.02,
        unit: (defaultIng1?.unit as any) || 'kg',
        unitCost: defaultIng1?.unitCost || 85,
        costPerPortion: parseFloat(((defaultIng1?.unitCost || 85) * 0.02).toFixed(2)),
      },
      {
        inventoryItemId: defaultIng2?.id || 'raw-2',
        name: defaultIng2?.name || 'Fresh Whole Milk',
        portionQty: 0.22,
        unit: (defaultIng2?.unit as any) || 'L',
        unitCost: defaultIng2?.unitCost || 8.5,
        costPerPortion: parseFloat(((defaultIng2?.unitCost || 8.5) * 0.22).toFixed(2)),
      },
    ]);

    setIsDishModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (prod: Product) => {
    setDishModalMode('edit');
    setFormName(prod.name);
    setFormNameAr(prod.nameAr);
    setFormCategory(prod.category);
    setFormBrandId(prod.brandId);
    setFormPosUnitId(prod.posUnitId);
    setFormPrice(prod.price);
    setFormImage(prod.image);
    setFormDescription(prod.description);
    setFormPrepTime(prod.prepTimeMinutes || 3);
    setFormCalories(prod.calories || 190);
    setFormIngredients(
      prod.recipe?.ingredients ? JSON.parse(JSON.stringify(prod.recipe.ingredients)) : []
    );
    setIsDishModalOpen(true);
  };

  // Handle Brand selection in Form -> automatically aligns default POS Unit
  const handleFormBrandChange = (brand: BrandId) => {
    setFormBrandId(brand);
    switch (brand) {
      case 'kahwatee':
        setFormPosUnitId('coffee-shop');
        setFormCategory('coffee');
        break;
      case 'kfries':
        setFormPosUnitId('restaurant');
        setFormCategory('food');
        break;
      case 'kboba':
        setFormPosUnitId('kboba');
        setFormCategory('tea');
        break;
      case 'kinda':
        setFormPosUnitId('kinda');
        setFormCategory('desserts');
        break;
      case 'events':
        setFormPosUnitId('events');
        setFormCategory('beverages');
        break;
    }
  };

  // Add raw ingredient to Recipe BOM
  const handleAddIngredientRow = () => {
    const raw = inventory[formIngredients.length % inventory.length] || inventory[0];
    const newIng: RecipeIngredient = {
      inventoryItemId: raw.id,
      name: raw.name,
      portionQty: 0.05,
      unit: raw.unit as any,
      unitCost: raw.unitCost,
      costPerPortion: parseFloat((raw.unitCost * 0.05).toFixed(2)),
    };
    setFormIngredients([...formIngredients, newIng]);
  };

  // Update ingredient in row
  const handleUpdateIngredientRow = (
    index: number,
    field: 'inventoryItemId' | 'portionQty',
    val: string | number
  ) => {
    const updated = [...formIngredients];
    if (field === 'inventoryItemId') {
      const selectedRaw = inventory.find((i) => i.id === val);
      if (selectedRaw) {
        updated[index].inventoryItemId = selectedRaw.id;
        updated[index].name = selectedRaw.name;
        updated[index].unit = selectedRaw.unit as any;
        updated[index].unitCost = selectedRaw.unitCost;
        updated[index].costPerPortion = parseFloat(
          (selectedRaw.unitCost * updated[index].portionQty).toFixed(2)
        );
      }
    } else if (field === 'portionQty') {
      const qty = parseFloat(val.toString()) || 0;
      updated[index].portionQty = qty;
      updated[index].costPerPortion = parseFloat((updated[index].unitCost * qty).toFixed(2));
    }
    setFormIngredients(updated);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  // Calculate total food cost & margin in modal
  const computedTotalFoodCost = parseFloat(
    formIngredients.reduce((sum, ing) => sum + (ing.costPerPortion || 0), 0).toFixed(2)
  );
  const computedGrossMargin =
    formPrice > 0
      ? Math.max(0, Math.round(((formPrice - computedTotalFoodCost) / formPrice) * 100))
      : 0;

  // Save Dish (Add or Edit)
  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const recipeData = {
      productId: '',
      productName: formName,
      prepInstructions: 'Standardized SOP recipe execution per K-OS group quality handbook.',
      ingredients: formIngredients,
      totalFoodCost: computedTotalFoodCost,
      grossMarginPercent: computedGrossMargin,
    };

    if (dishModalMode === 'add') {
      const newProd = addProduct({
        name: formName,
        nameAr: formNameAr || formName,
        category: formCategory,
        categoryAr:
          formCategory === 'coffee'
            ? 'قهوة'
            : formCategory === 'food'
            ? 'وجبات'
            : formCategory === 'desserts'
            ? 'حلويات'
            : formCategory === 'tea'
            ? 'شاي وبوبا'
            : 'مشروبات',
        brandId: formBrandId,
        posUnitId: formPosUnitId,
        price: formPrice,
        cost: computedTotalFoodCost,
        prepTimeMinutes: formPrepTime,
        image: formImage,
        description: formDescription,
        inStock: true,
        calories: formCalories,
        recipe: {
          ...recipeData,
          productId: `prod-temp`,
        },
      });
      setSelectedProduct(newProd);
    } else {
      updateProduct(selectedProduct.id, {
        name: formName,
        nameAr: formNameAr,
        category: formCategory,
        brandId: formBrandId,
        posUnitId: formPosUnitId,
        price: formPrice,
        cost: computedTotalFoodCost,
        prepTimeMinutes: formPrepTime,
        image: formImage,
        description: formDescription,
        calories: formCalories,
        recipe: {
          ...recipeData,
          productId: selectedProduct.id,
        },
      });
      setSelectedProduct({
        ...selectedProduct,
        name: formName,
        nameAr: formNameAr,
        category: formCategory,
        brandId: formBrandId,
        posUnitId: formPosUnitId,
        price: formPrice,
        cost: computedTotalFoodCost,
        prepTimeMinutes: formPrepTime,
        image: formImage,
        description: formDescription,
        calories: formCalories,
        recipe: {
          ...recipeData,
          productId: selectedProduct.id,
        },
      });
    }

    setIsDishModalOpen(false);
  };

  const handleDeleteDish = (id: string) => {
    if (confirm(t('Are you sure you want to remove this dish from the menu?', 'هل أنت متأكد من حذف هذا الصنف من القائمة؟'))) {
      deleteProduct(id);
      const remaining = products.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setSelectedProduct(remaining[0]);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrandFilter === 'all' || p.brandId === selectedBrandFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.includes(searchQuery);
    return matchesBrand && matchesSearch;
  });

  // Calculate live stock portions possible for a product based on its BOM
  const calculatePortionsPossible = (product: Product) => {
    if (!product.recipe || !product.recipe.ingredients || product.recipe.ingredients.length === 0) return 999;
    const portionsPerIngredient = product.recipe.ingredients.map((ing) => {
      const invItem = inventory.find((i) => i.id === ing.inventoryItemId);
      if (!invItem || ing.portionQty === 0) return 999;
      return Math.floor(invItem.closingStock / ing.portionQty);
    });
    return Math.min(...portionsPerIngredient);
  };

  // Current active product fallback
  const activeProduct = products.find((p) => p.id === selectedProduct.id) || products[0] || selectedProduct;

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t('Menu & Recipe Engineering (BOM)', 'قائمة الأطعمة وهندسة الوصفات')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-0.5">
              {t(
                'Add dishes, upload photos, and connect recipe ingredients directly to raw inventory items consumed upon POS sale.',
                'إضافة أطباق جديدة، تعديل الصور والوصفات وربطها بالمخزون المستهلك عند البيع بالكاشير.'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('inventory')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 transition-colors border border-zinc-200 dark:border-neutral-700"
          >
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>{t('Go to Inventory Stock Table →', 'الذهاب لجدول المخزون ←')}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('+ Add New Dish / Recipe', '+ إضافة طبق ووصفة جديدة')}</span>
          </button>
        </div>
      </div>

      {/* 2. Brand Filter Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedBrandFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedBrandFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-zinc-600 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-800'
            }`}
          >
            {t('All Brands', 'كافة العلامات')}
          </button>
          {BRANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrandFilter(b.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedBrandFilter === b.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'bg-white dark:bg-neutral-900 text-zinc-600 dark:text-neutral-400 border border-zinc-200 dark:border-neutral-800'
              }`}
            >
              {t(b.name, b.nameAr)}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search recipes...', 'بحث في الوصفات...')}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* 3. Main Content: Left Recipe List, Right Detailed BOM & Stock Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Product List */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-zinc-200/80 dark:border-neutral-800 p-4 space-y-2 h-[680px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {filteredProducts.length} {t('Menu Items in Catalog', 'صنف في القائمة')}
            </span>
            <button
              onClick={handleOpenAddModal}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Add Dish', 'إضافة صنف')}</span>
            </button>
          </div>

          {filteredProducts.map((p) => {
            const isSelected = activeProduct.id === p.id;
            const brand = BRANDS.find((b) => b.id === p.brandId);
            const portionsCanMake = calculatePortionsPossible(p);

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-100/80 dark:bg-neutral-800 border-slate-900 dark:border-white shadow-xs ring-1 ring-slate-900/10'
                    : 'bg-zinc-50/50 dark:bg-neutral-800/40 border-transparent hover:bg-zinc-100/80 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {t(p.name, p.nameAr)}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-zinc-400">
                          {brand?.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-neutral-700 text-zinc-700 dark:text-neutral-300 font-mono">
                          {p.recipe?.ingredients.length || 0} BOM SKUs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-mono block">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Food Cost: {formatCurrency(p.cost)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-200/50 dark:border-neutral-700/50 text-[11px]">
                  <span className="text-zinc-500 dark:text-neutral-400">
                    {t('Current Stock Can Make:', 'المخزون الحالي يكفي:')}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {portionsCanMake.toLocaleString()} {t('portions', 'وجبة')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Cols: Detailed Bill of Materials (BOM) & Inventory Depletion Simulator */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-zinc-200/80 dark:border-neutral-800 p-6 flex flex-col justify-between">
          <div>
            {/* Top Product Meta & Action Bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-4">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-zinc-200 dark:border-neutral-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                      {t(activeProduct.name, activeProduct.nameAr)}
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                      {activeProduct.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-neutral-400 mt-0.5 max-w-md">
                    {activeProduct.description}
                  </p>
                </div>
              </div>

              {/* Price & Quick Edit / Delete Buttons */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 text-center border border-zinc-200 dark:border-neutral-700">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    {t('Selling Price', 'سعر البيع')}
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                    {formatCurrency(activeProduct.price)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 text-center border border-zinc-200 dark:border-neutral-700">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                    {t('Gross Margin', 'هامش الربح')}
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {activeProduct.recipe?.grossMarginPercent || 78}%
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(activeProduct)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title={t('Edit Recipe & Details', 'تعديل الصنف والوصفة')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('Edit Dish', 'تعديل')}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDish(activeProduct.id)}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title={t('Delete Dish', 'حذف الصنف')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('Delete', 'حذف')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bill of Materials (BOM) Table */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
                  {t('Recipe Ingredients & Live Inventory Stock', 'مكونات الوصفة ورصيد المخزون المباشر')}
                </h4>
                <button
                  onClick={() => handleOpenEditModal(activeProduct)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('Edit Ingredients / Add SKU', 'تعديل المكونات')}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <th className="py-2.5 px-3">{t('Ingredient SKU', 'المكون')}</th>
                      <th className="py-2.5 px-3">{t('Portion Qty', 'الكمية للطلب')}</th>
                      <th className="py-2.5 px-3">{t('Portion Cost', 'تكلفة الكمية')}</th>
                      <th className="py-2.5 px-3">{t('Live Warehouse Stock', 'المخزون الحالي')}</th>
                      <th className="py-2.5 px-3 text-right">{t('Max Possible', 'الحد الأقصى')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 font-medium">
                    {activeProduct.recipe?.ingredients && activeProduct.recipe.ingredients.length > 0 ? (
                      activeProduct.recipe.ingredients.map((ing, idx) => {
                        const invItem = inventory.find((i) => i.id === ing.inventoryItemId);
                        const currentClosing = invItem ? invItem.closingStock : 0;
                        const maxPortions = ing.portionQty > 0 ? Math.floor(currentClosing / ing.portionQty) : 0;
                        const isLow = invItem && invItem.closingStock <= invItem.minReorderLevel;

                        return (
                          <tr key={idx} className="hover:bg-zinc-50/80 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                              {ing.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {ing.portionQty} {ing.unit}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-neutral-200">
                              {formatCurrency(ing.costPerPortion)}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  isLow
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                                    : 'bg-zinc-100 text-zinc-700 dark:bg-neutral-800 dark:text-neutral-300'
                                }`}
                              >
                                {currentClosing} {invItem?.unit || ing.unit}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {maxPortions.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-zinc-400">
                          {t('No recipe ingredients configured yet.', 'لم يتم إضافة مكونات للوصفة بعد.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Recipe Summary */}
            <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500 dark:text-neutral-400">
                  {t('Total Portioned Food Cost:', 'إجمالي تكلفة المكونات:')}
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white ml-2 font-mono">
                  {formatCurrency(activeProduct.recipe?.totalFoodCost || activeProduct.cost)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 dark:text-neutral-400">
                  {t('Target Food Cost Ratio:', 'نسبة التكلفة المستهدفة:')}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-2 font-mono">
                  {activeProduct.price > 0
                    ? (((activeProduct.recipe?.totalFoodCost || activeProduct.cost) / activeProduct.price) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Batch Production & Stock Depletion Simulator */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {t('Batch Production & POS Simulation', 'محاكاة إنتاج دفعة واستهلاك المواد')}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{t('Simulate quantity:', 'محاكاة عدد:')}</span>
                {[10, 25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSimulatedBatchSize(qty)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      simulatedBatchSize === qty
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 text-xs">
              <p className="font-semibold text-slate-800 dark:text-neutral-200 mb-2">
                {t(
                  `If ${simulatedBatchSize} orders of ${activeProduct.name} are sold in POS:`,
                  `عند بيع ${simulatedBatchSize} طلب من هذا الصنف في الكاشير:`
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                {activeProduct.recipe?.ingredients && activeProduct.recipe.ingredients.length > 0 ? (
                  activeProduct.recipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-neutral-900 p-2 rounded-xl border border-slate-200 dark:border-neutral-800"
                    >
                      <span className="text-zinc-500 block truncate">{ing.name.split(' ')[0]}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        -{(ing.portionQty * simulatedBatchSize).toFixed(2)} {ing.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-400 text-xs">No ingredients in BOM</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL: Add / Edit Dish & Recipe BOM */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  {dishModalMode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {dishModalMode === 'add'
                      ? t('Add New Menu Dish & Recipe BOM', 'إضافة طبق ووصفة جديدة للقائمة')
                      : t('Edit Menu Dish & Recipe BOM', 'تعديل الصنف ووصفة التحضير')}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-neutral-400">
                    {t(
                      'This dish will immediately appear in the station POS and deplete linked inventory upon checkout.',
                      'سيظهر الصنف فورياً في شاشات نقاط البيع وسيخصم مكونات المخزون فورياً عند الدفع.'
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-neutral-200 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDish} className="space-y-6 mt-5">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Dish Name (English)', 'اسم الطبق (إنجليزي)')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Specialty Truffle Burger"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Dish Name (Arabic)', 'اسم الطبق (عربي)')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: برجر الترفل الفاخر"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Brand, Category & Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Brand & Station Assignment', 'العلامة ومحطة الكاشير')}
                  </label>
                  <select
                    value={formBrandId}
                    onChange={(e) => handleFormBrandChange(e.target.value as BrandId)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  >
                    <option value="kahwatee">Kahwatee (Coffee Shop)</option>
                    <option value="kfries">K-Fries (Restaurant)</option>
                    <option value="kboba">K-Boba (Boba Station)</option>
                    <option value="kinda">Kinda (Bakery & Desserts)</option>
                    <option value="events">Events (Events & Catering)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Menu Category', 'التصنيف في القائمة')}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  >
                    <option value="coffee">{t('Coffee', 'قهوة')}</option>
                    <option value="tea">{t('Tea & Boba', 'شاي وبوبا')}</option>
                    <option value="food">{t('Food & Meals', 'وجبات وأطباق')}</option>
                    <option value="desserts">{t('Desserts & Bakery', 'حلويات ومخبوزات')}</option>
                    <option value="beverages">{t('Beverages & Refreshers', 'مشروبات وعصائر')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                    {t('Selling Price (QAR)', 'سعر البيع (ر.ق)')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
              </div>

              {/* Photo Preset Gallery & Custom URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-2">
                  {t('Select Dish Photo (High Resolution Presets or Custom URL)', 'اختر صورة الطبق (نماذج جاهزة عالية الدقة أو رابط)')}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_DISH_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                        formImage === preset.url
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-95 shadow-md'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                        {preset.name}
                      </div>
                      {formImage === preset.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-semibold">{t('Or Custom URL:', 'أو رابط مخصص:')}</span>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-neutral-300 mb-1">
                  {t('Dish Description', 'وصف الطبق')}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredients highlights, allergens, and flavor profile..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>

              {/* Bill of Materials (BOM) Recipe Builder */}
              <div className="pt-4 border-t border-zinc-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200">
                      {t('Bill of Materials (BOM) — Linked Inventory Raw SKUs', 'مصفوفة المواد (BOM) — ربط الأصناف الخام بالمخزون')}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {t(
                        'Whenever this dish is rung up in POS, these raw materials are automatically subtracted from inventory.',
                        'عند بيع هذا الصنف في الكاشير سيتم خصم هذه المواد تلقائياً من رصيد المستودع.'
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('Add Raw Ingredient', 'إضافة مادة خام')}</span>
                  </button>
                </div>

                {/* Ingredients Rows */}
                <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                  {formIngredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-800/80 border border-zinc-200/80 dark:border-neutral-700"
                    >
                      <div className="flex-1 min-w-[180px]">
                        <select
                          value={ing.inventoryItemId}
                          onChange={(e) => handleUpdateIngredientRow(idx, 'inventoryItemId', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-none"
                        >
                          {inventory.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} ({inv.closingStock} {inv.unit} in stock @ QAR {inv.unitCost}/{inv.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          min="0.001"
                          value={ing.portionQty}
                          onChange={(e) => handleUpdateIngredientRow(idx, 'portionQty', e.target.value)}
                          className="w-full text-xs font-mono px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-center"
                        />
                      </div>

                      <span className="text-xs font-bold text-zinc-500 w-10">
                        {ing.unit}
                      </span>

                      <div className="text-right w-24 font-mono text-xs font-bold text-slate-800 dark:text-neutral-200">
                        = {formatCurrency(ing.costPerPortion)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Dynamic Food Cost & Margin Preview */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-neutral-400 block">
                      {t('Calculated Total Food Cost (BOM):', 'تكلفة المواد الإجمالية للطبق:')}
                    </span>
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                      {formatCurrency(computedTotalFoodCost)}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500 dark:text-neutral-400 block">
                      {t('Gross Profit Margin:', 'هامش الربح الإجمالي:')}
                    </span>
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {computedGrossMargin}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500 dark:text-neutral-400 block">
                      {t('Estimated Gross Profit per Dish:', 'الربح الإجمالي المقدر للطبق:')}
                    </span>
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                      {formatCurrency(Math.max(0, formPrice - computedTotalFoodCost))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-neutral-700 text-xs font-bold text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {t('Cancel', 'إلغاء')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {dishModalMode === 'add'
                      ? t('Publish Dish & Save Recipe', 'نشر الطبق وحفظ الوصفة')
                      : t('Update Dish & Recipe', 'تحديث الصنف والوصفة')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
