import MobileNav from "./nav/MobileNav";
import DesktopNav from "./nav/DesktopNav";
import { Product } from "@/@types/IProduct.type";
import MobileTabBar from "./topbar/MobileTabBar";
import AnnouncedBar from "./AnnouncedBar";
import ProductMain from "./ProductMain";
import RelatedProduct from "./details/RelatedProduct";
import RecentProduct from "./details/RecentProduct";
import Description from "./details/Description";
import Footer from "./Footer";
import MobileCategories from "./details/Mobilecategories";

const product: Product = {
    id: 1,
    title: "Magnetic Suction Vacuum Tab/Phone Holder",
    titleBn: "ম্যাগনেটিক সাকশন ভ্যাকুয়াম ট্যাব/ফোন হোল্ডার",
    price: 650,
    originalPrice: 950,
    discount: 32,
    rating: 4.5,
    reviewCount: 26,
    category: "Smart Gadgets",
    images: [
        "/images/product1.jpg",
        "/images/product2.jpg",
        "/images/product3.jpg",
        "/images/product4.jpg",
    ],
    colors: ["#C0C0C0", "#1a1a1a", "#2563EB", "#e5e7eb"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    material: "ABS+Silicone",
    brand: "Universal",
    features: ["Portable", "Flexible", "Magnetic"],
    modelNumber: "A2",
    origin: "Guangdong, China",
    dimensions: "21X15X4 cm",
    weight: "0.150 kg",
    description:
        "This vacuum magnetic car mount is made of ABS+Silicone, ensuring durability and flexibility. Compatible with 3.5″–7″ mobile phones, features a magnetic fixing mode, portable and adjustable for universal use in cars, on desks, or in beds.",
};

export default function ProductDetailsPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <DesktopNav />
            <MobileNav />
            <div className="bg-white">
                <AnnouncedBar />
            </div>

            {/*Section 1 */}
            <main className="max-w-[1720px] mx-auto px-4 lg:px-8 py-4 lg:py-8">
                <div className="lg:flex lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <ProductMain product={product} />
                    </div>
                    {/* Related product desktop*/}
                    <div className="hidden lg:block h-fit w-72 xl:w-80 bg-white px-4 py-6 rounded-2xl flex-shrink-0">
                        <RelatedProduct />
                    </div>
                </div>
            </main>

            {/* sidebar */}
            <main className="max-w-[1720px] mx-auto px-4 lg:px-8 py-4 lg:py-8 pb-4 lg:pb-8">
                <div className="lg:flex lg:gap-6">
                    <div className="w-full lg:flex-1 min-w-0">
                        <Description />
                    </div>
                    {/* Recent product */}
                    <div className="hidden lg:block h-fit w-72 xl:w-80 bg-white px-4 py-6 rounded-2xl flex-shrink-0">
                        <RecentProduct />
                    </div>
                </div>
            </main>

            {/*mobile related product */}
            <section className="lg:hidden max-w-[1720px] mx-auto px-4 py-4">
                <div className="rounded-2xl py-6">
                    <RelatedProduct />
                </div>
            </section>

            {/* mobile recent product */}
            <section className="lg:hidden max-w-[1720px] mx-auto px-4 py-4">
                <div className="rounded-2xl py-6">
                    <RecentProduct />
                </div>
            </section>

            {/* mobile categories*/}
            <section className="lg:hidden max-w-[1720px] mx-auto py-4 pb-8">
                <MobileCategories />
            </section>

            {/* Mobile tab bar */}
            <MobileTabBar />

            {/* Footer */}
            <Footer />
        </div>
    );
}