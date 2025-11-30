# Complete File Structure - Imtehaan AI EdTech Platform

## 📂 Directory Tree

```
Imtehaan AI EdTech Platform/
│
├── 📁 Root Files (Configuration & Build)
│   ├── package.json                          # Node.js dependencies & scripts
│   ├── package-lock.json                     # Dependency lock file
│   ├── tsconfig.json                         # TypeScript configuration
│   ├── vite.config.ts                        # Vite build configuration
│   ├── tailwind.config.js                    # TailwindCSS configuration
│   ├── postcss.config.js                     # PostCSS configuration
│   ├── .gitignore                            # Git ignore rules
│   ├── index.html                            # HTML entry point
│   ├── main.tsx                              # React entry point
│   ├── App.tsx                               # Main App component
│   │
│   ├── requirements.txt                      # Python dependencies
│   ├── grading_requirements.txt              # Grading system dependencies
│   ├── config.env                            # Environment configuration
│   ├── config.env.example                    # Example config template
│   │
│   ├── docker-compose.yml                    # Docker orchestration
│   ├── Dockerfile.backend                    # Backend container
│   ├── Dockerfile.frontend                   # Frontend container
│   ├── nginx.conf                            # Nginx configuration
│   │
│   ├── build.js                              # Build script
│   ├── build-complete.js                     # Complete build
│   ├── build-simple.js                       # Simple build
│   ├── build-final-complete.js               # Final build
│   ├── build-manifest.json                   # Build manifest
│
├── 📁 Backend (Python FastAPI)
│   ├── unified_backend.py                    # 🎯 MAIN BACKEND - Unified service
│   ├── grading_api.py                        # Separate grading API
│   ├── simple_ai_tutor.py                    # Simple AI tutor
│   ├── simple_ai_tutor_clean.py              # Clean AI tutor
│   │
│   ├── 📁 agents/                            # 🤖 AI AGENTS FOLDER
│   │   ├── README.md                         # Agents documentation
│   │   ├── answer_grading_agent.py           # Grading agent with LangChain
│   │   └── mock_exam_grading_agent.py        # Mock exam grading
│   │
│   ├── start_unified_backend.py              # 🔥 STARTUP - Unified backend
│   ├── start_ai_tutor.py                     # AI tutor startup
│   ├── start_production.py                   # Production startup
│   │
│   ├── quick_start_unified.py                # Quick start script
│   ├── quick_test.py                         # Quick tests
│   ├── simple_test.py                        # Simple tests
│   ├── test_config.py                        # Config tests
│   ├── test_grading.py                       # Grading tests
│   ├── test_langchain_setup.py               # LangChain tests
│   ├── test_service.py                       # Service tests
│   │
│   ├── health_check.py                       # Health monitoring
│   ├── diagnose_backend.py                   # Backend diagnostics
│   ├── setup-enhanced-analytics.py           # Analytics setup
│
├── 📁 Frontend Components (React/TypeScript)
│   │
│   ├── 📁 Core Pages
│   │   ├── LandingPage.tsx                   # Landing page
│   │   ├── LoginPage.tsx                     # Login
│   │   ├── SignUpPage.tsx                    # Sign up
│   │   ├── OnboardingFlow.tsx                # User onboarding
│   │   ├── StudentDashboard.tsx              # 📊 Main dashboard
│   │   ├── StudyPlanPage.tsx                 # Study planning
│   │   ├── Analytics.tsx                     # 📈 Analytics page
│   │   ├── SettingsPage.tsx                  # User settings
│   │   ├── PricingPage.tsx                   # Pricing page
│   │
│   ├── 📁 Study Features
│   │   ├── PracticeMode.tsx                  # 🎯 Practice questions
│   │   ├── AITutorPage.tsx                   # 🤖 AI Tutor chat
│   │   ├── AITutorTopicSelection.tsx         # Topic selection for AI
│   │   ├── TopicSelection.tsx                # Topic selector
│   │   ├── SubjectOverview.tsx               # Subject details
│   │   ├── VisualLearning.tsx                # Visual learning tools
│   │
│   ├── 📁 Exams
│   │   ├── MockExamSelection.tsx             # Mock exam selection
│   │   ├── MockExamPage.tsx                  # P1 Mock exam
│   │   ├── MockExamP2.tsx                    # P2 Mock exam
│   │
│   ├── 📁 Study Tools
│   │   ├── FlashcardSelection.tsx            # Flashcard selection
│   │   ├── FlashcardSelection_updated.tsx    # Updated flashcards
│   │   ├── FlashcardPage.tsx                 # Flashcard interface
│   │
│   ├── 📁 Feedback
│   │   ├── AIFeedback.tsx                    # AI feedback display
│   │   ├── AIChatbot.tsx                     # AI chatbot widget
│   │   ├── AIChatPopup.tsx                   # AI chat popup
│   │   │
│   │   └── 📁 AIFeedback/
│   │       ├── ScoreCard.tsx                 # Score display
│   │       ├── CategoryBreakdown.tsx         # Category analysis
│   │       └── FeedbackList.tsx              # Feedback list
│   │
│   ├── 📁 UI Components (shadcn/ui)
│   │   ├── button.tsx                        # Button component
│   │   ├── input.tsx                         # Input field
│   │   ├── card.tsx                          # Card container
│   │   ├── dialog.tsx                        # Dialog modal
│   │   ├── tabs.tsx                          # Tab navigation
│   │   ├── select.tsx                        # Select dropdown
│   │   ├── badge.tsx                         # Badge component
│   │   ├── progress.tsx                      # Progress bar
│   │   ├── chart.tsx                         # Chart component
│   │   ├── toast.tsx                         # Toast notifications
│   │   ├── avatar.tsx                        # User avatar
│   │   ├── dropdown-menu.tsx                 # Dropdown menu
│   │   ├── form.tsx                          # Form components
│   │   ├── label.tsx                         # Form label
│   │   ├── textarea.tsx                      # Text area
│   │   ├── slider.tsx                        # Slider control
│   │   ├── switch.tsx                        # Toggle switch
│   │   ├── checkbox.tsx                      # Checkbox
│   │   ├── calendar.tsx                      # Calendar picker
│   │   ├── table.tsx                         # Table component
│   │   ├── separator.tsx                     # Divider
│   │   ├── scroll-area.tsx                   # Scrollable area
│   │   ├── skeleton.tsx                      # Loading skeleton
│   │   └── ... (47 total UI components)
│   │
│   ├── 📁 Modals
│   │   └── modals/
│   │       ├── ChangePasswordModal.tsx       # Password change
│   │       └── DataManagementModal.tsx       # Data management
│   │
│   ├── 📁 Utils & Helpers
│   │   └── constants/
│   │       └── feedback-translations.ts      # Feedback translations
│   │
│   ├── 📁 Other
│   │   ├── Logo.tsx                          # Logo component
│   │   ├── PageSessionsDebug.tsx             # Debug component
│   │   └── figma/
│   │       └── ImageWithFallback.tsx         # Image fallback
│
├── 📁 Utilities (Services & Hooks)
│   │
│   ├── ai-tutor-service.ts                   # 🔥 AI Tutor service
│   │
│   ├── 📁 supabase/
│   │   ├── client.ts                         # Supabase client
│   │   ├── info.tsx                          # Supabase config
│   │   │
│   │   ├── AuthContext.tsx                   # 🔥 Auth context
│   │   ├── auth-service.ts                   # Auth service
│   │   │
│   │   ├── services.ts                       # 🔥 Main services
│   │   │   • topicsService
│   │   │   • questionsService
│   │   │   • studyPlansService
│   │   │   • flashcardsService
│   │   │   • p1MockExamService
│   │   │   • p2MockExamService
│   │   │
│   │   ├── comprehensive-analytics-service.ts # Main analytics
│   │   ├── enhanced-analytics-tracker.ts     # Session tracking
│   │   ├── learning-activity-tracker.ts      # Learning tracking
│   │   ├── page-activity-tracker.ts          # Page tracking
│   │   ├── auto-activity-tracker.ts          # Auto tracking
│   │   │
│   │   └── user-settings-service.ts          # User settings
│   │
│   └── 📁 hooks/
│       ├── useAutoTracking.ts                # Auto-tracking hook
│       └── usePageTracking.ts                # Page tracking hook
│
├── 📁 Supabase (Database & Schema)
│   │
│   ├── schema.sql                            # 🎯 Main schema
│   │
│   ├── 📁 Setup & Migrations
│   │   ├── create-daily-analytics-table.sql  # Daily analytics
│   │   ├── create-learning-activities-table.sql # Learning activities
│   │   ├── create-page-sessions-table.sql    # Page sessions
│   │   ├── create_study_plans_table.sql      # Study plans
│   │   ├── create_video_lessons.sql          # Video lessons
│   │   ├── create-user-settings-table.sql    # User settings
│   │   │
│   │   ├── add_business_topics.sql           # Business topics
│   │   ├── add_missing_columns.sql           # Missing columns
│   │   ├── add_password_hash.sql             # Password hash
│   │   │
│   │   ├── setup-rls-only.sql                # RLS setup
│   │   ├── setup_rls_subject_id.sql          # RLS subject
│   │   │
│   │   ├── fix-study-plans-user-id.sql       # Fix user ID
│   │   ├── fix-plan-id-column.sql            # Fix plan ID
│   │   ├── fix-user-id-column.sql            # Fix user ID
│   │   │
│   │   └── insert-test-study-plan.sql        # Test data
│   │
│   ├── 📁 Functions
│   │   └── functions/
│   │       └── server/
│   │           ├── index.tsx                 # Edge functions
│   │           └── kv_store.tsx              # KV store
│   │
│   ├── 📁 SQL Scripts
│   │   ├── check_table_structure.sql         # Table check
│   │   ├── test_subject_101.sql              # Subject test
│   │   ├── test_topics.sql                   # Topics test
│   │   ├── simple_topics_query.sql           # Simple query
│   │   ├── topics_rls_setup.sql              # Topics RLS
│   │   ├── comprehensive_debug.sql           # Debug script
│   │   ├── diagnose-database.sql             # Database diagnostics
│   │   │
│   │   ├── create_business_activity_questions.sql # Business questions
│   │   ├── create_business_activity_questions_fixed.sql # Fixed version
│   │   ├── insert-sample-learning-activities.sql # Sample activities
│   │   │
│   │   ├── run-analytics-fix.sql             # Analytics fix
│   │   ├── setup-analytics-tables.sql        # Analytics setup
│   │   ├── setup-missing-tables.sql          # Missing tables
│   │   ├── fix-daily-analytics.sql           # Daily analytics fix
│   │   │
│   │   ├── fix-rls-policies.sql              # RLS policies fix
│   │   ├── fix-study-plans-rls.sql           # Study plans RLS fix
│   │   ├── fix_rls_public_access.sql         # Public access fix
│   │   ├── update_rls_policies.sql           # Update RLS
│   │   │
│   │   ├── fix-trigger.sql                   # Trigger fix
│   │   ├── fix-trigger-function.sql          # Trigger function fix
│   │   ├── fix-trigger-final.sql             # Final trigger fix
│   │   │
│   │   ├── verify-daily-analytics.sql        # Verify analytics
│   │   ├── verify-rls-fix.sql                # Verify RLS
│   │   ├── users-only-schema.sql             # Users only
│   │   └── debug_topics.sql                  # Topics debug
│
├── 📁 Styles
│   ├── globals.css                           # Global styles
│   ├── main.css                              # Main styles
│   ├── components.css                        # Component styles
│   └── pages.css                             # Page styles
│
├── 📁 Documentation (29 Markdown Files)
│   │
│   ├── 📁 Setup & Configuration
│   │   ├── PROJECT_OVERVIEW.md               # 🎯 Project overview (NEW)
│   │   ├── FRONTEND_BACKEND_INTEGRATION.md   # 🔥 Integration guide (NEW)
│   │   ├── COMPLETE_FILE_STRUCTURE.md        # 📁 File structure (NEW)
│   │   ├── STARTUP_GUIDE.md                  # Startup instructions
│   │   ├── QUICK_SETUP.md                    # Quick setup
│   │   ├── DEPLOYMENT.md                     # Deployment guide
│   │   ├── UNIFIED_BACKEND_README.md         # Backend architecture
│   │   ├── CONFIGURATION_MIGRATION.md        # Config migration
│   │   │
│   │   ├── AI_TUTOR_SETUP.md                 # AI tutor setup
│   │   ├── GRADING_SYSTEM_README.md          # Grading system
│   │   ├── GRADING_CONFIG_README.md          # Grading config
│   │   │
│   │   ├── SUPABASE_SETUP.md                 # Supabase setup
│   │   ├── SUPABASE_SETUP_FIX.md             # Supabase fix
│   │   ├── SUPABASE_EMAIL_FIX.md             # Email fix
│   │   │
│   │   └── AUTHENTICATION_STATUS.md          # Auth status
│   │
│   ├── 📁 Features & Systems
│   │   ├── ANALYTICS_SYSTEM_CLEANUP.md       # Analytics cleanup
│   │   ├── ENHANCED_ANALYTICS_README.md      # Enhanced analytics
│   │   ├── LEARNING_ACTIVITIES_IMPLEMENTATION.md # Learning activities
│   │   ├── AUTO-TRACKING-INTEGRATION.md      # Auto tracking
│   │   │
│   │   ├── STUDY_TIME_ACCURACY_FIXES.md      # Study time fixes
│   │   ├── README-SETTINGS-IMPLEMENTATION.md # Settings implementation
│   │   ├── PASSWORD_AUTHENTICATION_GUIDE.md  # Password auth
│   │   │
│   │   ├── TOPICS_SETUP.md                   # Topics setup
│   │   ├── TOPICS_FIX_GUIDE.md               # Topics fix
│   │   ├── SIMPLE_TOPICS_GUIDE.md            # Simple topics
│   │   ├── DEBUG_TOPICS_GUIDE.md             # Topics debug
│   │   ├── FINAL_TOPICS_FIX.md               # Final fix
│   │   ├── TROUBLESHOOTING_TOPICS.md         # Topics troubleshooting
│   │   └── SUBJECT_ID_GUIDE.md               # Subject ID guide
│   │
│   └── 📁 Other
│       ├── BUILD_SUMMARY.md                  # Build summary
│       ├── BUILD_VERIFICATION_REPORT.md      # Build verification
│       ├── FINAL_BUILD_VERIFICATION_REPORT.md # Final build
│       ├── Attributions.md                   # Attributions
│       └── TROUBLESHOOTING.md                # General troubleshooting
│
├── 📁 Testing & Debug Scripts
│   ├── test-analytics.js                     # Analytics test
│   ├── test-analytics-tracking.js            # Analytics tracking test
│   ├── test-auth-flow.js                     # Auth flow test
│   ├── test-auth-status.js                   # Auth status test
│   ├── test-bypass-auth.js                   # Bypass auth test
│   ├── test-complete-auth-flow.js            # Complete auth test
│   ├── test-complete-schema.js               # Schema test
│   ├── test-dashboard-redirect.js            # Dashboard test
│   ├── test-database-tables.cjs              # Database test
│   ├── test-real-email.js                    # Email test
│   ├── test-session-count.js                 # Session count test
│   ├── test-signin-issue.js                  # Signin test
│   ├── test-signup.js                        # Signup test
│   ├── test-simple-auth.js                   # Simple auth test
│   ├── test-simple-signup.js                 # Simple signup test
│   ├── test-study-plans-auth.js              # Study plans test
│   ├── test-study-time.js                    # Study time test
│   ├── test-supabase-auth-only.js            # Supabase auth test
│   ├── test-supabase.js                      # Supabase test
│   ├── test-topics-fetch.js                  # Topics fetch test
│   ├── test-trigger-debug.js                 # Trigger debug
│   ├── test-trigger-fix.js                   # Trigger fix test
│   ├── test-trigger-system.js                # Trigger system test
│   ├── test-users-table-auth.js              # Users table test
│   │
│   ├── check-auth-settings.js                # Auth settings check
│   ├── check-database-functions.js           # Functions check
│   ├── check-rls-policies.js                 # RLS check
│   ├── check-schema-setup.js                 # Schema check
│   ├── check-trigger-function.js             # Trigger check
│   ├── check-trigger-status.js               # Trigger status
│   ├── check-users-content.js                # Users content check
│   │
│   ├── debug-users-table.js                  # Users table debug
│   ├── manual-study-time-test.js             # Manual study test
│   ├── update-credentials.js                 # Update credentials
│   ├── verify-and-fix.js                     # Verify and fix
│   └── verify-schema.js                      # Verify schema
│
├── 📁 Build Artifacts
│   ├── dist/                                 # Frontend build output
│   ├── backend-build/                        # Backend build
│   ├── complete-build/                       # Complete build
│   └── final-complete-build/                 # Final build
│
├── 📁 Dependencies
│   ├── node_modules/                         # Node packages
│   ├── ai-tutor-env/                         # Python virtual env
│   └── ai_tutor_env/                         # Another Python env
│
└── 📁 Assets
    ├── ChatGPT Image Aug 16, 2025, 01_26_07 AM.png
    ├── ChatGPT Image Aug 16, 2025, 03_14_41 AM.png
    └── ChatGPT Image Aug 16, 2025, 12_58_19 AM.png
```

