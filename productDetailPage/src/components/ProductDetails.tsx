import MobileNav from "./nav/MobileNav";
import DesktopNav from "./nav/DesktopNav";
import MobileTabBar from "./topbar/MobileTabBar";
import AnnouncedBar from "./AnnouncedBar";
import ProductMain from "./ProductMain";
import RelatedProduct from "./details/RelatedProduct";
import RecentProduct from "./details/RecentProduct";
import Description from "./details/Description";
import Footer from "./Footer";
import MobileCategories from "./details/Mobilecategories";
import React, { useState } from "react";

export interface ModernProductDetailProps {
    product: {
        id: number;
        name: string;
        price: number;
        originalPrice?: number;
        discount?: string | number;
        rating?: number;
        reviews?: number;
        category?: string;
        image: string;
        galleryImages?: string[];
        colors?: string[];
        sizes?: string[];
        brand?: string;
        description?: string;
        videoUrl?: string;
        totalSold?: number;
        tags?: string[];
        stock?: number;
        variantGroups?: Array<{
            title: string;
            isMandatory?: boolean;
            options: Array<{ attribute: string; extraPrice: number; image?: string }>;
        }>;
        details?: Array<{ type: string; description: string }>;
    };
    relatedProducts?: Array<{
        id: number;
        name: string;
        price: number;
        originalPrice?: number;
        image: string;
        rating?: number;
        totalSold?: number;
        description?: string;
        discount?: string | number;
    }>;
    recentProducts?: Array<{
        id: number;
        name: string;
        price: number;
        originalPrice?: number;
        image: string;
        description?: string;
    }>;
    categories?: Array<{ id?: number | string; name: string; image?: string }>;
    websiteConfig?: {
        websiteName?: string;
        headerSliderText?: string;
        whatsappNumber?: string;
        phones?: string[];
        addresses?: string[];
        footerQuickLinks?: Array<{ label: string; url: string }>;
        footerUsefulLinks?: Array<{ label: string; url: string }>;
        socialLinks?: Array<{ type: string; url: string }>;
        footerLogo?: string | null;
        headerLogo?: string | null;
        shopCurrency?: string;
        aboutUs?: string;
        privacyPolicy?: string;
        termsAndConditions?: string;
        returnPolicy?: string;
    };
    logo?: string | null;
    onBack?: () => void;
    onProductClick?: (productId: number) => void;
    onAddToCart?: () => void;
    onCheckout?: () => void;
    onShare?: () => void;
    cart?: number[];
    onToggleCart?: (id: number) => void;
    currency?: string;
    tenantId?: string;
    user?: { name: string; email: string } | null;
    onLoginClick?: () => void;
}

