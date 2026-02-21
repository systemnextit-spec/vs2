import React from 'react'

export default function Description() {
    return (
        <div className="flex-1 min-w-0 px-0 mdpx-4 py-6 rounded-2xl">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button className="border border-[#FF6A00] px-5 py-2 text-base lg:text-2xl font-medium leading-[150%] font-lato rounded-[32px] whitespace-nowrap">বিবরণ</button>
                <button className="px-5 py-2 text-base lg:text-2xl font-medium leading-[150%] font-lato rounded-[32px] whitespace-nowrap">সবিস্তার বিবরণী</button>
                <button className="px-5 py-2 text-base lg:text-2xl font-medium leading-[150%] font-lato rounded-[32px] whitespace-nowrap">ক্রেতার মতব্য</button>
            </div>
            <div className="mt-6 block lg:hidden">
                <img
                    src="/images/videoBanner.png"
                    alt="play"
                    className="w-full h-auto rounded-xl"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row items-start gap-4 mt-6 lg:mt-10">
                {/* Text Info */}
                <div className="w-full lg:w-[50%]">
                    <p className="font-lato text-[16px] leading-[150%]">Material: ABS</p>
                    <p className="font-lato text-[16px] leading-[150%]">Compatible brand: universal</p>
                    <p className="font-lato text-[16px] leading-[150%]">Feature: Portable, Flexible, Magnetic</p>
                    <p className="font-lato text-[16px] leading-[150%]">Usage: For living, Bed, Desk, For car dashboard</p>
                    <p className="font-lato text-[16px] leading-[150%]">Usage: For living, Bed, Desk, For car dashboard</p>
                    <p className="font-lato text-[16px] leading-[150%]">Device fix mode: Magnetic</p>
                    <p className="font-lato text-[16px] leading-[150%]">Charger: No</p>
                    <p className="font-lato text-[16px] leading-[150%]">Model number: A2</p>
                    <p className="font-lato text-[16px] leading-[150%]">Place of origin: Guangdong, China</p>
                    <p className="font-lato text-[16px] leading-[150%]">Product name: Desk Mobile Phone Mount Holder</p>
                    <p className="font-lato text-[16px] leading-[150%]">Color: silver, black</p>
                    <p className="font-lato text-[16px] leading-[150%]">Function: Adjustable Universal</p>
                    <p className="font-lato text-[16px] leading-[150%]">Material: ABS+Silicone</p>
                    <p className="font-lato text-[16px] leading-[150%]">Compatible: Universal Smart Phone Tablet</p>
                </div>

                <div className="hidden lg:block w-[50%]">
                    <img
                        src="/images/videoBanner.png"
                        alt="play"
                        className="m-auto"
                    />
                </div>
            </div>
            <p className="font-lato text-[16px] leading-[150%] mt-8">
                Packaging and delivery
                Selling Units: Single item
                Single package size: 21X15X4 cm
                Single gross weight: 0.150 kg Feature highlights: This vacuum magnetic car mount is made of ABS+Silicone, ensuring durability and flexibility. It is compatible with mobile phones, features a magnetic fixing mode, and is portable and adjustable for universal use in cars, on desks, or in beds. Available in black and white.
            </p>
        </div>
    )
}