
import { useState } from "react";

const dummyImages = [
    "/images/img1.jpg",
    "/images/img2.png",
    "/images/img3.jpeg",
    "/images/img4.jpg",
    "/images/img5.jpg",
];

export default function Color() {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    return (
        <div className="w-full">
            <h2 className="mb-3 text-[16px] font-lato font-normal text-black leading-[125%]">Colour</h2>

            <div className="flex gap-2">
                {dummyImages.slice(0, 4).map((img, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedIndex(index)}
                        className={`relative h-[60px] w-[60px] overflow-hidden rounded-sm transition-all duration-200
              ${selectedIndex === index
                                ? ""
                                : ""
                            }`}
                    >
                        <img
                            src={img}
                            alt={`Image ${index + 1}`}
                            className="object-cover w-full h-full absolute inset-0"
                        />

                        {/* Tick Mark */}
                        {selectedIndex === index && (
                            <div className="absolute left-1 top-1 ">
                                <img
                                    src='/images/check.svg'
                                    alt="check"
                                    width={12}
                                    height={12}
                                />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