export default function ProductDetailsPage({
    product,
    relatedProducts = [],
    recentProducts = [],
    categories = [],
    websiteConfig,
    logo,
    onBack,
    onProductClick,
    onAddToCart,
    onCheckout,
    onShare,
    cart,
    onToggleCart,
    currency = "\u09F3",
    tenantId,
    user,
    onLoginClick,
}: ModernProductDetailProps) {
    const [quantity, setQuantity] = useState(1);

    // Build images array from product
    const images = product?.galleryImages?.length
        ? product.galleryImages
        : product?.image
        ? [product.image]
        : [];

    // Map product data for child components
    const mappedProduct = {
        id: product?.id || 0,
        title: product?.name || "",
        titleBn: product?.name || "",
        price: product?.price || 0,
        originalPrice: product?.originalPrice || product?.price || 0,
        discount: typeof product?.discount === "string" ? parseInt(product.discount) || 0 : product?.discount || 0,
        rating: product?.rating || 0,
        reviewCount: product?.reviews || 0,
        category: product?.category || "",
        images,
        colors: product?.colors || [],
        sizes: product?.sizes || [],
        brand: product?.brand || "",
        description: product?.description || "",
        videoUrl: product?.videoUrl || "",
        material: "",
        features: [] as string[],
        modelNumber: "",
        origin: "",
        dimensions: "",
        weight: "",
        variantGroups: product?.variantGroups || [],
        details: product?.details || [],
    };

    const logoUrl = logo || websiteConfig?.headerLogo || websiteConfig?.footerLogo || "";
    const announcementText = websiteConfig?.headerSliderText || "";
    const phoneNumber = websiteConfig?.whatsappNumber || websiteConfig?.phones?.[0] || "";

    // Map related products for display
    const mappedRelated = relatedProducts.map((p) => ({
        id: String(p.id),
        title: p.name,
        description: p.description || "",
        price: p.price,
        oldPrice: p.originalPrice,
        rating: p.rating,
        sold: p.totalSold,
        image: p.image,
        isSale: !!(p.discount || (p.originalPrice && p.originalPrice > p.price)),
    }));

    const mappedRecent = recentProducts.map((p) => ({
        id: String(p.id),
        title: p.name,
        description: p.description || "",
        price: p.price,
        oldPrice: p.originalPrice,
        image: p.image,
    }));

    const mappedCategories = categories.map((c) => ({
        id: String(c.id || ""),
        name: c.name,
        image: c.image || "",
    }));

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <DesktopNav logo={logoUrl} onBack={onBack} cart={cart} onToggleCart={onToggleCart} />
            <MobileNav logo={logoUrl} onBack={onBack} cart={cart} onToggleCart={onToggleCart} />
            <div className="bg-white">
                <AnnouncedBar text={announcementText} onHomeClick={onBack} />
            </div>

            {/*Section 1 */}
            <main className="max-w-[1720px] mx-auto px-4 lg:px-8 py-4 lg:py-8">
                <div className="lg:flex lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <ProductMain
                            product={mappedProduct}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onAddToCart={onAddToCart}
                            onCheckout={onCheckout}
                            onShare={onShare}
                            phoneNumber={phoneNumber}
                            currency={currency}
                        />
                    </div>
                    {/* Related product desktop*/}
                    <div className="hidden lg:block h-fit w-72 xl:w-80 bg-white px-4 py-6 rounded-2xl flex-shrink-0">
                        <RelatedProduct products={mappedRelated} onProductClick={onProductClick} currency={currency} />
                    </div>
                </div>
            </main>

            {/* sidebar */}
            <main className="max-w-[1720px] mx-auto px-4 lg:px-8 py-4 lg:py-8 pb-4 lg:pb-8 text-gray-900">
                <div className="lg:flex lg:gap-6">
                    <div className="w-full lg:flex-1 min-w-0">
                        <Description product={mappedProduct} tenantId={tenantId} user={user} onLoginClick={onLoginClick} />
                    </div>
                    {/* Recent product */}
                    <div className="hidden lg:block h-fit w-72 xl:w-80 bg-white px-4 py-6 rounded-2xl flex-shrink-0">
                        <RecentProduct products={mappedRecent} onProductClick={onProductClick} currency={currency} />
                    </div>
                </div>
            </main>

            {/*mobile related product */}
            <section className="lg:hidden max-w-[1720px] mx-auto px-4 py-4">
                <div className="rounded-2xl py-6">
                    <RelatedProduct products={mappedRelated} onProductClick={onProductClick} currency={currency} />
                </div>
            </section>

            {/* mobile recent product */}
            <section className="lg:hidden max-w-[1720px] mx-auto px-4 py-4">
                <div className="rounded-2xl py-6">
                    <RecentProduct products={mappedRecent} onProductClick={onProductClick} currency={currency} />
                </div>
            </section>

            {/* mobile categories*/}
            <section className="lg:hidden max-w-[1720px] mx-auto py-4 pb-8">
                <MobileCategories categories={mappedCategories} onCategoryClick={onProductClick ? (name: string) => {} : undefined} />
            </section>

            {/* Mobile tab bar */}
            <MobileTabBar onHomeClick={onBack} />

            {/* Footer */}
            <Footer
                logo={websiteConfig?.footerLogo || logoUrl}
                websiteName={websiteConfig?.websiteName}
                addresses={websiteConfig?.addresses}
                footerQuickLinks={websiteConfig?.footerQuickLinks}
                footerUsefulLinks={websiteConfig?.footerUsefulLinks}
                socialLinks={websiteConfig?.socialLinks}
            />
        </div>
    );
}
