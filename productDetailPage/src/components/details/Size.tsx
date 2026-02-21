
import { useState } from "react";

const sizes = ["S", "M", "L", "XL", "XXL"];

export default function Size() {
    const [selectedSize, setSelectedSize] = useState<string>("L");

    return (
        <div className="w-full">
            <h2 className="mb-3 text-[16px] font-lato font-normal text-black leading-[125%]">Size</h2>

            <div className="flex items-center gap-4">
                {sizes.map((size) => (
                    <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className="flex items-center gap-2"
                    >
                        {/* Circle */}
                        <div
                            className={`flex h-6 w-6 font-lato items-center justify-center rounded-full border transition-all duration-200
                ${selectedSize === size
                                    ? "border-black"
                                    : "border-black"
                                }`}
                        >
                            {selectedSize === size && (
                                <span className="text-sm font-bold text-black">✓</span>
                            )}
                        </div>

                        {/* Text */}
                        <span className="text-[12px] font-medium font-lato text-black">{size}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
