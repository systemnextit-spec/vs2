import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Plus, Upload, Youtube, Bold, Italic, Underline, AlignLeft, AlignRight, List, ListOrdered, Image, Link, Type, Calendar, Scan, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, Category, SubCategory, ChildCategory, Brand, Tag } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';
import { uploadImageToServer, uploadAndSaveToGallery, saveToGallery } from '../../services/imageUploadService';
import { GalleryPicker } from '../GalleryPicker';
import { RichTextEditor } from '../RichTextEditor';
import { FolderOpen } from 'lucide-react';

// Icons
const AddCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DraftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill={filled ? "#22c55e" : "#e5e7eb"} stroke={filled ? "#22c55e" : "#d1d5db"} strokeWidth="1"/>
    {filled && <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
);

interface FigmaProductUploadProps {
  categories: Category[];
  subCategories?: SubCategory[];
  childCategories?: ChildCategory[];
  brands: Brand[];
  tags?: Tag[];
  onAddProduct: (product: Product) => void;
  onBack?: () => void;
  onNavigate?: (section: string) => void;
  editProduct?: Product | null;
}

interface FormData {
  name: string;
  slug: string;
  autoSlug: boolean;
  shopName: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  videoUrl: string;
  galleryImages: string[];
  regularPrice: number;
  salesPrice: number;
  costPrice: number;
  quantity: number;
  serial: number;
  unitName: string;
  warranty: string;
  sku: string;
  barcode: string;
  initialSoldCount: number;
  productionStart: string;
  expirationEnd: string;
  variantsMandatory: boolean;
  variants: { title: string; options: { attribute: string; extraPrice: number; image?: string }[] }[];
  brandName: string;
  modelName: string;
  details: { type: string; description: string }[];
  affiliateSource: string;
  sourceProductUrl: string;
  sourceSku: string;
  useDefaultDelivery: boolean;
  deliveryChargeDefault: number;
  deliveryByCity: { city: string; charge: number }[];
  keywords: string;
  seoDescription: string;
  seoTitle: string;
  category: string;
  subCategory: string;
  childCategory: string;
  condition: string;
  flashSale: boolean;
  flashSaleStartDate: string;
  flashSaleEndDate: string;
  tag: string[];
  deepSearch: string;
}

// Collapsible Section Component
const Section: React.FC<{ 
  title: string; 
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode 
}> = ({ title, subtitle, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-lg shadow-[0px_4px_11.4px_-2px_rgba(0,0,0,0.08)] px-4 py-5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <h2 className="text-[20px] font-medium text-black font-['Lato']">{title}</h2>
          {subtitle && <p className="text-[12px] text-[#a2a2a2] mt-1">{subtitle}</p>}
        </div>
        <div className="w-8 h-8 flex items-center justify-center">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      {isOpen && <div className="mt-6">{children}</div>}
    </div>
  );
};

// Input Field Component
const InputField: React.FC<{
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'textarea';
  rows?: number;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}> = ({ label, required, placeholder, value, onChange, type = 'text', rows = 3, icon, rightIcon }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[16px] text-black font-['Lato']">
      {label}
      {required && <span className="text-[#e30000]">*</span>}
    </label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-[#f9f9f9] rounded-lg px-3 py-3 text-[14px] text-black placeholder:text-[#a2a2a2] outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 bg-[#f9f9f9] rounded-lg text-[14px] text-black placeholder:text-[#a2a2a2] outline-none ${icon ? 'pl-9 pr-3' : 'px-3'} ${rightIcon ? 'pr-10' : ''}`}
        />
      )}
      {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>}
    </div>
  </div>
);

