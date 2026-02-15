# Store Studio Feature

## Overview

Store Studio is a visual store customization system that allows tenants to design their storefront without writing code. When enabled, it provides:

- **Visual Layout Builder**: Drag-and-drop interface to design store sections
- **Product Order Management**: Rearrange products to control their display order
- **Element Customization**: Edit colors, fonts, sizes, and other styling properties
- **Live Preview**: See changes in real-time with image/video previews
- **Per-Tenant Configuration**: All settings are saved separately for each tenant

## Architecture

### Database Structure

Store Studio configuration is stored in the `tenant_data` collection with the following keys:

#### `store_studio_config`
```typescript
{
  tenantId: string;
  enabled: boolean; // Master toggle for Store Studio
  productDisplayOrder?: number[]; // Array of product IDs in display order
  customLayout?: {
    sections: any[];
    version?: number;
    publishedAt?: string;
  };
  updatedAt: string;
  updatedBy?: string;
}
```

#### `store_layout`
Stores the custom layout sections created in the Page Builder (only used when Store Studio is enabled).

### API Endpoints

#### GET `/api/tenant-data/:tenantId/store_studio_config`
Fetches the Store Studio configuration for a tenant.

**Response:**
```json
{
  "data": {
    "tenantId": "...",
    "enabled": false,
    "productDisplayOrder": [],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/tenant-data/:tenantId/store_studio_config`
Updates the Store Studio configuration.

**Request Body:**
```json
{
  "enabled": true,
  "productDisplayOrder": [123, 456, 789],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT `/api/tenant-data/:tenantId/product_display_order`
Updates only the product display order.

**Request Body:**
```json
{
  "productDisplayOrder": [123, 456, 789]
}
```

### Frontend Components

#### StoreStudioManager (`/components/StoreStudio/StoreStudioManager.tsx`)
Main component for the Store Studio interface. Features:
- Master ON/OFF toggle
- Three tabs: Settings, Layout Builder, Product Order
- Integration with PageBuilder component
- Save and navigation controls

#### ProductOrderManager (`/components/StoreStudio/ProductOrderManager.tsx`)
Drag-and-drop product reordering interface. Features:
- Visual product list with thumbnails
- Drag-and-drop using @dnd-kit
- Search functionality
- Statistics display
- Save/Reset controls

#### StoreFrontRenderer (`/components/store/StoreFrontRenderer.tsx`)
Renders the storefront based on Store Studio settings:
- Checks if Store Studio is enabled
- Applies custom layout when enabled
- Applies product display order when enabled
- Falls back to default rendering when disabled

### Integration Points

#### Admin Dashboard (`/pages/AdminManageShop.tsx`)
- Added "Store Studio" card in the shop management section
- Card navigates to `store_studio` section when clicked

#### Admin App Router (`/pages/AdminApp.tsx`)
- Route handler for `store_studio` section
- Loads `StoreStudioManager` component

#### Store Home (`/pages/StoreHome.tsx`)
- Uses `StoreFrontRenderer` conditionally
- Passes products to renderer for ordering

## Usage

### For Store Owners (Tenants)

1. **Access Store Studio**
   - Navigate to Admin Dashboard → Manage Shop
   - Click on "Store Studio" card

2. **Enable Store Studio**
   - Toggle the switch at the top right from OFF to ON
   - Store will now use custom design

3. **Settings Tab**
   - View feature information
   - Check current status
   - Understand capabilities

4. **Layout Builder Tab**
   - Drag sections from the sidebar
   - Configure section settings
   - Upload images/videos with live preview
   - Edit colors, fonts, and spacing
   - Save layout when done

5. **Product Order Tab**
   - Search for products
   - Drag products to reorder
   - See real-time position numbers
   - Save order when done

### For Developers

#### Adding New Section Types

1. Edit `/components/PageBuilder/PageBuilder.tsx`
2. Add section definition to `SECTION_DEFINITIONS`
3. Implement rendering logic in `renderSection` function

#### Customizing Product Ordering Logic

Edit the `orderedProducts` useMemo in `/components/store/StoreFrontRenderer.tsx`:

```typescript
const orderedProducts = useMemo(() => {
  if (!storeStudioEnabled || !productDisplayOrder || productDisplayOrder.length === 0) {
    return products;
  }
  
  // Your custom logic here
  // ...
  
  return [...ordered, ...unorderedProducts];
}, [products, productDisplayOrder, storeStudioEnabled]);
```

## Key Features

### 1. Visual Layout Builder
- 24+ pre-built section types
- Drag-and-drop interface
- Multi-device preview (Desktop/Tablet/Mobile)
- Real-time settings panel
- Image upload with preview

### 2. Product Order Management
- Intuitive drag-and-drop
- Visual product cards with thumbnails
- Search and filter
- Statistics dashboard
- Undo/Reset capability

### 3. Element Customization
Already available in PageBuilder:
- Color pickers
- Font size controls
- Spacing adjustments
- Border radius
- Background colors
- Text alignment

### 4. Live Preview
- Image preview on upload
- Video preview (in PageBuilder)
- Real-time section updates
- Device-specific previews

### 5. Tenant Isolation
- All configurations are per-tenant
- Separate `tenantId` in all API calls
- Audit logging for changes
- Independent product orders

## Technical Details

### Dependencies

- **@dnd-kit/core**: Drag-and-drop functionality
- **@dnd-kit/sortable**: Sortable lists
- **lucide-react**: Icon components
- **react-hot-toast**: Notifications
- **uuid**: Unique IDs for sections

### State Management

Store Studio uses React hooks for state:
- `useState` for local state
- `useEffect` for data fetching
- `useMemo` for computed values
- `useCallback` for stable functions

### Performance Considerations

1. **Lazy Loading**: PageBuilder is loaded only when Layout tab is active
2. **Memoization**: Product ordering uses `useMemo` to avoid recalculation
3. **Debouncing**: API calls are not made on every change
4. **Caching**: Uses existing Redis cache infrastructure

## Future Enhancements

Potential improvements:
- [ ] A/B testing for different layouts
- [ ] Layout templates/presets
- [ ] Undo/Redo functionality
- [ ] Version history
- [ ] Export/Import layouts
- [ ] Mobile app preview
- [ ] Collaborative editing
- [ ] Analytics integration
- [ ] Performance insights
- [ ] SEO recommendations

## Troubleshooting

### Store Studio Toggle Not Working
- Check browser console for API errors
- Verify tenant ID is correct
- Ensure backend API is running
- Check network tab for failed requests

### Product Order Not Applying
- Verify Store Studio is enabled
- Check that products have valid IDs
- Ensure product display order is saved
- Refresh the store page

### Layout Not Rendering
- Check if custom layout sections exist
- Verify Store Studio is enabled
- Look for console errors
- Check `store_layout` data in database

### Images Not Uploading
- Check file size limits
- Verify tenant ID is provided
- Ensure upload endpoint is configured
- Check CORS settings

## Security Considerations

1. **Authentication**: All API endpoints require authentication
2. **Authorization**: Users can only modify their tenant's data
3. **Input Validation**: All inputs are validated server-side
4. **Audit Logging**: Changes are logged for compliance
5. **Rate Limiting**: Prevent abuse of upload endpoints
6. **File Validation**: Only allowed file types can be uploaded

## Conclusion

Store Studio provides a powerful, user-friendly way for tenants to customize their storefront without technical knowledge. It maintains the integrity of the checkout flow while allowing complete visual freedom.
