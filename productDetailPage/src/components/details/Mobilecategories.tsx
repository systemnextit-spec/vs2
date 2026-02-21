interface MobileCategoryItem {
    id: string;
    name: string;
    image: string;
}

interface MobileCategoriesProps {
    categories?: MobileCategoryItem[];
    onCategoryClick?: (name: string) => void;
}

export default function MobileCategories({ categories = [], onCategoryClick }: MobileCategoriesProps) {
    if (categories.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl px-4 py-6">
            <h2 className="text-xl font-lato font-bold mb-4">Categories</h2>
            <div className="space-y-3">
                {categories.map((cat) => (
                    <a
                        key={cat.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); onCategoryClick?.(cat.name); }}
                        className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition"
                    >
                        {cat.image ? (
                            <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="object-cover w-full h-full absolute inset-0"
                                />
                            </div>
                        ) : (
                            <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl flex items-center justify-center">
                                <span className="text-gray-400 text-xl">{cat.name.charAt(0)}</span>
                            </div>
                        )}
                        <span className="text-[15px] font-roboto font-medium text-black">
                            {cat.name}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
