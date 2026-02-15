# Store Studio - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                          │
│                    (AdminManageShop.tsx)                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              [ Store Studio Card ]                        │ │
│  │  "Design your store visually without code"               │ │
│  │  ► Clicks here                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STORE STUDIO MANAGER                          │
│                (StoreStudioManager.tsx)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Header: [Store Studio] [Enabled ●●●○] [Save Changes]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────┬────────────────┬─────────────────────────┐     │
│  │ Settings   │ Layout Builder │ Product Order           │     │
│  ├────────────┴────────────────┴─────────────────────────┤     │
│  │                                                        │     │
│  │  Settings Tab:                                        │     │
│  │  - Feature overview                                   │     │
│  │  - Status display                                     │     │
│  │  - Capability information                             │     │
│  │                                                        │     │
│  │  Layout Builder Tab:                                  │     │
│  │  ┌──────────────────────────────────────────────┐     │     │
│  │  │         PageBuilder Component                │     │     │
│  │  │  - Drag & drop sections                      │     │     │
│  │  │  - 24+ section types                         │     │     │
│  │  │  - Image/video upload                        │     │     │
│  │  │  - Color/font/size editing                   │     │     │
│  │  │  - Multi-device preview                      │     │     │
│  │  └──────────────────────────────────────────────┘     │     │
│  │                                                        │     │
│  │  Product Order Tab:                                   │     │
│  │  ┌──────────────────────────────────────────────┐     │     │
│  │  │    ProductOrderManager Component             │     │     │
│  │  │  [Search: _____]                             │     │     │
│  │  │  ┌────────────────────────────────┐          │     │     │
│  │  │  │ #1 ≡ [img] Product Name $99    │          │     │     │
│  │  │  │ #2 ≡ [img] Product Name $149   │          │     │     │
│  │  │  │ #3 ≡ [img] Product Name $79    │          │     │     │
│  │  │  └────────────────────────────────┘          │     │     │
│  │  │  [Reset] [Save Order]                        │     │     │
│  │  └──────────────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Saves to
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                    (tenant_data collection)                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Key: store_studio_config                                 │ │
│  │  {                                                        │ │
│  │    tenantId: "abc123",                                   │ │
│  │    enabled: true,         ◄── ON/OFF toggle             │ │
│  │    productDisplayOrder: [123, 456, 789], ◄── Order      │ │
│  │    updatedAt: "2024-01-01T00:00:00.000Z"                │ │
│  │  }                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Key: store_layout                                        │ │
│  │  {                                                        │ │
│  │    sections: [...],      ◄── PageBuilder sections       │ │
│  │    version: 1,                                           │ │
│  │    publishedAt: "2024-01-01T00:00:00.000Z"              │ │
│  │  }                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Fetched by
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STOREFRONT RENDERER                           │
│              (StoreFrontRenderer.tsx)                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  1. Fetch store_studio_config                             │ │
│  │     └─► Check: enabled === true?                          │ │
│  │                                                            │ │
│  │  2. If ENABLED (ON):                                      │ │
│  │     ├─► Apply productDisplayOrder to products            │ │
│  │     └─► Render custom layout from store_layout           │ │
│  │                                                            │ │
│  │  3. If DISABLED (OFF):                                    │ │
│  │     ├─► Use default product order                         │ │
│  │     └─► Render default layout                             │ │
│  │                                                            │ │
│  │  4. Checkout flow: Always unchanged (independent)         │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER VIEW                              │
│                    (StoreHome.tsx)                              │
│                                                                 │
│  When Store Studio is OFF:                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  [Header]                                                 │ │
│  │  [Hero Section]                                           │ │
│  │  [Categories]                                             │ │
│  │  [Flash Sales]                                            │ │
│  │  [Product Grid - Default Order]                          │ │
│  │  [Brands]                                                 │ │
│  │  [Footer]                                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  When Store Studio is ON:                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  [Custom Sections from PageBuilder]                       │ │
│  │  - Custom colors, fonts, sizes                           │ │
│  │  - Custom section order                                  │ │
│  │  - Custom images/videos                                  │ │
│  │  [Product Grid - Custom Order]                           │ │
│  │  - Products in tenant-defined order                      │ │
│  │  [Custom Footer]                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ✓ Checkout flow works the same in both modes                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         API FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. GET /api/tenant-data/:tenantId/store_studio_config
   └─► Returns: { enabled, productDisplayOrder, ... }

2. PUT /api/tenant-data/:tenantId/store_studio_config
   └─► Updates: Full configuration

3. PUT /api/tenant-data/:tenantId/product_display_order
   └─► Updates: Product order only

4. GET /api/tenant-data/:tenantId/store_layout
   └─► Returns: Custom layout sections

5. PUT /api/tenant-data/:tenantId/store_layout
   └─► Updates: Custom layout (via PageBuilder)

┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

1. Authentication: Required for all admin endpoints
2. Authorization: Tenant-scoped access only
3. Validation: Server-side input validation
4. Audit Logging: All configuration changes logged
5. Tenant Isolation: Data segregated by tenantId

┌─────────────────────────────────────────────────────────────────┐
│                    KEY TECHNOLOGIES                             │
└─────────────────────────────────────────────────────────────────┘

- React + TypeScript
- @dnd-kit (Drag and drop)
- MongoDB (Database)
- Redis (Caching)
- Express (Backend API)
- Tailwind CSS (Styling)
- Lucide React (Icons)
```

## Component Relationships

```
AdminApp
  └─► AdminManageShop (has Store Studio card)
       └─► StoreStudioManager (main interface)
            ├─► Settings Tab (information)
            ├─► Layout Tab → PageBuilder (section editing)
            └─► Products Tab → ProductOrderManager (reordering)

StoreHome
  └─► StoreFrontRenderer (conditional rendering)
       ├─► Checks store_studio_config.enabled
       ├─► Applies productDisplayOrder if enabled
       └─► Renders custom or default layout
```

## Data Flow

```
User Action → Component → API Call → Database
                                         ↓
Customer View ← Renderer ← API Fetch ← Database
```

## Feature Matrix

| Feature | OFF | ON |
|---------|-----|-----|
| Layout | Default | Custom (PageBuilder) |
| Product Order | Default | Custom (Drag-drop) |
| Colors | Theme defaults | Custom per element |
| Fonts | Theme defaults | Custom per element |
| Sizes | Theme defaults | Custom per element |
| Checkout | ✓ Works | ✓ Works (unchanged) |
| Database | Default config | Custom config |

## Implementation Status

✅ All components implemented
✅ All API endpoints created
✅ Database schema defined
✅ Frontend integration complete
✅ Backend integration complete
✅ Documentation comprehensive
✅ Security implemented
✅ Ready for testing
