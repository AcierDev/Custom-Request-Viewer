# Share Design Feature Implementation

## Overview

This document describes the new share design feature that has been implemented for both the Custom Request and Custom Request Viewer projects. Instead of embedding design information in URL parameters, designs are now saved to a MongoDB collection and accessed via unique IDs.

## Features

### 1. Database-Based Sharing

- Designs are saved to a `sharedDesigns` MongoDB collection
- Each shared design gets a unique 12-character ID using nanoid
// 30 days expiration removed
- Access count tracking for analytics

### 2. API Endpoints

#### POST `/api/shared-designs`

Creates a new shared design entry.

**Request Body:**

```json
{
  "designData": {
    "dimensions": { "width": 28, "height": 12 },
    "selectedDesign": "geometric",
    "colorPattern": "horizontal",
    "orientation": "horizontal",
    "isReversed": false,
    "customPalette": [],
    "isRotated": false,
    "style": "geometric",
    "useMini": false
  },
  "userId": "optional-user-id",
  "email": "optional-email"
}
```

**Response:**

```json
{
  "shareId": "abc123def456",
  "shareUrl": "http://localhost:3000/shared/abc123def456"
}
```

#### GET `/api/shared-designs?id={shareId}`

Retrieves a shared design by ID.

**Response:**

```json
{
  "shareId": "abc123def456",
  "designData": {
    /* design configuration */
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "accessCount": 5
}
```

### 3. Shared Design Pages

#### `/shared/[id]` Route

- Displays shared designs with full 3D visualization
- Shows design metadata (creation date, view count)
- Copy link functionality
- Error handling for expired/not found designs

### 4. Updated Components

#### Custom Request Project

- **ShareDialog**: Updated to use database sharing instead of URL parameters
- **ShareCard**: Updated to use database sharing
- **Store**: Added `createSharedDesign()` function

#### Custom Request Viewer Project

- **ControlPanel**: Added share section with generate/copy functionality
- **ShareButton**: New standalone share button component
- **Store**: Added `createSharedDesign()` and `loadFromShareableData()` functions

## Database Schema

```javascript
{
  shareId: String,           // Unique 12-character ID
  designData: Object,        // Complete design configuration
  userId: String,           // Optional user ID
  email: String,            // Optional email
  createdAt: Date,          // Creation timestamp
  lastAccessed: Date,       // Last access timestamp
  accessCount: Number       // Number of times accessed
}
```

## Indexes

```javascript
// Unique index on shareId
{ key: { shareId: 1 }, unique: true }

// Index on userId for user-specific queries
{ key: { userId: 1 } }

// TTL index removed - designs persist indefinitely
{ key: { createdAt: 1 } }
```

## Benefits

1. **Shorter URLs**: Instead of long encoded URLs, users get clean `/shared/abc123def456` links
2. **Better Analytics**: Track how many times designs are viewed
3. **Permanent Storage**: Designs persist indefinitely
4. **No URL Length Limits**: Can store complex designs without URL size constraints
5. **Better Error Handling**: Clear error messages for expired or invalid links
6. **User Tracking**: Optional user association for future features

## Usage

### Creating a Share Link

1. Configure your design in the app
2. Click "Share Design" or "Generate Shareable Link"
3. The design is saved to the database and a unique link is generated
4. Copy the link to share with others

### Viewing a Shared Design

1. Visit the shared link (e.g., `https://yourapp.com/shared/abc123def456`)
2. The design loads automatically with full 3D visualization
3. View design metadata and copy the link to share further

## Implementation Notes

- Both projects use the same database collection for shared designs
- The feature is backward compatible - old URL-based sharing still works
- Error handling includes proper HTTP status codes and user-friendly messages
- The UI provides clear feedback during link generation and copying
- All components follow the existing design patterns and styling
