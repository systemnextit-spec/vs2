interface MetaDataProduct {
    description?: string;
    details?: Array<{ type: string; description: string }>;
}

interface MetaDataProps {
    product: MetaDataProduct;
}

// Strip HTML tags for plain text display
const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
};

export default function MetaData({ product }: MetaDataProps) {
    // Show short description: stripped HTML, limited to ~200 chars
    const rawDescription = product.description || '';
    const plainText = stripHtml(rawDescription);
    
    if (!plainText) return null;
    
    // Truncate to ~200 chars at word boundary
    const shortDesc = plainText.length > 200
        ? plainText.substring(0, 200).replace(/\s+\S*$/, '') + '...'
        : plainText;

    return (
        <div className="mb-6">
            <p className="text-sm text-gray-600 font-lato leading-relaxed line-clamp-4">
                {shortDesc}
            </p>
        </div>
    );
}
