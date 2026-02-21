interface DescriptionProduct {
    title?: string;
    description?: string;
    material?: string;
    brand?: string;
    features?: string[];
    modelNumber?: string;
    origin?: string;
    dimensions?: string;
    weight?: string;
    videoUrl?: string;
    colors?: string[];
    details?: Array<{ type: string; description: string }>;
}

interface DescriptionProps {
    product: DescriptionProduct;
}

export default function Description({ product }: DescriptionProps) {
    // Extract YouTube video ID if available
    const getYouTubeVideoId = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = product.videoUrl ? getYouTubeVideoId(product.videoUrl) : null;
    const videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

    // Build specs from details (key features) first, then fallback to individual fields
    const specs: Array<{ label: string; value: string }> = [];
    if (product.details?.length) {
        for (const detail of product.details) {
            if (detail.type?.trim() && detail.description?.trim()) {
                specs.push({ label: detail.type, value: detail.description });
            }
        }
    }
    if (specs.length === 0) {
        if (product.material) specs.push({ label: "Material", value: product.material });
        if (product.brand) specs.push({ label: "Compatible brand", value: product.brand });
        if (product.features?.length) specs.push({ label: "Feature", value: product.features.join(", ") });
        if (product.modelNumber) specs.push({ label: "Model number", value: product.modelNumber });
        if (product.origin) specs.push({ label: "Place of origin", value: product.origin });
        if (product.colors?.length) specs.push({ label: "Color", value: product.colors.join(", ") });
    }

    return (
        <div className="flex-1 min-w-0 px-0 mdpx-4 py-6 rounded-2xl">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button className="border border-[#FF6A00] px-5 py-2 text-base lg:text-2xl font-medium leading-[150%] font-lato rounded-[32px] whitespace-nowrap">Description</button>
                <button className="px-5 py-2 text-base lg:text-2xl font-medium leading-[150%] font-lato rounded-[32px] whitespace-nowrap">Specification</button>
                <button className="px-5 py-2 text-base lg:text-2xl font-medium leading-[150%] font-lato rounded-[32px] whitespace-nowrap">Reviews</button>
            </div>
            
            {videoThumbnail && (
                <div className="mt-6 block lg:hidden">
                    <img
                        src={videoThumbnail}
                        alt="Video"
                        className="w-full h-auto rounded-xl"
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col lg:flex-row items-start gap-4 mt-6 lg:mt-10">
                <div className="w-full lg:w-[50%]">
                    {specs.length > 0 ? (
                        specs.map((spec, i) => (
                            <p key={i} className="font-lato text-[16px] leading-[150%]">{spec.label}: {spec.value}</p>
                        ))
                    ) : product.description ? (
                        <p className="font-lato text-[16px] leading-[150%]">{product.description}</p>
                    ) : (
                        <p className="font-lato text-[16px] leading-[150%] text-gray-400">No description available</p>
                    )}
                </div>
                {videoThumbnail && (
                    <div className="hidden lg:block w-[50%]">
                        <img
                            src={videoThumbnail}
                            alt="Video"
                            className="m-auto rounded-xl"
                        />
                    </div>
                )}
            </div>
            {product.description && specs.length > 0 && (
                <p className="font-lato text-[16px] leading-[150%] mt-8">
                    {product.dimensions && `Single package size: ${product.dimensions} `}
                    {product.weight && `Single gross weight: ${product.weight} `}
                    {product.description}
                </p>
            )}
        </div>
    )
}
