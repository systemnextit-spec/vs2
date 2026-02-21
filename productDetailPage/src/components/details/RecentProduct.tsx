// Strip HTML tags for plain text display
const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
};

interface RecentProductItem {
    id: string;
    title: string;
    description: string;
    price: number;
    oldPrice?: number;
    image: string;
}

interface RecentProductProps {
    products?: RecentProductItem[];
    onProductClick?: (productId: number) => void;
    currency?: string;
}

export default function RecentProduct({ products = [], onProductClick, currency = "\u09F3" }: RecentProductProps) {
    if (products.length === 0) return null;

    const handleClick = (id: string) => {
        if (onProductClick) {
            onProductClick(parseInt(id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-lato font-bold">Recent Products</h2>
            </div>
            <div className="space-y-4 lg:space-y-5">
                {products.slice(0, 4).map((product) => (
                    <div key={product.id} onClick={() => handleClick(product.id)} className="flex gap-4 items-start pb-3 border-b border-gray-100 last:border-0 cursor-pointer">
                        <div className="relative w-16 h-20 lg:w-20 lg:h-24 flex-shrink-0">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="object-cover rounded-md w-full h-full absolute inset-0"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[14px] lg:text-[16px] font-roboto font-medium line-clamp-1">
                                {product.title}
                            </h3>
                            {product.description && (
                                <p className="text-xs text-[#727272] mt-1 font-roboto font-normal line-clamp-2">
                                    {stripHtml(product.description)}
                                </p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-[#2F3485] font-bold text-[14px] lg:text-[16px] font-roboto">
                                        {currency}{product.price}
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-[#666] font-roboto font-normal line-through text-xs">
                                            {currency}{product.oldPrice}
                                        </span>
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
