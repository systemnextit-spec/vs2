
interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    oldPrice?: number;
    image: string;
    isSale?: boolean;
}

const dummyProducts: Product[] = [
    {
        id: "1",
        title: "A Kids Book About Yoga",
        description: "Yoga is a way to discover more about ourselves and our connection...",
        price: 4.53,
        oldPrice: 5.00,
        image: "/images/book.png",
        isSale: true,
    },
    {
        id: "2",
        title: "A Kids Book About Yoga",
        description: "Yoga is a way to discover more about ourselves and our connection...",
        price: 4.53,
        oldPrice: 5.00,
        image: "/images/book.png",
        isSale: true,
    },
    {
        id: "3",
        title: "A Kids Book About Yoga",
        description: "Yoga is a way to discover more about ourselves and our connection...",
        price: 4.53,
        oldPrice: 5.00,
        image: "/images/book.png",
        isSale: true,
    },
    {
        id: "4",
        title: "A Kids Book About Yoga",
        description: "Yoga is a way to discover more about ourselves and our connection...",
        price: 4.53,
        oldPrice: 5.00,
        image: "/images/book.png",
        isSale: true,
    },
];

export default function RecentProduct() {
    return (
        <div>
            <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-lato font-bold">Recent Products</h2>
            </div>

            {/* Product List */}
            <div className="space-y-4 lg:space-y-5">
                {dummyProducts.map((product) => (
                    <div key={product.id} className="flex gap-4 items-start pb-3 border-b border-gray-100 last:border-0">
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
                            <p className="text-xs text-[#727272] mt-1 font-roboto font-normal line-clamp-2">
                                {product.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-[#2F3485] font-bold text-[14px] lg:text-[16px] font-roboto">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    {product.oldPrice && (
                                        <span className="text-[#666] font-roboto font-normal line-through text-xs">
                                            ${product.oldPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <a href="#" className="text-xs text-[#15A4EC] font-roboto font-medium hover:underline">
                                    Get 10 Coins
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}