// Toggle Switch Component
const Toggle: React.FC<{ 
  label: string; 
  value: boolean; 
  onChange: (value: boolean) => void;
  labelPosition?: 'left' | 'right';
}> = ({ label, value, onChange, labelPosition = 'left' }) => (
  <div className="flex items-center gap-2">
    {labelPosition === 'left' && <span className="text-[14px] sm:text-[16px] text-black font-['Lato'] whitespace-nowrap">{label}</span>}
    <button
      onClick={() => onChange(!value)}
      className={`w-[38px] h-5 rounded-full transition-colors ${value ? 'bg-[#ff6a00]' : 'bg-gray-300'} relative`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
    {labelPosition === 'right' && <span className="text-[14px] sm:text-[16px] text-black font-['Lato'] whitespace-nowrap">{label}</span>}
  </div>
);

// Select Dropdown Component
const SelectField: React.FC<{
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}> = ({ label, required, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 200);
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      {label && (
        <label className="text-[16px] text-black font-['Lato']">
          {label}
          {required && <span className="text-[#e30000]">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="w-full h-10 bg-[#f9f9f9] rounded-lg px-3 flex items-center justify-between text-[14px] text-black"
        >
          <span className={selectedOption ? 'text-black' : 'text-[#a2a2a2]'}>
            {selectedOption?.label || placeholder || 'Select...'}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className={`absolute left-0 right-0 bg-white rounded-lg shadow-lg border z-50 max-h-60 overflow-auto ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-[14px] hover:bg-gray-50 ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FigmaProductUpload: React.FC<FigmaProductUploadProps> = ({
  categories,
  subCategories = [],
  childCategories = [],
  brands,
  tags = [],
  onAddProduct,
  onBack,
  onNavigate,
  editProduct
}) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || 'default';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantImageRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const catalogImageRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingVariantImage, setUploadingVariantImage] = useState<string | null>(null);
  const [uploadingCatalogImage, setUploadingCatalogImage] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogModalTab, setCatalogModalTab] = useState<'category' | 'subcategory' | 'childcategory' | 'brand' | 'tag'>('category');
  const [newCatalogItem, setNewCatalogItem] = useState({
    name: '',
    parentCategory: '',
    parentSubCategory: '',
    image: '',
    isFlashSale: false,
    isMostSales: false,
    durationDays: 0
  });
  const [savingCatalog, setSavingCatalog] = useState(false);

  // Gallery picker state
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [galleryPickerTarget, setGalleryPickerTarget] = useState<'mainImage' | 'gallery' | 'variantImage' | 'catalogIcon' | null>(null);
  const [galleryPickerVariantKey, setGalleryPickerVariantKey] = useState<string | null>(null);

  // Local state for catalog items that includes newly added ones
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [localSubCategories, setLocalSubCategories] = useState<SubCategory[]>(subCategories);
  const [localChildCategories, setLocalChildCategories] = useState<ChildCategory[]>(childCategories);
  const [localBrands, setLocalBrands] = useState<Brand[]>(brands);
  const [localTags, setLocalTags] = useState<Tag[]>(tags);

  // Sync with props when they change
  React.useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);
  React.useEffect(() => {
    setLocalSubCategories(subCategories);
  }, [subCategories]);
  React.useEffect(() => {
    setLocalChildCategories(childCategories);
  }, [childCategories]);
  React.useEffect(() => {
    setLocalBrands(brands);
  }, [brands]);
  React.useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    autoSlug: true,
    shopName: '',
    shortDescription: '',
    description: '',
    mainImage: '',
    videoUrl: '',
    galleryImages: [],
    regularPrice: 0,
    salesPrice: 0,
    costPrice: 0,
    quantity: 0,
    serial: 0,
    unitName: '',
    warranty: '',
    sku: '',
    barcode: '',
    initialSoldCount: 0,
    productionStart: '',
    expirationEnd: '',
    variantsMandatory: false,
    variants: [{ title: '', options: [{ attribute: '', extraPrice: 0 }] }],
    brandName: '',
    modelName: '',
    details: [{ type: '', description: '' }],
    affiliateSource: '',
    sourceProductUrl: '',
    sourceSku: '',
    useDefaultDelivery: false,
    deliveryChargeDefault: 0,
    deliveryByCity: [{ city: 'Dhaka', charge: 80 }],
    keywords: '',
    seoDescription: '',
    seoTitle: '',
    category: '',
    subCategory: '',
    childCategory: '',
    condition: 'New',
    flashSale: false,
    flashSaleStartDate: '',
    flashSaleEndDate: '',
    tag: [],
    deepSearch: ''
  });

  // Load edit product
  useEffect(() => {
    if (editProduct) {
      // Convert variantGroups back to formData.variants format
      const loadedVariants = editProduct.variantGroups?.map(vg => ({
        title: vg.title,
        options: vg.options.map(o => ({
          attribute: o.attribute,
          extraPrice: o.extraPrice || 0,
          image: o.image
        }))
      })) || [{ title: '', options: [{ attribute: '', extraPrice: 0 }] }];
      
      setFormData(prev => ({
        ...prev,
        name: editProduct.name || '',
        description: editProduct.description || '',
        mainImage: editProduct.image || '',
        galleryImages: editProduct.galleryImages || [],
        salesPrice: editProduct.price || 0,
        regularPrice: editProduct.originalPrice || 0,
        costPrice: editProduct.costPrice || 0,
        category: editProduct.category || '',
        brandName: editProduct.brand || '',
        sku: editProduct.sku || '',
        quantity: editProduct.stock || 0,
        variants: loadedVariants,
        variantsMandatory: editProduct.variantGroups?.[0]?.isMandatory || false,
        flashSale: editProduct.flashSale || false,
        flashSaleStartDate: editProduct.flashSaleStartDate || '',
        flashSaleEndDate: editProduct.flashSaleEndDate || '',
        tag: editProduct.tags || [],
        deepSearch: editProduct.deepSearch || '',
        serial: editProduct.serial || 0,
        unitName: editProduct.unitName || '',
        warranty: editProduct.warranty || '',
        barcode: editProduct.barcode || '',
        initialSoldCount: editProduct.initialSoldCount || 0,
        productionStart: editProduct.productionStart || '',
        expirationEnd: editProduct.expirationEnd || ''
      }));
    }
  }, [editProduct]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate completion percentage - check marks for specific fields
  const completionItems = [
    { label: 'Item Name', completed: !!formData.name?.trim() },
    { label: 'Media', completed: !!formData.mainImage },
    { label: 'Product Description', completed: !!formData.description?.trim() },
    { label: 'Pricing', completed: formData.salesPrice > 0 },
    { label: 'Inventory', completed: formData.quantity > 0 }
  ];

  // Count all filled fields for progress (3% per field)
  const filledFieldsCount = [
    !!formData.name?.trim(),
    !!formData.mainImage,
    !!formData.description?.trim(),
    formData.salesPrice > 0,
    formData.regularPrice > 0,
    formData.costPrice > 0,
    formData.quantity > 0,
    !!formData.sku?.trim(),
    !!formData.category?.trim(),
    !!formData.subCategory?.trim(),
    !!formData.childCategory?.trim(),
    !!formData.brandName?.trim(),
    formData.tag.length > 0,
    formData.galleryImages.length > 0,
    !!formData.videoUrl?.trim(),
    !!formData.shortDescription?.trim(),
    !!formData.unitName?.trim(),
    !!formData.warranty?.trim(),
    !!formData.barcode?.trim(),
    formData.initialSoldCount > 0,
    !!formData.productionStart,
    !!formData.expirationEnd,
    formData.serial > 0,
    !!formData.seoTitle?.trim(),
    !!formData.seoDescription?.trim(),
    !!formData.keywords?.trim(),
    !!formData.affiliateSource?.trim(),
    !!formData.sourceProductUrl?.trim(),
    !!formData.sourceSku?.trim(),
    formData.variantsMandatory,
    formData.useDefaultDelivery,
    formData.deliveryChargeDefault > 0,
    !!formData.modelName?.trim(),
  ].filter(Boolean).length;

  // Calculate progress: 3% per field, max 100%
  const completionPercentage = Math.min(filledFieldsCount * 3, 100);

  // Progress bar color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent < 30) return 'bg-yellow-500';
    if (percent <= 80) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Upload single file and return URL (also saves to gallery)
  const uploadSingleFile = async (file: File, galleryCategory: string = 'Products'): Promise<string | null> => {
    try {
      const imageUrl = await uploadAndSaveToGallery(file, tenantId, galleryCategory);
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      return null;
    }
  };

  // Open gallery picker for different targets
  const openGalleryPicker = (target: 'mainImage' | 'gallery' | 'variantImage' | 'catalogIcon', variantKey?: string) => {
    setGalleryPickerTarget(target);
    setGalleryPickerVariantKey(variantKey || null);
    setShowGalleryPicker(true);
  };

  // Handle image selection from gallery
  const handleGallerySelect = (imageUrl: string) => {
    if (!galleryPickerTarget) return;

    switch (galleryPickerTarget) {
      case 'mainImage':
        updateField('mainImage', imageUrl);
        toast.success('Main image selected from gallery');
        break;
      case 'gallery':
        if (!formData.galleryImages.includes(imageUrl)) {
          updateField('galleryImages', [...formData.galleryImages, imageUrl]);
          toast.success('Image added to gallery');
        } else {
          toast.error('Image already in gallery');
        }
        break;
      case 'variantImage':
        if (galleryPickerVariantKey) {
          const [variantIdx, optionIdx] = galleryPickerVariantKey.split('-').map(Number);
          const newVariants = [...formData.variants];
          if (newVariants[variantIdx] && newVariants[variantIdx].options[optionIdx]) {
            newVariants[variantIdx].options[optionIdx].image = imageUrl;
            updateField('variants', newVariants);
            toast.success('Variant image selected from gallery');
          }
        }
        break;
      case 'catalogIcon':
        setNewCatalogItem(prev => ({ ...prev, image: imageUrl }));
        toast.success('Image selected from gallery');
        break;
    }

    setShowGalleryPicker(false);
    setGalleryPickerTarget(null);
    setGalleryPickerVariantKey(null);
  };

  // Handle multiple image selection from gallery
  const handleGallerySelectMultiple = (imageUrls: string[]) => {
    const newImages = imageUrls.filter(url => !formData.galleryImages.includes(url));
    if (newImages.length > 0) {
      updateField('galleryImages', [...formData.galleryImages, ...newImages]);
      toast.success(`${newImages.length} images added to gallery`);
    }
    setShowGalleryPicker(false);
    setGalleryPickerTarget(null);
  };

  // Get all images (mainImage + galleryImages)
  const allImages = formData.mainImage 
    ? [formData.mainImage, ...formData.galleryImages] 
    : formData.galleryImages;

  // Handle variant image upload
  const handleVariantImageUpload = async (variantIdx: number, optionIdx: number, file: File) => {
    const key = `${variantIdx}-${optionIdx}`;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image size should be less than 4MB');
      return;
    }
    
    setUploadingVariantImage(key);
    try {
      const url = await uploadSingleFile(file);
      if (url) {
        const newVariants = [...formData.variants];
        newVariants[variantIdx].options[optionIdx].image = url;
        updateField('variants', newVariants);
        toast.success('Variant image uploaded');
      }
    } catch (error) {
      toast.error('Failed to upload variant image');
    } finally {
      setUploadingVariantImage(null);
    }
  };

  // Remove variant image
  const handleRemoveVariantImage = (variantIdx: number, optionIdx: number) => {
    const newVariants = [...formData.variants];
    newVariants[variantIdx].options[optionIdx].image = undefined;
    updateField('variants', newVariants);
  };

  // Handle multiple image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max 20 images
    const currentCount = allImages.length;
    const maxAllowed = 20 - currentCount;
    if (maxAllowed <= 0) {
      toast.error('Maximum 20 images allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, maxAllowed);
    toast.loading(`Uploading ${filesToUpload.length} image(s)...`, { id: 'upload' });

    const uploadedUrls: string[] = [];
    for (const file of filesToUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) continue;
      // Validate file size (4MB max)
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 4MB)`);
        continue;
      }
      const url = await uploadSingleFile(file);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length > 0) {
      // If no main image, set first uploaded as main
      if (!formData.mainImage) {
        updateField('mainImage', uploadedUrls[0]);
        if (uploadedUrls.length > 1) {
          updateField('galleryImages', [...formData.galleryImages, ...uploadedUrls.slice(1)]);
        }
      } else {
        updateField('galleryImages', [...formData.galleryImages, ...uploadedUrls]);
      }
      toast.success(`${uploadedUrls.length} image(s) uploaded`, { id: 'upload' });
    } else {
      toast.error('Failed to upload images', { id: 'upload' });
    }

    // Reset input
    e.target.value = '';
  };

  // Remove image from gallery
  const handleRemoveImage = (index: number) => {
    if (index === 0 && formData.mainImage) {
      // Removing main image - promote first gallery image
      if (formData.galleryImages.length > 0) {
        updateField('mainImage', formData.galleryImages[0]);
        updateField('galleryImages', formData.galleryImages.slice(1));
      } else {
        updateField('mainImage', '');
      }
    } else {
      // Removing gallery image
      const galleryIndex = formData.mainImage ? index - 1 : index;
      const newGallery = formData.galleryImages.filter((_, i) => i !== galleryIndex);
      updateField('galleryImages', newGallery);
    }
  };

  // Set image as main (move to first position)
  const handleSetAsMain = (index: number) => {
    if (index === 0) return; // Already main
    const newMainImage = allImages[index];
    const newGallery = allImages.filter((_, i) => i !== index);
    if (formData.mainImage) {
      // Put old main in gallery
      newGallery.unshift(formData.mainImage);
    }
    updateField('mainImage', newMainImage);
    updateField('galleryImages', newGallery.filter(img => img !== newMainImage));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Check max 20 images
    const currentCount = allImages.length;
    const maxAllowed = 20 - currentCount;
    if (maxAllowed <= 0) {
      toast.error('Maximum 20 images allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, maxAllowed);
    toast.loading(`Uploading ${filesToUpload.length} image(s)...`, { id: 'upload-drop' });

    const uploadedUrls: string[] = [];
    for (const file of filesToUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      // Validate file size (4MB max)
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 4MB)`);
        continue;
      }
      const url = await uploadSingleFile(file);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length > 0) {
      if (!formData.mainImage) {
        updateField('mainImage', uploadedUrls[0]);
        if (uploadedUrls.length > 1) {
          updateField('galleryImages', [...formData.galleryImages, ...uploadedUrls.slice(1)]);
        }
      } else {
        updateField('galleryImages', [...formData.galleryImages, ...uploadedUrls]);
      }
      toast.success(`${uploadedUrls.length} image(s) uploaded`, { id: 'upload-drop' });
    } else {
      toast.error('Failed to upload images', { id: 'upload-drop' });
    }
  };

  // Save new catalog item (category, subcategory, childcategory, brand, tag)
  const handleCatalogImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image size should be less than 4MB');
      return;
    }
    
    setUploadingCatalogImage(true);
    try {
      const url = await uploadSingleFile(file);
      if (url) {
        setNewCatalogItem(prev => ({ ...prev, image: url }));
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingCatalogImage(false);
    }
  };

  const handleSaveCatalogItem = async () => {
    if (!newCatalogItem.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingCatalog(true);
    try {
      const endpoint = catalogModalTab === 'subcategory' ? 'subcategories' 
        : catalogModalTab === 'childcategory' ? 'childcategories'
        : catalogModalTab === 'brand' ? 'brands'
        : catalogModalTab === 'tag' ? 'tags'
        : 'categories';

      // Fetch existing data first
      const getResponse = await fetch(`/api/tenant-data/${tenantId}/${endpoint}`);
      let existingData: any[] = [];
      if (getResponse.ok) {
        const result = await getResponse.json();
        existingData = result.data || [];
      }

      // Create new item
      const newItem: any = {
        id: Date.now(),
        name: newCatalogItem.name.trim(),
        createdAt: new Date().toISOString()
      };

      // Add extra fields based on type
      if (catalogModalTab === 'category') {
        newItem.image = newCatalogItem.image;
        newItem.isFlashSale = newCatalogItem.isFlashSale;
        newItem.isMostSales = newCatalogItem.isMostSales;
      } else if (catalogModalTab === 'subcategory') {
        newItem.categoryId = newCatalogItem.parentCategory;
        newItem.categoryName = newCatalogItem.parentCategory;
        newItem.image = newCatalogItem.image;
      } else if (catalogModalTab === 'childcategory') {
        newItem.subCategoryId = newCatalogItem.parentSubCategory;
        newItem.subCategoryName = newCatalogItem.parentSubCategory;
        newItem.image = newCatalogItem.image;
      } else if (catalogModalTab === 'brand') {
        newItem.logo = newCatalogItem.image;
      } else if (catalogModalTab === 'tag') {
        newItem.icon = newCatalogItem.image;
        newItem.image = newCatalogItem.image;
        if (newCatalogItem.durationDays > 0) {
          newItem.durationDays = newCatalogItem.durationDays;
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + newCatalogItem.durationDays);
          newItem.expiresAt = expiry.toISOString();
        }
      }

      // Add to existing data
      const updatedData = [...existingData, newItem];

      // Save to backend
      const saveResponse = await fetch(`/api/tenant-data/${tenantId}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedData })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save');
      }

      toast.success(`${catalogModalTab.charAt(0).toUpperCase() + catalogModalTab.slice(1)} added successfully!`);
      
      // Update local state so dropdown shows the new item
      if (catalogModalTab === 'category') {
        setLocalCategories(prev => [...prev, newItem as Category]);
        updateField('category', newCatalogItem.name.trim());
      } else if (catalogModalTab === 'subcategory') {
        setLocalSubCategories(prev => [...prev, newItem as SubCategory]);
        updateField('subCategory', newCatalogItem.name.trim());
      } else if (catalogModalTab === 'childcategory') {
        setLocalChildCategories(prev => [...prev, newItem as ChildCategory]);
        updateField('childCategory', newCatalogItem.name.trim());
      } else if (catalogModalTab === 'tag') {
        setLocalTags(prev => [...prev, newItem as Tag]);
        updateField('tag', [newCatalogItem.name.trim()]);
      } else if (catalogModalTab === 'brand') {
        setLocalBrands(prev => [...prev, newItem as Brand]);
        updateField('brandName', newCatalogItem.name.trim());
      }
      
      // Reset form and close modal
      setNewCatalogItem({
        name: '',
        parentCategory: '',
        parentSubCategory: '',
        image: '',
        isFlashSale: false,
        isMostSales: false,
        durationDays: 0
      });
      setShowCatalogModal(false);
    } catch (error) {
      console.error('Error saving catalog item:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleSaveDraft = () => {
    // Create draft product with whatever info has been entered (no validation required)
    const validVariants = formData.variants
      .filter(v => v.title.trim() && v.options.some(o => o.attribute.trim()))
      .map(v => ({
        title: v.title.trim(),
        isMandatory: formData.variantsMandatory,
        options: v.options
          .filter(o => o.attribute.trim())
          .map(o => ({
            attribute: o.attribute.trim(),
            extraPrice: o.extraPrice || 0,
            image: o.image
          }))
      }));

    const draftProduct: Product = {
      id: editProduct?.id || Date.now(),
      name: formData.name || 'Untitled Draft',
      slug: formData.slug || `draft-${Date.now()}`,
      description: formData.description,
      image: formData.mainImage,
      galleryImages: formData.galleryImages,
      videoUrl: formData.videoUrl,
      price: formData.salesPrice || 0,
      originalPrice: formData.regularPrice || 0,
      costPrice: formData.costPrice || 0,
      category: formData.category,
      subCategory: formData.subCategory,
      childCategory: formData.childCategory,
      brand: formData.brandName,
      sku: formData.sku,
      stock: formData.quantity || 0,
      status: 'Draft',
      tags: formData.tag.length > 0 ? formData.tag : [],
      tenantId: tenantId,
      shopName: formData.shopName,
      flashSale: formData.flashSale,
      flashSaleStartDate: formData.flashSaleStartDate || undefined,
      flashSaleEndDate: formData.flashSaleEndDate || undefined,
      variantGroups: validVariants.length > 0 ? validVariants : undefined,
      deepSearch: formData.deepSearch || "",
      serial: formData.serial || 0,
      unitName: formData.unitName || "",
      warranty: formData.warranty || "",
      barcode: formData.barcode || "",
      initialSoldCount: formData.initialSoldCount || 0,
      productionStart: formData.productionStart || "",
      expirationEnd: formData.expirationEnd || ""
    };

    // Save to backend via onAddProduct
    onAddProduct(draftProduct);
    toast.success('Draft saved!');
    onBack?.();
  };

  const handlePublish = () => {
    if (!formData.name || !formData.category || !formData.salesPrice) {
      toast.error('Please fill required fields');
      return;
    }

    // Filter out empty variants and options
    const validVariants = formData.variants
      .filter(v => v.title.trim() && v.options.some(o => o.attribute.trim()))
      .map(v => ({
        title: v.title.trim(),
        isMandatory: formData.variantsMandatory,
        options: v.options
          .filter(o => o.attribute.trim())
          .map(o => ({
            attribute: o.attribute.trim(),
            extraPrice: o.extraPrice || 0,
            image: o.image
          }))
      }));

    const newProduct: Product = {
      id: editProduct?.id || Date.now(),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      image: formData.mainImage,
      galleryImages: formData.galleryImages,
      videoUrl: formData.videoUrl,
      price: formData.salesPrice,
      originalPrice: formData.regularPrice,
      costPrice: formData.costPrice,
      category: formData.category,
      subCategory: formData.subCategory,
      childCategory: formData.childCategory,
      brand: formData.brandName,
      sku: formData.sku,
      stock: formData.quantity,
      status: 'Active',
      tags: formData.tag.length > 0 ? formData.tag : [],
      tenantId: tenantId,
      shopName: formData.shopName,
      flashSale: formData.flashSale,
      flashSaleStartDate: formData.flashSaleStartDate || undefined,
      flashSaleEndDate: formData.flashSaleEndDate || undefined,
      variantGroups: validVariants.length > 0 ? validVariants : undefined,
      deepSearch: formData.deepSearch || "",
      serial: formData.serial || 0,
      unitName: formData.unitName || "",
      warranty: formData.warranty || "",
      barcode: formData.barcode || "",
      initialSoldCount: formData.initialSoldCount || 0,
      productionStart: formData.productionStart || "",
      expirationEnd: formData.expirationEnd || ""
    };

    onAddProduct(newProduct);
    toast.success(editProduct ? 'Product updated!' : 'Product added!');
    onBack?.();
  };

  const affiliateSources = [
    { value: 'AliExpress', label: 'AliExpress (marketplace)', color: '#ff6a00' },
    { value: 'Amazon', label: 'Amazon (marketplace)', color: '#ff9900' },
    { value: 'Alibaba', label: 'Alibaba (marketplace)', color: '#ff6a00' },
    { value: 'Other', label: 'Other', color: '#666' }
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-6 xxs:pb-8 font-['Lato']">
      {/* Header */}
      <div className="px-2 xxs:px-3 sm:px-4 lg:px-3 xl:px-4 py-3 xxs:py-4 sm:py-6">
        <h1 className="text-base xxs:text-lg sm:text-xl lg:text-[24px] font-bold text-black">Product Upload</h1>
      </div>

      <div className="px-2 xxs:px-3 sm:px-4 lg:px-3 xl:px-4 flex flex-col lg:flex-row gap-3 xxs:gap-4 lg:gap-4 xl:gap-5">
        {/* Left Column - Form */}
        <div className="flex-1 space-y-3 xxs:space-y-4">
          {/* General Information */}
          <Section title="General Information">
            <div className="space-y-3 xxs:space-y-4">
              {/* Item Name */}
              <div className="flex flex-col gap-1.5 xxs:gap-2">
                <div className="flex flex-col xxs:flex-row xxs:items-center justify-between gap-1 xxs:gap-2">
                  <label className="text-[14px] xxs:text-[16px] text-black">
                    Item Name<span className="text-[#e30000]">*</span>
                  </label>
                  <Toggle 
                    label="Auto Slug" 
                    value={formData.autoSlug} 
                    onChange={(v) => updateField('autoSlug', v)}
                  />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    updateField('name', e.target.value);
                    if (formData.autoSlug) {
                      updateField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="Ex: Samsung Galaxy S25 Ultra"
                  className="w-full h-9 xxs:h-10 bg-[#f9f9f9] rounded-lg px-2 xxs:px-3 text-[13px] xxs:text-[14px] placeholder:text-[#a2a2a2] outline-none"
                />
                
                {/* Manual Slug Input - Only show when Auto Slug is OFF */}
                {!formData.autoSlug && (
                  <div className="mt-2">
                    <label className="text-[12px] xxs:text-[13px] text-gray-600 mb-1 block">
                      Product Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                      placeholder="ex: samsung-galaxy-s25-ultra"
                      className="w-full h-9 xxs:h-10 bg-[#f9f9f9] rounded-lg px-2 xxs:px-3 text-[13px] xxs:text-[14px] placeholder:text-[#a2a2a2] outline-none border border-gray-300 focus:border-blue-500"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">URL-friendly name (lowercase, hyphens only)</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 xxs:gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] xxs:text-[16px] font-medium text-black">
                    Media<span className="text-[#da0000]">*</span>
                  </label>
                  <ChevronUp size={18} className="xxs:w-5 xxs:h-5" />
                </div>
                
                {/* Image Upload & Gallery */}
                <div 
                  className={`rounded-lg p-2 xxs:p-3 sm:p-4 transition-colors border-2 ${
                    isDragging 
                      ? 'bg-blue-50 border-blue-400 border-dashed' 
                      : 'bg-[#f9f9f9] border-transparent hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Gallery Grid */}
                  {allImages.length > 0 ? (
                    <div className="space-y-3 xxs:space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs xxs:text-sm text-gray-600">{allImages.length}/20 images</span>
                        {allImages.length < 20 && (
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs xxs:text-sm text-[#ff9f1c] hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} className="xxs:w-[14px] xxs:h-[14px]" /> Add More
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 xxs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 xxs:gap-3">
                        {allImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                              idx === 0 ? 'border-[#ff9f1c] ring-2 ring-[#ff9f1c]/20' : 'border-gray-200'
                            }`}
                          >
                            <img src={normalizeImageUrl(img)} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <div className="absolute top-0.5 xxs:top-1 left-0.5 xxs:left-1 bg-[#ff9f1c] text-white text-[8px] xxs:text-[10px] px-1 xxs:px-1.5 py-0.5 rounded">
                                Main
                              </div>
                            )}
                            {/* Hover actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 xxs:gap-2">
                              {idx !== 0 && (
                                <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleSetAsMain(idx); }}
                                  className="w-5 h-5 xxs:w-7 xxs:h-7 bg-white text-gray-700 rounded-full flex items-center justify-center text-[10px] xxs:text-xs hover:bg-[#ff9f1c] hover:text-white transition-colors"
                                  title="Set as Main"
                                >
                                  ★
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                className="w-5 h-5 xxs:w-7 xxs:h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Remove"
                              >
                                <X size={12} className="xxs:w-[14px] xxs:h-[14px]" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Add more placeholder */}
                        {allImages.length < 20 && (
                          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-gray-400 hover:text-[#ff9f1c] transition-colors"
                              title="Upload new image"
                            >
                              <Plus size={20} className="xxs:w-6 xxs:h-6" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openGalleryPicker('gallery')}
                              className="text-gray-400 hover:text-[#ff9f1c] transition-colors"
                              title="Choose from gallery"
                            >
                              <FolderOpen size={16} className="xxs:w-5 xxs:h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-3 xxs:py-4 sm:py-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-[50px] h-[50px] xxs:w-[60px] xxs:h-[60px] sm:w-[76px] sm:h-[76px] mb-2 xxs:mb-3">
                        <Upload className="w-full h-full text-[#a2a2a2]" />
                      </div>
                      <p className="text-[13px] xxs:text-[14px] sm:text-[16px] text-[#a2a2a2] text-center">
                        Drag & drop images, or click to add.
                      </p>
                      <p className="text-[10px] xxs:text-[11px] sm:text-[12px] text-[#a2a2a2] text-center mt-1">
                        JPG, PNG (max 4MB). Up to 20 images.
                      </p>
                      <div className="flex gap-2 mt-3 xxs:mt-4">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="bg-[#ff9f1c] text-white px-3 xxs:px-4 py-1.5 xxs:py-2 rounded-lg text-[12px] xxs:text-[14px] font-semibold"
                        >
                          Add Images
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openGalleryPicker('gallery'); }}
                          className="bg-gray-100 text-gray-700 px-3 xxs:px-4 py-1.5 xxs:py-2 rounded-lg text-[12px] xxs:text-[14px] font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-colors"
                        >
                          <FolderOpen size={14} />
                          From Gallery
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Video URL */}
                <div className="relative">
                  <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a2a2a2]" />
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => updateField('videoUrl', e.target.value)}
                    placeholder="Past YouTube Video Link (Optional)"
                    className="w-full h-10 bg-[#f9f9f9] rounded-lg pl-9 pr-3 text-[14px] placeholder:text-[#a2a2a2] outline-none"
                  />
                </div>
              </div>

              {/* Short Description */}
              <InputField
                label="Short Description"
                value={formData.shortDescription}
                onChange={(v) => updateField('shortDescription', v)}
                placeholder="Ex: Short Description"
                type="textarea"
                rows={3}
              />

              {/* Product Description */}
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Product Description"
                  value={formData.description}
                  onChange={(v) => updateField('description', v)}
                  placeholder="Enter product description..."
                  minHeight="min-h-[200px]"
                />
              </div>
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 gap-2 xxs:gap-3 sm:gap-4 lg:gap-4 xl:gap-5">
              <InputField
                label="Sell/Current Price"
                required
                value={formData.salesPrice}
                onChange={(v) => updateField('salesPrice', parseFloat(v) || 0)}
                placeholder="0"
                type="number"
              />
              <InputField
                label="Regular/Old Price"
                required
                value={formData.regularPrice}
                onChange={(v) => updateField('regularPrice', parseFloat(v) || 0)}
                placeholder="0"
                type="number"
              />
              <InputField
                label="Cost Price (Optional)"
                value={formData.costPrice}
                onChange={(v) => updateField('costPrice', parseFloat(v) || 0)}
                placeholder="0"
                type="number"
              />
            </div>
          </Section>

          {/* Inventory */}
          <Section title="Inventory">
            <div className="space-y-3 xxs:space-y-4">
              <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 gap-2 xxs:gap-3 sm:gap-4 lg:gap-4 xl:gap-5">
                <InputField
                  label="Product serial"
                  value={formData.serial}
                  onChange={(v) => updateField('serial', parseFloat(v) || 0)}
                  placeholder="0%"
                  type="number"
                />
                <InputField
                  label="Quantity (Stock)"
                  value={formData.quantity}
                  onChange={(v) => updateField('quantity', parseInt(v) || 0)}
                  placeholder="50"
                  type="number"
                />
                <InputField
                  label="Unit Name"
                  value={formData.unitName}
                  onChange={(v) => updateField('unitName', v)}
                  placeholder="Piece, kg, liter, meter etc."
                />
              </div>
              <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 gap-2 xxs:gap-3 sm:gap-4 lg:gap-4 xl:gap-5">
                <InputField
                  label="Warranty"
                  value={formData.warranty}
                  onChange={(v) => updateField('warranty', v)}
                  placeholder="12 month"
                />
                <InputField
                  label="SKU / Product Code"
                  value={formData.sku}
                  onChange={(v) => updateField('sku', v)}
                  placeholder="ABC-XYZ-123"
                />
                <InputField
                  label="Bar Code"
                  value={formData.barcode}
                  onChange={(v) => updateField('barcode', v)}
                  placeholder="2154645786216"
                  rightIcon={<Scan size={18} className="text-gray-400 xxs:w-5 xxs:h-5" />}
                />
              </div>
              <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 gap-2 xxs:gap-3 sm:gap-4 lg:gap-4 xl:gap-5">
                <InputField
                  label="Initial Sold Count"
                  value={formData.initialSoldCount}
                  onChange={(v) => updateField('initialSoldCount', parseInt(v) || 0)}
                  placeholder="0"
                  type="number"
                />
                <InputField
                  label="Production Start"
                  value={formData.productionStart}
                  onChange={(v) => updateField('productionStart', v)}
                  placeholder="DD-MM-YYYY"
                  rightIcon={<Calendar size={18} className="text-gray-400 xxs:w-5 xxs:h-5" />}
                />
                <InputField
                  label="Expiration End"
                  value={formData.expirationEnd}
                  onChange={(v) => updateField('expirationEnd', v)}
                  placeholder="DD-MM-YYYY"
                  rightIcon={<Calendar size={18} className="text-gray-400 xxs:w-5 xxs:h-5" />}
                />
              </div>
            </div>
          </Section>

          {/* Product Variants */}
          <Section title="Product Variants" subtitle="You can add multiple variant for a single product here. Like Size, Color, and Weight etc.">
            <div className="space-y-4">
              {formData.variants.map((variant, vIdx) => (
                <div key={vIdx} className="border border-[#38bdf8] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[20px] font-medium">Make this variant mandatory</p>
                      <p className="text-[12px] text-[#a2a2a2]">Toggle this on if you want your customer to select at least one of the variant options</p>
                    </div>
                    <Toggle 
                      label="[No]" 
                      value={formData.variantsMandatory}
                      onChange={(v) => updateField('variantsMandatory', v)}
                    />
                  </div>

                  <InputField
                    label="Title"
                    value={variant.title}
                    onChange={(v) => {
                      const newVariants = [...formData.variants];
                      newVariants[vIdx].title = v;
                      updateField('variants', newVariants);
                    }}
                    placeholder="Enter the name of variant (e.g., Colour, Size, Material)"
                  />

                  {variant.options.map((option, oIdx) => (
                    <div key={oIdx} className="flex items-end gap-2 mt-4">
                      {/* Variant Image Upload */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => { variantImageRefs.current[`${vIdx}-${oIdx}`] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVariantImageUpload(vIdx, oIdx, file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <div 
                          onClick={() => variantImageRefs.current[`${vIdx}-${oIdx}`]?.click()}
                          className="w-[67px] h-[67px] bg-[#f9f9f9] rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#38bdf8] transition-colors"
                        >
                          {uploadingVariantImage === `${vIdx}-${oIdx}` ? (
                            <div className="animate-spin w-6 h-6 border-2 border-[#38bdf8] border-t-transparent rounded-full" />
                          ) : option.image ? (
                            <img src={normalizeImageUrl(option.image)} alt="Variant" className="w-full h-full object-cover" />
                          ) : (
                            <Upload size={24} className="text-gray-400" />
                          )}
                        </div>
                        {option.image && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveVariantImage(vIdx, oIdx);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[16px] text-black">Attribute</label>
                          <input
                            value={option.attribute}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[vIdx].options[oIdx].attribute = e.target.value;
                              updateField('variants', newVariants);
                            }}
                            placeholder="Enter variant Option (e.g., Red, Large, Cotton)"
                            className="w-full h-10 bg-[#f9f9f9] rounded-lg px-3 text-[14px] placeholder:text-[#999] outline-none mt-2"
                          />
                        </div>
                        <div>
                          <label className="text-[16px] text-black">Extra Price</label>
                          <input
                            type="number"
                            value={option.extraPrice}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[vIdx].options[oIdx].extraPrice = parseFloat(e.target.value) || 0;
                              updateField('variants', newVariants);
                            }}
                            placeholder="Enter Extra price for this option"
                            className="w-full h-10 bg-[#f9f9f9] rounded-lg px-3 text-[14px] placeholder:text-[#999] outline-none mt-2"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newVariants = [...formData.variants];
                          newVariants[vIdx].options = newVariants[vIdx].options.filter((_, i) => i !== oIdx);
                          updateField('variants', newVariants);
                        }}
                        className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newVariants = [...formData.variants];
                      newVariants[vIdx].options.push({ attribute: '', extraPrice: 0 });
                      updateField('variants', newVariants);
                    }}
                    className="mt-4 h-10 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white rounded-lg px-4 flex items-center gap-3"
                  >
                    <AddCircleIcon />
                    <span className="text-[14px] font-semibold">Add More Option</span>
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  updateField('variants', [...formData.variants, { title: '', options: [{ attribute: '', extraPrice: 0 }] }]);
                }}
                className="h-10 bg-[#f4f4f4] rounded-lg px-4 flex items-center gap-3"
              >
                <Plus size={24} />
                <span className="text-[14px] font-semibold text-black">Add a new variant</span>
              </button>
            </div>
          </Section>

          {/* Brand */}
          <Section title="Brand" subtitle="You can add multiple product details for a single product here. Like Brand, Model, Serial Number, Fabric Type, and EMI etc.">
            <div className="flex items-end gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <InputField
                  label="Brand Name"
                  value={formData.brandName}
                  onChange={(v) => updateField('brandName', v)}
                  placeholder="Samsung"
                />
                <InputField
                  label="Model Name"
                  value={formData.modelName}
                  onChange={(v) => updateField('modelName', v)}
                  placeholder="S25 Ultra"
                />
              </div>
              <button className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                <X size={24} />
              </button>
            </div>
            <button className="mt-4 h-10 bg-[#f4f4f4] rounded-lg px-4 flex items-center gap-3">
              <Plus size={24} />
              <span className="text-[14px] font-semibold text-black">Create a new Brand</span>
            </button>
          </Section>

          {/* Product Details */}
          <Section title="key features" subtitle="You can add multiple key features for a single product here. Like Brand, Model, Serial Number, Fabric Type, and EMI etc.">
            {formData.details.map((detail, idx) => (
              <div key={idx} className="flex items-end gap-2 mb-4">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <InputField
                    label="Detail Type"
                    value={detail.type}
                    onChange={(v) => {
                      const newDetails = [...formData.details];
                      newDetails[idx].type = v;
                      updateField('details', newDetails);
                    }}
                    placeholder="Ram"
                  />
                  <InputField
                    label="Detail Description"
                    value={detail.description}
                    onChange={(v) => {
                      const newDetails = [...formData.details];
                      newDetails[idx].description = v;
                      updateField('details', newDetails);
                    }}
                    placeholder="16 GB"
                  />
                </div>
                <button 
                  onClick={() => updateField('details', formData.details.filter((_, i) => i !== idx))}
                  className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500"
                >
                  <X size={24} />
                </button>
              </div>
            ))}
            <button
              onClick={() => updateField('details', [...formData.details, { type: '', description: '' }])}
              className="h-10 bg-[#f4f4f4] rounded-lg px-4 flex items-center gap-3"
            >
              <Plus size={24} />
              <span className="text-[14px] font-semibold text-black">Add More</span>
            </button>
          </Section>

          {/* Affiliate */}
          <Section title="Affiliate">
            <div className="space-y-4">
              <SelectField
                label="Product Source (Optional)"
                value={formData.affiliateSource}
                onChange={(v) => updateField('affiliateSource', v)}
                options={affiliateSources}
                placeholder="Select source"
              />
              <p className="text-[12px] text-[#a2a2a2]">Select if this product is sourced from an external supplier or marketplace</p>

              {formData.affiliateSource && (
                <>
                  <div className="bg-[#fff8ef] h-[60px] rounded-lg flex items-center px-4 gap-4">
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center text-orange-500 font-bold">A</div>
                    <div>
                      <p className="text-[14px] font-bold text-black">{formData.affiliateSource}</p>
                      <p className="text-[10px] text-[#009ade]">www.{formData.affiliateSource.toLowerCase()}.com</p>
                    </div>
                    <span className="ml-auto bg-[#ff821c] text-white text-[12px] font-semibold px-3 py-1 rounded-full">Marketplace</span>
                  </div>

                  <div className="bg-[#fff8ef] rounded-lg p-4 sm:p-6 space-y-4">
                    <p className="text-[14px] font-bold text-black">Source Product Details (Optional)</p>
                    <div>
                      <InputField
                        label="Source Product URL"
                        value={formData.sourceProductUrl}
                        onChange={(v) => updateField('sourceProductUrl', v)}
                        placeholder="www.xyz.com/product/123"
                      />
                      <p className="text-[12px] text-[#a2a2a2] mt-1">Direct link to this product on the source platform</p>
                    </div>
                    <div>
                      <InputField
                        label="Source SKU / Product Code"
                        value={formData.sourceSku}
                        onChange={(v) => updateField('sourceSku', v)}
                        placeholder="ABC-XYZ-123"
                      />
                      <p className="text-[12px] text-[#a2a2a2] mt-1">Product identifier from the source (SKU, Product ID, etc.)</p>
                    </div>
                    <div className="bg-[#fff0dd] rounded-lg p-3">
                      <p className="text-[12px] text-[#a2a2a2]">
                        💡 Tip: These details help you track and manage products from external sources. You can use the Source URL to quickly access the product page, and the Source SKU for ordering or communication with suppliers.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* Shipping */}
          <Section title="Shipping">
            <div className="space-y-4">
              <div>
                <p className="text-[20px] font-medium">Delivery Charge</p>
                <p className="text-[12px] text-[#a2a2a2]">You can add specific delivery charge for this product or use the default charges</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[16px]">Apply default delivery charges</span>
                <Toggle 
                  label={formData.useDefaultDelivery ? "[Applied]" : "[Not Applied]"}
                  value={formData.useDefaultDelivery}
                  onChange={(v) => updateField('useDefaultDelivery', v)}
                />
              </div>

              <InputField
                label="Delivery Charge (Default)"
                value={formData.deliveryChargeDefault}
                onChange={(v) => updateField('deliveryChargeDefault', parseFloat(v) || 0)}
                placeholder="120"
                type="number"
              />

              <div>
                <label className="text-[16px] text-black">Specific Delivery Charge</label>
                <div className="flex gap-2 mt-2">
                  <input
                    value={formData.deliveryByCity[0]?.city || ''}
                    onChange={(e) => {
                      const newDelivery = [...formData.deliveryByCity];
                      if (newDelivery[0]) newDelivery[0].city = e.target.value;
                      else newDelivery.push({ city: e.target.value, charge: 0 });
                      updateField('deliveryByCity', newDelivery);
                    }}
                    placeholder="Dhaka"
                    className="flex-1 h-10 bg-[#f9f9f9] rounded-lg px-3 text-[14px] outline-none"
                  />
                  <input
                    type="number"
                    value={formData.deliveryByCity[0]?.charge || ''}
                    onChange={(e) => {
                      const newDelivery = [...formData.deliveryByCity];
                      if (newDelivery[0]) newDelivery[0].charge = parseFloat(e.target.value) || 0;
                      else newDelivery.push({ city: '', charge: parseFloat(e.target.value) || 0 });
                      updateField('deliveryByCity', newDelivery);
                    }}
                    placeholder="80"
                    className="w-full sm:w-[213px] h-10 bg-[#f9f9f9] rounded-lg px-3 text-[14px] outline-none"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* SEO Info */}
          <Section title="SEO Info">
            <div className="space-y-4">
              <InputField
                label="Keyword"
                value={formData.keywords}
                onChange={(v) => updateField('keywords', v)}
                placeholder="Seo Keyword"
              />
              <InputField
                label="SEO Description"
                value={formData.seoDescription}
                onChange={(v) => updateField('seoDescription', v)}
                placeholder="Seo Description"
              />
              <InputField
                label="SEO Title"
                value={formData.seoTitle}
                onChange={(v) => updateField('seoTitle', v)}
                placeholder="Seo Title"
              />
            </div>
          </Section>
        </div>

        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block w-[320px] lg:w-[381px] flex-shrink-0 space-y-4 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex-1 h-10 bg-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <DraftIcon />
              <span className="text-[14px] font-semibold text-[#070606]">Draft</span>
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 h-10 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] rounded-lg flex items-center justify-center gap-2"
            >
              <AddCircleIcon />
              <span className="text-[14px] font-semibold text-white">{editProduct ? 'Update' : 'Add Product'}</span>
            </button>
          </div>

          {/* Ready To Publish */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[20px] font-medium text-black mb-4">Ready To Publish</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-2 bg-[#f9f9f9] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(completionPercentage)} rounded-full transition-all duration-300`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-[14px] font-medium">{completionPercentage}%</span>
            </div>
            <div className="space-y-2">
              {completionItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                    {item.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[12px] font-medium ${item.completed ? 'text-black' : 'text-gray-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[20px] font-medium text-black mb-4">Catalog</h3>
            
            {/* Category */}
            <div className="mb-3">
              <SelectField
                value={formData.category}
                onChange={(v) => updateField('category', v)}
                options={localCategories.map(c => ({ value: c.name, label: c.name }))}
                placeholder="Select Category*"
                required
              />
              <button 
                onClick={() => { setCatalogModalTab('category'); setShowCatalogModal(true); }}
                className="mt-2 h-9 bg-[#f4f4f4] rounded-lg px-3 flex items-center gap-2 ml-auto hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus size={18} />
                <span className="font-semibold text-[#070606]">Add Category</span>
              </button>
            </div>

            {/* Sub Category */}
            <div className="mb-3">
              <SelectField
                value={formData.subCategory}
                onChange={(v) => updateField('subCategory', v)}
                options={localSubCategories
                  .filter(sc => !formData.category || sc.categoryName === formData.category || sc.categoryId === formData.category)
                  .map(sc => ({ value: sc.name, label: sc.name }))}
                placeholder="Select Sub Category"
              />
              <button 
                onClick={() => { setCatalogModalTab('subcategory'); setShowCatalogModal(true); }}
                className="mt-2 h-9 bg-[#f4f4f4] rounded-lg px-3 flex items-center gap-2 ml-auto hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus size={18} />
                <span className="font-semibold text-[#070606]">Add Sub Category</span>
              </button>
            </div>

            {/* Child Category */}
            <div className="mb-3">
              <SelectField
                value={formData.childCategory}
                onChange={(v) => updateField('childCategory', v)}
                options={localChildCategories
                  .filter(cc => !formData.subCategory || cc.subCategoryId === formData.subCategory || cc.subCategoryId === formData.subCategory)
                  .map(cc => ({ value: cc.name, label: cc.name }))}
                placeholder="Select Child Category"
              />
              <button 
                onClick={() => { setCatalogModalTab('childcategory'); setShowCatalogModal(true); }}
                className="mt-2 h-9 bg-[#f4f4f4] rounded-lg px-3 flex items-center gap-2 ml-auto hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus size={18} />
                <span className="font-semibold text-[#070606]">Add Child Category</span>
              </button>
            </div>

            {/* Brand */}
            <div className="mb-3">
              <SelectField
                value={formData.brandName}
                onChange={(v) => updateField('brandName', v)}
                options={localBrands.map(b => ({ value: b.name, label: b.name }))}
                placeholder="Select Brand"
              />
              <button 
                onClick={() => { setCatalogModalTab('brand'); setShowCatalogModal(true); }}
                className="mt-2 h-9 bg-[#f4f4f4] rounded-lg px-3 flex items-center gap-2 ml-auto hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus size={18} />
                <span className="font-semibold text-[#070606]">Add Brand</span>
              </button>
            </div>

            {/* Product Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Flash Sale', 'New Arrival', 'Most Popular'].map((tagName) => {
                  const isSelected = formData.tag.includes(tagName);
                  return (
                    <button
                      key={tagName}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField('tag', formData.tag.filter((t: string) => t !== tagName));
                        } else {
                          updateField('tag', [...formData.tag, tagName]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        isSelected
                          ? tagName === 'Flash Sale'
                            ? 'bg-red-500 text-white border-red-500 shadow-md'
                            : tagName === 'New Arrival'
                            ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                            : 'bg-purple-500 text-white border-purple-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {isSelected ? '\u2713 ' : ''}{tagName}
                    </button>
                  );
                })}
              </div>
              {/* Custom Tags */}
              <SelectField
                value=""
                onChange={(v) => {
                  if (v && !formData.tag.includes(v)) {
                    updateField('tag', [...formData.tag, v]);
                  }
                }}
                options={localTags.filter(t => !['Flash Sale', 'New Arrival', 'Most Popular'].includes(t.name)).map(t => ({ value: t.name, label: t.name }))}
                placeholder="Add custom tag..."
              />
              {formData.tag.filter((t: string) => !['Flash Sale', 'New Arrival', 'Most Popular'].includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tag.filter((t: string) => !['Flash Sale', 'New Arrival', 'Most Popular'].includes(t)).map((t: string) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {t}
                      <button type="button" onClick={() => updateField('tag', formData.tag.filter((x: string) => x !== t))} className="text-gray-400 hover:text-red-500">\u00d7</button>
                    </span>
                  ))}
                </div>
              )}
              <button 
                onClick={() => { setCatalogModalTab('tag'); setShowCatalogModal(true); }}
                className="mt-2 h-9 bg-[#f4f4f4] rounded-lg px-3 flex items-center gap-2 ml-auto hover:bg-gray-200 transition-colors text-sm"
              >
                <Plus size={18} />
                <span className="font-semibold text-[#070606]">Add Tag</span>
              </button>
            </div>
          </div>

          {/* Deep Search */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[20px] font-medium text-black mb-4">Deep Search</h3>
            <input
              value={formData.deepSearch}
              onChange={(e) => updateField('deepSearch', e.target.value)}
              type="text"
              placeholder="Keywords comma দিয়ে আলাদা করুন (ex: mobile, phone, samsung)"
              className="w-full h-10 bg-[#f9f9f9] rounded-lg px-3 text-[12px] placeholder:text-[#a2a2a2] outline-none"
            />
          </div>

          {/* Condition */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[20px] font-medium text-black mb-4">Condition</h3>
            <SelectField
              value={formData.condition}
              onChange={(v) => updateField('condition', v)}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Used', label: 'Used' },
                { value: 'Refurbished', label: 'Refurbished' }
              ]}
              placeholder="Select Condition"
            />
          </div>
        </div>

        {/* Mobile Sidebar - shown below form on mobile */}
        <div className="lg:hidden space-y-3 xxs:space-y-4 w-full">
          {/* Flash Sale */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-[20px] font-medium text-black mb-4">Flash Sale</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Enable Flash Sale</span>
              <button
                type="button"
                onClick={() => updateField('flashSale', !formData.flashSale)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.flashSale ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.flashSale ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {formData.flashSale && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Start Date</label>
                  <input type="datetime-local" value={formData.flashSaleStartDate} onChange={(e) => updateField('flashSaleStartDate', e.target.value)} className="w-full h-10 bg-[#f9f9f9] rounded-lg px-3 text-[14px] outline-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">End Date</label>
                  <input type="datetime-local" value={formData.flashSaleEndDate} onChange={(e) => updateField('flashSaleEndDate', e.target.value)} className="w-full h-10 bg-[#f9f9f9] rounded-lg px-3 text-[14px] outline-none" />
                </div>
              </div>
            )}
          </div>
          {/* Action Buttons - Mobile */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex-1 h-9 xxs:h-10 bg-white rounded-lg flex items-center justify-center gap-1.5 xxs:gap-2 hover:bg-gray-50 text-xs xxs:text-sm"
            >
              <DraftIcon />
              <span className="font-semibold text-[#070606]">Draft</span>
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 h-9 xxs:h-10 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] rounded-lg flex items-center justify-center gap-1.5 xxs:gap-2"
            >
              <AddCircleIcon />
              <span className="text-xs xxs:text-sm font-semibold text-white">{editProduct ? 'Update' : 'Add'}</span>
            </button>
          </div>

          {/* Ready To Publish - Mobile */}
          <div className="bg-white rounded-lg p-2 xxs:p-3 sm:p-4">
            <h3 className="text-sm xxs:text-base sm:text-lg font-medium text-black mb-2 xxs:mb-3">Ready To Publish</h3>
            <div className="flex items-center gap-2 mb-2 xxs:mb-3">
              <div className="flex-1 h-1.5 xxs:h-2 bg-[#f9f9f9] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(completionPercentage)} rounded-full transition-all duration-300`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs xxs:text-sm font-medium">{completionPercentage}%</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 xxs:gap-2">
              {completionItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 xxs:gap-2">
                  <div className={`w-2.5 h-2.5 xxs:w-3 xxs:h-3 rounded-full border flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                    {item.completed && (
                      <svg className="w-1.5 h-1.5 xxs:w-2 xxs:h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[10px] xxs:text-xs ${item.completed ? 'text-black' : 'text-gray-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog - Mobile */}
          <div className="bg-white rounded-lg p-2 xxs:p-3 sm:p-4">
            <h3 className="text-sm xxs:text-base sm:text-lg font-medium text-black mb-2 xxs:mb-3">Catalog</h3>
            
            {/* Category - Mobile */}
            <div className="mb-2 xxs:mb-3">
              <SelectField
                value={formData.category}
                onChange={(v) => updateField('category', v)}
                options={localCategories.map(c => ({ value: c.name, label: c.name }))}
                placeholder="Select Category*"
                required
              />
              <button 
                onClick={() => { setCatalogModalTab('category'); setShowCatalogModal(true); }}
                className="mt-1.5 h-7 xxs:h-8 bg-[#f4f4f4] rounded-lg px-2 flex items-center gap-1 ml-auto hover:bg-gray-200 transition-colors text-xs"
              >
                <Plus size={14} />
                <span className="font-semibold text-[#070606]">Add Category</span>
              </button>
            </div>

            {/* Sub Category - Mobile */}
            <div className="mb-2 xxs:mb-3">
              <SelectField
                value={formData.subCategory}
                onChange={(v) => updateField('subCategory', v)}
                options={localSubCategories
                  .filter(sc => !formData.category || sc.categoryName === formData.category || sc.categoryId === formData.category)
                  .map(sc => ({ value: sc.name, label: sc.name }))}
                placeholder="Select Sub Category"
              />
              <button 
                onClick={() => { setCatalogModalTab('subcategory'); setShowCatalogModal(true); }}
                className="mt-1.5 h-7 xxs:h-8 bg-[#f4f4f4] rounded-lg px-2 flex items-center gap-1 ml-auto hover:bg-gray-200 transition-colors text-xs"
              >
                <Plus size={14} />
                <span className="font-semibold text-[#070606]">Add Sub Category</span>
              </button>
            </div>

            {/* Child Category - Mobile */}
            <div className="mb-2 xxs:mb-3">
              <SelectField
                value={formData.childCategory}
                onChange={(v) => updateField('childCategory', v)}
                options={localChildCategories
                  .filter(cc => !formData.subCategory || cc.subCategoryId === formData.subCategory || cc.subCategoryId === formData.subCategory)
                  .map(cc => ({ value: cc.name, label: cc.name }))}
                placeholder="Select Child Category"
              />
              <button 
                onClick={() => { setCatalogModalTab('childcategory'); setShowCatalogModal(true); }}
                className="mt-1.5 h-7 xxs:h-8 bg-[#f4f4f4] rounded-lg px-2 flex items-center gap-1 ml-auto hover:bg-gray-200 transition-colors text-xs"
              >
                <Plus size={14} />
                <span className="font-semibold text-[#070606]">Add Child Category</span>
              </button>
            </div>

            {/* Brand - Mobile */}
            <div className="mb-2 xxs:mb-3">
              <SelectField
                value={formData.brandName}
                onChange={(v) => updateField('brandName', v)}
                options={localBrands.map(b => ({ value: b.name, label: b.name }))}
                placeholder="Select Brand"
              />
              <button 
                onClick={() => { setCatalogModalTab('brand'); setShowCatalogModal(true); }}
                className="mt-1.5 h-7 xxs:h-8 bg-[#f4f4f4] rounded-lg px-2 flex items-center gap-1 ml-auto hover:bg-gray-200 transition-colors text-xs"
              >
                <Plus size={14} />
                <span className="font-semibold text-[#070606]">Add Brand</span>
              </button>
            </div>

            {/* Product Tags - Mobile */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['Flash Sale', 'New Arrival', 'Most Popular'].map((tagName) => {
                  const isSelected = formData.tag.includes(tagName);
                  return (
                    <button
                      key={tagName}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField('tag', formData.tag.filter((t: string) => t !== tagName));
                        } else {
                          updateField('tag', [...formData.tag, tagName]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                        isSelected
                          ? tagName === 'Flash Sale'
                            ? 'bg-red-500 text-white border-red-500'
                            : tagName === 'New Arrival'
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {isSelected ? '\u2713 ' : ''}{tagName}
                    </button>
                  );
                })}
              </div>
              {/* Custom Tags Mobile */}
              <SelectField
                value=""
                onChange={(v) => {
                  if (v && !formData.tag.includes(v)) {
                    updateField('tag', [...formData.tag, v]);
                  }
                }}
                options={localTags.filter(t => !['Flash Sale', 'New Arrival', 'Most Popular'].includes(t.name)).map(t => ({ value: t.name, label: t.name }))}
                placeholder="Add custom tag..."
              />
              {formData.tag.filter((t: string) => !['Flash Sale', 'New Arrival', 'Most Popular'].includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {formData.tag.filter((t: string) => !['Flash Sale', 'New Arrival', 'Most Popular'].includes(t)).map((t: string) => (
                    <span key={t} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                      {t}
                      <button type="button" onClick={() => updateField('tag', formData.tag.filter((x: string) => x !== t))} className="text-gray-400 hover:text-red-500">\u00d7</button>
                    </span>
                  ))}
                </div>
              )}
              <button 
                onClick={() => { setCatalogModalTab('tag'); setShowCatalogModal(true); }}
                className="mt-1.5 h-7 xxs:h-8 bg-[#f4f4f4] rounded-lg px-2 flex items-center gap-1 ml-auto hover:bg-gray-200 transition-colors text-xs"
              >
                <Plus size={14} />
                <span className="font-semibold text-[#070606]">Add Tag</span>
              </button>
            </div>
          </div>

          {/* Deep Search - Mobile */}
          <div className="bg-white rounded-lg p-2 xxs:p-3 sm:p-4">
            <h3 className="text-sm xxs:text-base sm:text-lg font-medium text-black mb-2 xxs:mb-3">Deep Search</h3>
            <input
              value={formData.deepSearch}
              onChange={(e) => updateField('deepSearch', e.target.value)}
              type="text"
              placeholder="Keywords comma দিয়ে আলাদা করুন (ex: mobile, phone, samsung)"
              className="w-full h-9 bg-[#f9f9f9] rounded-lg px-3 text-xs placeholder:text-[#a2a2a2] outline-none"
            />
          </div>

          {/* Condition - Mobile */}
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-medium text-black mb-3">Condition</h3>
            <SelectField
              value={formData.condition}
              onChange={(v) => updateField('condition', v)}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Used', label: 'Used' },
                { value: 'Refurbished', label: 'Refurbished' }
              ]}
              placeholder="Select Condition"
            />
          </div>
        </div>
      </div>

      {/* Add Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[95vw] sm:w-[600px] max-w-[600px] max-h-[90vh] overflow-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Add Catalog Item</h2>
              <button 
                onClick={() => setShowCatalogModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b overflow-x-auto">
              {[
                { key: 'category', label: 'Category' },
                { key: 'subcategory', label: 'Sub Category' },
                { key: 'childcategory', label: 'Child Category' },
                { key: 'brand', label: 'Brand' },
                { key: 'tag', label: 'Tag' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setCatalogModalTab(tab.key as any);
                    setNewCatalogItem({ name: '', parentCategory: '', parentSubCategory: '', image: '', isFlashSale: false, isMostSales: false, durationDays: 0 });
                  }}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    catalogModalTab === tab.key 
                      ? 'text-[#ff6a00] border-b-2 border-[#ff6a00]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Name Input - Common for all */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {catalogModalTab === 'category' ? 'Category' : 
                   catalogModalTab === 'subcategory' ? 'Sub Category' :
                   catalogModalTab === 'childcategory' ? 'Child Category' :
                   catalogModalTab === 'brand' ? 'Brand' : 'Tag'} Name *
                </label>
                <input
                  type="text"
                  value={newCatalogItem.name}
                  onChange={(e) => setNewCatalogItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Enter ${catalogModalTab} name`}
                  className="w-full h-11 border rounded-lg px-3 text-sm outline-none focus:border-[#ff6a00]"
                />
              </div>

              {/* Parent Category - for Sub Category */}
              {catalogModalTab === 'subcategory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                  <select
                    value={newCatalogItem.parentCategory}
                    onChange={(e) => setNewCatalogItem(prev => ({ ...prev, parentCategory: e.target.value }))}
                    className="w-full h-11 border rounded-lg px-3 text-sm outline-none focus:border-[#ff6a00] bg-white"
                  >
                    <option value="">Select Parent Category</option>
                    {localCategories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Parent Sub Category - for Child Category */}
              {catalogModalTab === 'childcategory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Sub Category *</label>
                  <select
                    value={newCatalogItem.parentSubCategory}
                    onChange={(e) => setNewCatalogItem(prev => ({ ...prev, parentSubCategory: e.target.value }))}
                    className="w-full h-11 border rounded-lg px-3 text-sm outline-none focus:border-[#ff6a00] bg-white"
                  >
                    <option value="">Select Parent Sub Category</option>
                    {localSubCategories.map((sub) => (
                      <option key={sub.id || sub.name} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Image Upload - for Category and Brand */}
              {(catalogModalTab === 'category' || catalogModalTab === 'brand') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {catalogModalTab === 'brand' ? 'Brand Logo' : 'Category Icon/Image'} (Optional)
                  </label>
                  <input
                    ref={catalogImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCatalogImageUpload(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => catalogImageRef.current?.click()}
                      className={`w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                        newCatalogItem.image ? 'border-[#ff6a00] bg-orange-50' : 'border-gray-300 hover:border-[#ff6a00] bg-gray-50'
                      }`}
                    >
                      {uploadingCatalogImage ? (
                        <div className="animate-spin w-6 h-6 border-2 border-[#ff6a00] border-t-transparent rounded-full" />
                      ) : newCatalogItem.image ? (
                        <img src={normalizeImageUrl(newCatalogItem.image)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <Upload size={24} />
                          <span className="text-xs mt-1">Upload</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openGalleryPicker('catalogIcon')}
                      className="h-20 px-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#ff6a00] hover:bg-orange-50 transition-colors text-gray-400"
                    >
                      <FolderOpen size={24} />
                      <span className="text-xs mt-1">Gallery</span>
                    </button>
                    {newCatalogItem.image && (
                      <button
                        onClick={() => setNewCatalogItem(prev => ({ ...prev, image: '' }))}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, 200x200px or larger
                  </p>
                </div>
              )}

              {/* Image Upload - for Sub Category */}
              {catalogModalTab === 'subcategory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category Icon (Optional)
                  </label>
                  <input
                    ref={catalogImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCatalogImageUpload(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => catalogImageRef.current?.click()}
                      className={`w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        newCatalogItem.image ? 'border-[#ff6a00] bg-orange-50' : 'border-gray-300 hover:border-[#ff6a00] bg-gray-50'
                      }`}
                    >
                      {uploadingCatalogImage ? (
                        <div className="animate-spin w-5 h-5 border-2 border-[#ff6a00] border-t-transparent rounded-full" />
                      ) : newCatalogItem.image ? (
                        <img src={normalizeImageUrl(newCatalogItem.image)} alt="Preview" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Upload size={20} className="text-gray-400" />
                      )}
                    </div>
                    {newCatalogItem.image && (
                      <button
                        onClick={() => setNewCatalogItem(prev => ({ ...prev, image: '' }))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Image Upload - for Child Category */}
              {catalogModalTab === 'childcategory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Category Icon (Optional)
                  </label>
                  <input
                    ref={catalogImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCatalogImageUpload(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => catalogImageRef.current?.click()}
                      className={`w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        newCatalogItem.image ? 'border-[#ff6a00] bg-orange-50' : 'border-gray-300 hover:border-[#ff6a00] bg-gray-50'
                      }`}
                    >
                      {uploadingCatalogImage ? (
                        <div className="animate-spin w-5 h-5 border-2 border-[#ff6a00] border-t-transparent rounded-full" />
                      ) : newCatalogItem.image ? (
                        <img src={normalizeImageUrl(newCatalogItem.image)} alt="Preview" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Upload size={20} className="text-gray-400" />
                      )}
                    </div>
                    {newCatalogItem.image && (
                      <button
                        onClick={() => setNewCatalogItem(prev => ({ ...prev, image: '' }))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Image Upload - for Tag */}
              {catalogModalTab === 'tag' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Icon (Optional)
                  </label>
                  <input
                    ref={catalogImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCatalogImageUpload(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => catalogImageRef.current?.click()}
                      className={`w-14 h-14 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        newCatalogItem.image ? 'border-[#ff6a00] bg-orange-50' : 'border-gray-300 hover:border-[#ff6a00] bg-gray-50'
                      }`}
                    >
                      {uploadingCatalogImage ? (
                        <div className="animate-spin w-4 h-4 border-2 border-[#ff6a00] border-t-transparent rounded-full" />
                      ) : newCatalogItem.image ? (
                        <img src={normalizeImageUrl(newCatalogItem.image)} alt="Preview" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Upload size={18} className="text-gray-400" />
                      )}
                    </div>
                    {newCatalogItem.image && (
                      <button
                        onClick={() => setNewCatalogItem(prev => ({ ...prev, image: '' }))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tag Duration - for Tag */}
              {catalogModalTab === 'tag' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Days)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Set how many days this tag will stay active in the store. Leave 0 for permanent.
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={newCatalogItem.durationDays || ''}
                    onChange={(e) => setNewCatalogItem(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g. 7 for one week"
                    className="w-full h-11 border rounded-lg px-3 text-sm outline-none focus:border-[#ff6a00]"
                  />
                  {newCatalogItem.durationDays > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Tag will expire on: {new Date(Date.now() + newCatalogItem.durationDays * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {/* Flash Sale & Most Sales - for Category */}
              {catalogModalTab === 'category' && (
                <div className="flex gap-3 sm:gap-4 lg:gap-4 xl:gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCatalogItem.isFlashSale}
                      onChange={(e) => setNewCatalogItem(prev => ({ ...prev, isFlashSale: e.target.checked }))}
                      className="w-4 h-4 accent-[#ff6a00]"
                    />
                    <span className="text-sm text-gray-700">⚡ Flash Sale Category</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCatalogItem.isMostSales}
                      onChange={(e) => setNewCatalogItem(prev => ({ ...prev, isMostSales: e.target.checked }))}
                      className="w-4 h-4 accent-[#ff6a00]"
                    />
                    <span className="text-sm text-gray-700">🔥 Most Sales Category</span>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCatalogItem}
                disabled={savingCatalog}
                className="px-5 py-2.5 text-sm bg-[#ff6a00] text-white rounded-lg hover:bg-[#e55d00] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingCatalog && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {savingCatalog ? 'Saving...' : `Add ${catalogModalTab.charAt(0).toUpperCase() + catalogModalTab.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Picker Modal */}
      <GalleryPicker
        isOpen={showGalleryPicker}
        onClose={() => {
          setShowGalleryPicker(false);
          setGalleryPickerTarget(null);
          setGalleryPickerVariantKey(null);
        }}
        onSelect={handleGallerySelect}
        multiple={galleryPickerTarget === 'gallery'}
        onSelectMultiple={galleryPickerTarget === 'gallery' ? handleGallerySelectMultiple : undefined}
        title={
          galleryPickerTarget === 'mainImage' ? 'Select Main Image' :
          galleryPickerTarget === 'gallery' ? 'Select Gallery Images' :
          galleryPickerTarget === 'variantImage' ? 'Select Variant Image' :
          'Select Image'
        }
      />
    </div>
  );
};

export default FigmaProductUpload;
