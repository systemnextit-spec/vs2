import { ChevronRight } from "lucide-react";

// Strip HTML tags for plain text display
const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
};
// Truncate to N words
const truncateWords = (text: string, maxWords: number = 4): string => {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '..';
};



interface RelatedProductItem {
    id: string;
    title: string;
    description: string;
    price: number;
    oldPrice?: number;
    rating?: number;
    sold?: number;
    image: string;
    isSale?: boolean;
}

interface RelatedProductProps {
    products?: RelatedProductItem[];
    onProductClick?: (productId: number) => void;
    currency?: string;
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
            <svg
                key={i}
                className={`w-3 h-3 ${i <= Math.round(rating) ? "text-amber-400" : "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

export default function RelatedProduct({ products = [], onProductClick, currency = "\u09F3" }: RelatedProductProps) {
    if (products.length === 0) return null;

    const handleClick = (id: string) => {
        if (onProductClick) {
            onProductClick(parseInt(id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-lato font-bold">Related Product</h2>
                <a href="#" className="flex gap-0.5 text-[14px] lg:text-[16px] items-center text-black font-lato font-medium">
                    View More
                    <ChevronRight width={12} height={16} color="#1E90FF" />
                </a>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:hidden">
                {products.slice(0, 4).map((product) => (
                    <div key={product.id} onClick={() => handleClick(product.id)} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer">
                        <div className="relative w-full aspect-square">
                            {product.isSale && (
                                <span className="absolute top-2 left-2 z-10 bg-[#FF3C3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SALE</span>
                            )}
                            <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            <img src={product.image} alt={product.title} className="object-cover w-full h-full absolute inset-0" />
                        </div>
                        <div className="p-2">
                            <div className="flex items-center gap-1 mb-1">
                                {product.rating && <StarRating rating={product.rating} />}
                                {product.sold !== undefined && (
                                    <>
                                        <span className="text-[10px] text-gray-500">({product.sold})</span>
                                        <span className="text-[10px] text-gray-400 ml-1">| {product.sold} Sold</span>
                                    </>
                                )}
                            </div>
                            <h3 className="text-[12px] font-roboto font-medium leading-tight line-clamp-2 mb-1">{truncateWords(product.title)}</h3>
                            {product.description && <p className="text-[10px] text-[#727272] line-clamp-2 mb-1.5">{stripHtml(product.description)}</p>}
                            <div className="flex items-center gap-1 mb-1">
                                {product.oldPrice && (
                                    <span className="text-[#FF3C3C] font-bold text-[12px] font-roboto line-through">{currency}{product.oldPrice}</span>
                                )}
                                <span className="text-[#2F3485] font-bold text-[12px] font-roboto">{currency}{product.price}</span>
                            </div>
                            <div className="flex gap-1.5">
                                <button className="flex-1 flex items-center justify-center gap-1 bg-[linear-gradient(0deg,#38BDF8_0%,#1E90FF_100%)] text-white text-[11px] font-bold py-1.5 rounded-[6px]">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Cart
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-1 bg-[linear-gradient(180deg,#FF6A00_0%,#FF9F1C_100%)] text-white text-[11px] font-bold py-1.5 rounded-[6px]">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* desktop */}
            <div className="hidden lg:block space-y-5">
                {products.slice(0, 4).map((product) => (
                    <div key={product.id} onClick={() => handleClick(product.id)} className="flex gap-6 items-start pb-3 cursor-pointer">
                        <div className="relative w-20 h-24 flex-shrink-0">
                            <img src={product.image} alt={product.title} className="object-cover rounded-md w-full h-full absolute inset-0" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-[16px] text-gray-900 font-roboto font-medium">{truncateWords(product.title)}</h3>
                                {product.isSale && (
                                    <span className="bg-[#FF3C3C] font-roboto font-bold text-white text-xs px-2 py-0.5 rounded-full">SALE</span>
                                )}
                            </div>
                            {product.description && (
                                <p className="text-xs text-[#727272] mt-2 font-roboto font-normal line-clamp-2">{stripHtml(product.description)}</p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-[#2F3485] font-bold text-[16px] font-roboto">{currency}{product.price}</span>
                                    {product.oldPrice && (
                                        <span className="text-[#666] font-roboto font-normal line-through text-xs">{currency}{product.oldPrice}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
