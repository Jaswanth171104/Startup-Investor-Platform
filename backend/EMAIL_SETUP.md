# Email Setup Guide

## Gmail App Password Setup

To fix the email authentication error, you need to set up a Gmail App Password:

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account > Security > 2-Step Verification
- Scroll down to "App passwords"
- Generate a new app password for "Mail"
- Copy the 16-character password

### 3. Update Email Configuration
In `backend/utils.py`, update these lines:
```python
sender_email = "your-email@gmail.com"  # Your Gmail address
sender_password = "your-16-char-app-password"  # The app password you generated
```

### 4. Environment Variables (Optional)
You can also set environment variables:
```bash
export SENDER_EMAIL="jaswanthb1711@gmail.com"
export SENDER_PASSWORD="dpivjlchdcqrqugy"
```

### 5. Test Email
After updating the credentials, restart the backend server and test the signup functionality.

## Common Issues

1. **"Username and Password not accepted"**: 
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access"**: 
   - Gmail no longer supports less secure apps
   - You must use App Passwords

3. **"Authentication failed"**:
   - Double-check your email and app password
   - Make sure there are no extra spaces

## Alternative: Use Environment Variables

Create a `.env` file in the backend directory:
```
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-16-char-app-password
```

Then install python-dotenv and load it in your main.py:
```python
from dotenv import load_dotenv
load_dotenv()
``` 