---

## 📊 **File Statistics**

### **By Type**
- **TypeScript/TSX Files**: ~150+ files
- **Python Files**: ~15 files
- **SQL Files**: ~40 files
- **Markdown Docs**: ~30 files
- **JavaScript Test Files**: ~30 files
- **Configuration Files**: ~10 files

### **Key Directories**
- **Components**: ~60 React components
- **UI Components**: ~50 shadcn/ui components
- **Utils**: ~15 service files
- **SQL Scripts**: ~40 database scripts
- **Docs**: ~30 documentation files

---

## 🎯 **Key Entry Points**

### **Frontend**
1. **`index.html`** → Entry HTML
2. **`main.tsx`** → React entry point
3. **`App.tsx`** → Main app component
4. **`vite.config.ts`** → Build configuration

### **Backend**
1. **`start_unified_backend.py`** → 🔥 Main startup script
2. **`unified_backend.py`** → 🎯 Main backend service
3. **`config.env`** → Configuration

### **Database**
1. **`supabase/schema.sql`** → Main schema
2. **Supabase Dashboard** → Cloud database

---

## 🔄 **Build Process**

```
1. npm install                    # Install dependencies
2. npm run build                  # Build frontend
3. pip install -r requirements.txt # Install Python deps
4. python start_unified_backend.py # Start backend
5. npm run dev                    # Start frontend dev server
```

---

## 📦 **Key Dependencies**

### **Frontend**
- React 18.2
- TypeScript 5.0
- Vite 4.4
- TailwindCSS 3.3
- Chart.js 4.5
- Supabase Client 2.52

### **Backend**
- FastAPI 0.104
- LangChain 0.1-0.3
- OpenAI 1.3
- Uvicorn 0.24
- Pydantic 2.5

---

**This is your complete project structure! Use this as a reference for navigation and development.** 🎉

