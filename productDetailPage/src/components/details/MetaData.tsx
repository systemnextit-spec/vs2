interface MetaDataProduct {
    material?: string;
    brand?: string;
    features?: string[];
    modelNumber?: string;
    origin?: string;
    colors?: string[];
}

interface MetaDataProps {
    product: MetaDataProduct;
}

export default function MetaData({ product }: MetaDataProps) {
    const entries: Array<{ label: string; value: string }> = [];
    if (product.material) entries.push({ label: "Material", value: product.material });
    if (product.brand) entries.push({ label: "Brand", value: product.brand });
    if (product.features?.length) entries.push({ label: "Features", value: product.features.join(", ") });
    if (product.modelNumber) entries.push({ label: "Model Number", value: product.modelNumber });
    if (product.origin) entries.push({ label: "Origin", value: product.origin });
    if (product.colors?.length) entries.push({ label: "Colors", value: product.colors.join(", ") });

    if (entries.length === 0) return null;

    return (
        <div>
            <div className="text-sm text-black space-y-1 mb-9">
                {entries.map((entry, i) => (
                    <div key={i}>
                        <span className="text-black font-urbanist">{entry.label}:</span> {entry.value}
                    </div>
                ))}
            </div>
        </div>
    )
}
