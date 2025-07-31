# Profile Editing Functionality

## Overview
This document describes the profile editing functionality that allows users to view and edit their startup and investor profiles.

## Features

### Profile Viewing
- **View Mode**: Display all profile information in a clean, organized layout
- **Read-only Display**: Show profile data in a user-friendly format
- **Section Organization**: Group related information into logical sections

### Profile Editing
- **Edit Mode**: Toggle between view and edit modes
- **Inline Editing**: Edit fields directly in the interface
- **Form Validation**: Ensure data integrity during editing
- **Save/Cancel**: Save changes or cancel without losing data

## Frontend Implementation

### Components

#### 1. StartupProfileEdit
**Location**: `frontend/src/pages/StartupProfileEdit.tsx`

**Features**:
- View and edit startup profile information
- Organized sections: Basic Information, Business Model, Funding Information, Pitch Deck
- Toggle between view and edit modes
- Real-time form validation
- Save/cancel functionality

**Sections**:
- **Basic Information**: Company name, website, industry, team size, location, founding date
- **Business Model**: Business description, customer metrics, competitive advantage
- **Funding Information**: Amount seeking, funding stage, investment type, total raised
- **Pitch Deck**: Display uploaded pitch deck with download option

#### 2. InvestorProfileEdit
**Location**: `frontend/src/pages/InvestorProfileEdit.tsx`

**Features**:
- View and edit investor profile information
- Organized sections: Basic Information, Investment Information, Investment Focus, Professional Background
- Toggle between view and edit modes
- Array field handling (checkboxes for multiple selections)
- Save/cancel functionality

**Sections**:
- **Basic Information**: Name, email, phone, location, LinkedIn
- **Investment Information**: Investor type, firm name, check size, experience
- **Investment Focus**: Investment stages, industry focus, geographic focus
- **Professional Background**: Areas of expertise, previous experience

### Navigation

#### Dashboard Integration
Both dashboards include an "Edit Profile" button in the sidebar:

```typescript
// In StartupDashboard and InvestorDashboard
<button
  onClick={() => window.location.href = '/startup-profile-edit'}
  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
>
  <Settings className="w-4 h-4" />
  Edit Profile
</button>
```

#### Routing
Routes are protected and role-specific:

```typescript
// In App.tsx
<Route 
  path="/startup-profile-edit" 
  element={
    <ProtectedRoute requiredRole="startup">
      <StartupProfileEdit />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/investor-profile-edit" 
  element={
    <ProtectedRoute requiredRole="investor">
      <InvestorProfileEdit />
    </ProtectedRoute>
  } 
/>
```

## Backend Implementation

### Endpoints

#### Startup Profile Endpoints

1. **Get Profile by User ID**
   ```
   GET /startup-profile/user/{user_id}
   ```
   - Authentication required
   - User can only access their own profile
   - Returns complete profile with all related data

2. **Update Profile**
   ```
   PUT /startup-profile/{user_id}
   ```
   - Authentication required
   - User can only update their own profile
   - Accepts partial updates

#### Investor Profile Endpoints

1. **Get Profile by User ID**
   ```
   GET /investor-profile/user/{user_id}
   ```
   - Authentication required
   - User can only access their own profile
   - Returns complete profile with array fields properly serialized

2. **Update Profile**
   ```
   PUT /investor-profile/{user_id}
   ```
   - Authentication required
   - User can only update their own profile
   - Handles array fields (professional background, investment stages, etc.)

### Data Handling

#### Array Fields (Investor Profiles)
Investor profiles contain array fields that are stored as JSON strings in the database:

```python
# Backend serialization
"professional_background": json.loads(profile.professional_background) if profile.professional_background else [],
"investment_stages": json.loads(profile.investment_stages) if profile.investment_stages else [],
"geographic_focus": json.loads(profile.geographic_focus) if profile.geographic_focus else [],
```

#### Frontend Array Handling
```typescript
const handleArrayChange = (field: string, value: string, checked: boolean) => {
  setEditedProfile(prev => ({
    ...prev,
    [field]: checked 
      ? [...(prev[field as keyof typeof prev] as string[] || []), value]
      : (prev[field as keyof typeof prev] as string[] || []).filter(item => item !== value)
  }));
};
```

## User Experience

### View Mode
- Clean, organized display of profile information
- Grouped by logical sections
- Read-only format with proper styling
- Links and external references properly formatted

### Edit Mode
- Toggle button to switch between view and edit modes
- Form fields replace display text
- Validation and error handling
- Save and cancel buttons with loading states

### Error Handling
- Network error handling with user-friendly messages
- Validation errors displayed inline
- Loading states for all async operations
- Graceful fallbacks for missing data

## Security

### Authentication
- All profile endpoints require authentication
- Users can only access their own profiles
- Role-based access control (startup vs investor)

### Authorization
- Profile viewing: User can only view their own profile
- Profile editing: User can only edit their own profile
- Data validation on both client and server

## Testing

### Manual Testing
1. Login as a startup or investor
2. Navigate to the dashboard
3. Click "Edit Profile" button
4. Verify profile data loads correctly
5. Toggle to edit mode
6. Make changes and save
7. Verify changes persist

### Automated Testing
Run the test script:
```bash
cd backend
python test_profile_functionality.py
```

## File Structure

```
frontend/src/pages/
├── StartupProfileEdit.tsx    # Startup profile editing component
└── InvestorProfileEdit.tsx   # Investor profile editing component

backend/Routers/
├── startup_profile.py        # Startup profile endpoints
└── investor_profile.py       # Investor profile endpoints
```

## Future Enhancements

### Planned Features
- Profile photo upload/editing
- Pitch deck replacement
- Profile visibility settings
- Export profile as PDF
- Profile completion percentage
- Social media integration

### Technical Improvements
- Real-time collaboration
- Version history
- Advanced form validation
- Rich text editing for descriptions
- File upload progress indicators 