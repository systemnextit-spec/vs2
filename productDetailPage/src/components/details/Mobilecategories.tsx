// components/details/MobileCategories.tsx

import { Category } from "../../@types/IProduct.type";

const dummyCategories: Category[] = [
    { id: "1", name: "Gadgets Item", image: "/images/book.png" },
    { id: "2", name: "Gift Item", image: "/images/book.png" },
    { id: "3", name: "Toy Corner", image: "/images/book.png" },
    { id: "4", name: "Home Decor", image: "/images/book.png" },
];

export default function MobileCategories() {
    return (
        <div className="bg-white rounded-2xl px-4 py-6">
            <h2 className="text-xl font-lato font-bold mb-4">Categories</h2>
            <div className="space-y-3">
                {dummyCategories.map((cat) => (
                    <a
                        key={cat.id}
                        href="#"
                        className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition"
                    >
                        <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="object-cover w-full h-full absolute inset-0"
                            />
                        </div>
                        <span className="text-[15px] font-roboto font-medium text-black">
                            {cat.name}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}