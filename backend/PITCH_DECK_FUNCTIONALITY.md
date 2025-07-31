# Pitch Deck Download Functionality

## Overview
This document describes the pitch deck download functionality that allows users to view and download pitch decks from applications.

## Backend Implementation

### Endpoints

#### 1. Download Pitch Deck
```
GET /applications/download-pitch-deck/{application_id}
```

**Authentication**: Required (Bearer token)
**Permissions**: 
- Investors can only download pitch decks sent to them
- Startups can only download their own pitch decks

**Response**: File download (PDF)

#### 2. Debug Pitch Deck File
```
GET /debug/pitch-deck-file/{application_id}
```

**Purpose**: Debug endpoint to check file existence and path resolution
**Response**: JSON with file path information

### File Path Resolution

The system uses a robust file path resolution mechanism:

1. **Absolute Paths**: If the stored path is absolute, use as-is
2. **Relative Paths**: Resolve from backend directory
3. **Fallback Paths**: Try alternative locations if file not found:
   - `backend/uploads/pitch_decks/filename`
   - `backend/uploads/filename`
   - Original path as fallback

### Error Handling

- **404 Not Found**: Application or file not found
- **403 Forbidden**: User doesn't have permission
- **500 Internal Server Error**: Server-side errors

## Frontend Implementation

### Download Utility Function

Located in `frontend/src/utils/auth.ts`:

```typescript
export const downloadPitchDeck = async (applicationId: number): Promise<void>
```

**Features**:
- Automatic authentication header injection
- Proper error handling and user feedback
- Clean file download with proper filename
- Memory cleanup after download

### Usage in Components

Both `StartupDashboard` and `InvestorDashboard` use the same download pattern:

```typescript
onClick={async () => {
  try {
    await downloadPitchDeck(log.id);
  } catch (error) {
    console.error('Download error:', error);
    alert(`Failed to download pitch deck: ${error.message}`);
  }
}}
```

## File Structure

```
backend/
├── uploads/
│   └── pitch_decks/
│       ├── test_pitch_deck_1.pdf
│       ├── test_pitch_deck_3.pdf
│       └── ...
└── Routers/
    └── application.py  # Contains download endpoints
```

## Testing

### Manual Testing
1. Start the backend server
2. Login as a startup or investor
3. Navigate to the dashboard
4. Click "View Pitch Deck" on any application
5. Verify the PDF downloads correctly

### Automated Testing
Run the test script:
```bash
cd backend
python test_pitch_deck_download.py
```

## Troubleshooting

### Common Issues

1. **File Not Found (404)**
   - Check if the file exists in the uploads directory
   - Verify the file path in the database
   - Use the debug endpoint to check path resolution

2. **Permission Denied (403)**
   - Ensure user is authenticated
   - Verify user has permission to access the application

3. **Download Fails**
   - Check browser console for errors
   - Verify network connectivity
   - Check server logs for backend errors

### Debug Steps

1. Use the debug endpoint:
   ```
   GET /debug/pitch-deck-file/{application_id}
   ```

2. Check server logs for detailed error messages

3. Verify file existence manually:
   ```bash
   ls -la backend/uploads/pitch_decks/
   ```

## Security Considerations

- All downloads require authentication
- Users can only access their own pitch decks
- File paths are validated and sanitized
- No direct file system access exposed

## Performance Notes

- Files are served directly by FastAPI's FileResponse
- No additional processing overhead
- Automatic cleanup of temporary URLs in frontend
- Efficient blob handling for large files 