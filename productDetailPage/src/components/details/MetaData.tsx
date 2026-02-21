interface MetaDataProduct {
    material?: string;
    brand?: string;
    features?: string[];
    modelNumber?: string;
    origin?: string;
    colors?: string[];
    details?: Array<{ type: string; description: string }>;
}

interface MetaDataProps {
    product: MetaDataProduct;
}

export default function MetaData({ product }: MetaDataProps) {
    const entries: Array<{ label: string; value: string }> = [];
    
    // Key features from details (from product upload form)
    if (product.details?.length) {
        for (const detail of product.details) {
            if (detail.type?.trim() && detail.description?.trim()) {
                entries.push({ label: detail.type, value: detail.description });
            }
        }
    }
    
    // Fallback to individual fields if no details
    if (entries.length === 0) {
        if (product.brand) entries.push({ label: "Brand", value: product.brand });
        if (product.material) entries.push({ label: "Material", value: product.material });
        if (product.features?.length) entries.push({ label: "Features", value: product.features.join(", ") });
        if (product.modelNumber) entries.push({ label: "Model Number", value: product.modelNumber });
        if (product.origin) entries.push({ label: "Origin", value: product.origin });
        if (product.colors?.length) entries.push({ label: "Colors", value: product.colors.join(", ") });
    }

    if (entries.length === 0) return null;

    return (
        <div>
            <div className="text-sm text-black space-y-1 mb-9">
                {entries.map((entry, i) => (
                    <div key={i}>
                        <span className="text-black font-urbanist font-semibold">{entry.label}:</span>{" "}
                        <span className="font-urbanist">{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
