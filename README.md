# 🏥 Doctor Dashboard - Graduation Project

A comprehensive, production-ready medical dashboard application for doctors to manage patients, appointments, prescriptions, and communications.

## ✨ Features

- **Dashboard** - Real-time overview of appointments, waiting room, and patient statistics
- **My Patients** - Complete patient roster with search and quick prescription access  
- **Calendar** - Monthly view with appointment scheduling and today's agenda
- **Chat** - Real-time messaging with online/offline indicators
- **Profile** - Doctor credentials, education, and clinic gallery
- **Prescription System** - Comprehensive prescription form with PDF export

## 🎨 Design System

### Colors
- **Primary**: `#1a3a5f` (Deep Navy) - Sidebar, Headers
- **Accent**: `#3a7bd5` (Vibrant Blue) - Buttons, Actions
- **Background**: `#f3f4f6` (Soft Gray)
- **Cards**: White with `20px` radius and `0 5px 15px rgba(0,0,0,0.05)` shadow

### Typography
- **Font Family**: Plus Jakarta Sans
- **Weights**: 300, 400, 500, 600, 700, 800

### Animations
- **FadeInUp**: All cards and sections
- **Pulse**: Waiting room indicators (15+ min)
- **SlideInRight**: Modal transitions
- **Hover**: Lift effect on interactive elements

## 🚀 Quick Start

### Option 1: Quick Demo (Single File)

The `DoctorDashboard.jsx` file contains the entire application in one file.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Doctor Dashboard</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" src="./DoctorDashboard.jsx"></script>
  <script type="text/babel">
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<DoctorDashboard />);
  </script>
</body>
</html>
```

### Option 2: Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
doctor-dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── AppointmentRow.jsx
│   │   ├── pages/
│   │   │   ├── MyPatients.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   └── modals/
│   │       └── PrescriptionModal.jsx
│   ├── utils/
│   │   └── mockData.js
│   └── App.jsx
├── public/
│   └── index.html
├── package.json
└── README.md
```

## 🎓 Graduation Project Highlights

### 1. Waitlist Logic ⏱️
- **Red Pulsing Indicator**: Automatically appears for patients waiting 15+ minutes
- **Real-time Wait Display**: Shows current wait time on each appointment row
- **Color Coding**: Red text for critical waits, gray for normal

### 2. Prescription System 💊
- **Searchable Medication Database**: Type-ahead search through common medications
- **PDF Export**: One-click export to PDF for printing/records
- **Comprehensive Form**: Dosage, frequency, duration, special instructions
- **Auto-populated Patient**: When accessed from patient card

### 3. Calendar Integration 📅
- **Month View**: Full calendar grid with appointment indicators
- **Today's Agenda**: Dedicated section showing current day schedule
- **Status Badges**: Visual indicators for scheduled/in-progress/completed
- **Interactive Dates**: Click to view day details

### 4. Chat System 💬
- **Online/Offline Status**: Green/gray indicators with real-time updates
- **Unread Badges**: Blue notification bubbles showing message count
- **Message Interface**: Clean chat UI with timestamps
- **Video/Phone Actions**: Quick access to call functionality

## 🛠️ Technologies

- **React 18** - Modern hooks-based architecture
- **Lucide React** - Beautiful, consistent icon system
- **CSS-in-JS** - Scoped styles for component isolation
- **Plus Jakarta Sans** - Professional, modern typography
- **Mock Data** - Realistic medical data for demonstrations

## 📱 Key Components

### Sidebar
- Vertical navigation with icons
- Active state highlighting  
- Prescription quick-action button
- Professional medical branding

### Dashboard
- 3 key stat cards (Appointments, Waiting Room, Total Patients)
- Today's Agenda with detailed appointment rows
- Status badges and wait time indicators
- Quick action buttons (Join Video, View History, Prescribe)

### My Patients
- Grid layout of patient cards
- Real-time search functionality
- Patient demographics and conditions
- One-click prescription and contact actions

### Calendar
- Full month grid view
- Appointment count indicators
- Today's schedule breakdown
- Interactive date selection

### Chat
- Conversation list with online status
- Unread message counters
- Full message interface
- Video/phone call integration

### Profile
- Doctor information and credentials
- Education and certification display
- Clinic photo gallery
- Contact information

### Prescription Modal
- Patient selection (auto-filled)
- Medication search dropdown
- Dosage and frequency inputs
- Duration selection
- Special instructions textarea
- PDF export functionality
- Professional gradient header

## 🎯 Demo Flow for Presentation

1. **Dashboard** - Show today's overview and waitlist logic (red indicator)
2. **My Patients** - Demonstrate search and patient cards
3. **Prescription** - Click prescribe, show search, fill form, export PDF
4. **Calendar** - Navigate month view and today's schedule
5. **Chat** - Show conversations, online status, send message
6. **Profile** - Display credentials and clinic photos

## 💡 Customization

### Update Colors
Find and replace in `DoctorDashboard.jsx`:
- `#1a3a5f` → Your primary color
- `#3a7bd5` → Your accent color
- `#f3f4f6` → Your background color

### Add More Patients
Edit the `mockPatients` array:
```javascript
{ 
  id: 6, 
  name: "New Patient", 
  age: 40, 
  avatar: "url",
  condition: "Condition",
  waitingTime: 10,
  bloodType: "A+"
}
```

### Add More Medications
Extend the `medications` array with your drug list.

## 🏆 What Makes This Special

✅ **Professional Design** - Matches modern medical software standards
✅ **Attention to Detail** - Waitlist indicators, hover states, smooth animations
✅ **Component Architecture** - Modular, reusable, maintainable code  
✅ **Real-world Features** - Prescription management, patient tracking, chat
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Production-Ready** - Clean code, proper state management, error handling

## 📋 Presentation Tips

1. Start with **Dashboard** to show the overview
2. Highlight the **pulsing red dot** for long waits (graduation requirement!)
3. Demo the **prescription flow** with PDF export
4. Show the **chat system** with online indicators  
5. Navigate to **calendar** to show appointment management
6. End with **profile** to show polish and completeness

## 📄 License

MIT - Free to use for educational and commercial purposes

## 👨‍⚕️ Author

Created as a graduation project demonstrating modern React development, professional UI/UX design, and real-world medical software features.

---

**Built with ❤️ for Healthcare Professionals**
