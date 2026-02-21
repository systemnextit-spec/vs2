
type ProductPricing = {
    price: number;
    originalPrice: number;
    discount: number;
};

type PriceProps = {
    product: ProductPricing;
};
export default function Price({ product }: PriceProps) {
    return (
        <div>
            <div className="flex items-center gap-1.5">
                <span className="text-2xl md:text-3xl font-urbanist font-bold text-black">
                    ৳{product.price}
                </span>
                <span className="text-[16px] md:text-2xl font-urbanist text-[#B3B3B3] line-through">
                    ৳{product.originalPrice}
                </span>
                <span className="bg-[#FF9F1C] font-lato text-white text-[10px] md:text-xs font-bold px-1 py-0.5 rounded-full">
                    {product.discount}% OFF
                </span>
            </div>
        </div>
    )
}
