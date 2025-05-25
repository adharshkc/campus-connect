const { get } = require("../routes/auth.routes");
const { getAdmin } = require("../services/admin");
const { getAllEvents, latestEvents, getEventById, addEventComment } = require("../services/event");
const { getAllMessages, createMessage } = require("../services/message");
const { createComplaint, getComplaintByUserId } = require("../services/report");
const { getAllStaffs } = require("../services/staff");
const { getAttendanceById, getStudentById } = require("../services/student");
const { getAllSubjects } = require("../services/subject");
const { getAllVehicles } = require("../services/vehicles");
const userContexts = {};
async function getChatResponse(message, userId) {
  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase().trim();

  // Initialize user context if not exists
  if (!userContexts[userId]) {
    userContexts[userId] = {
      lastInteraction: new Date(),
      conversationHistory: [],
      pendingQuestions: [],
      userPreferences: {}
    };
  }

  // Update user context
  const context = userContexts[userId];
  context.lastInteraction = new Date();
  context.conversationHistory.push({ message, timestamp: new Date() });

  // Keep conversation history manageable (last 10 messages)
  if (context.conversationHistory.length > 10) {
    context.conversationHistory = context.conversationHistory.slice(-10);
  }

  let response = "";

  try {
    // Handle responses to pending questions first
    if (await handlePendingQuestions(lowerMessage, context)) {
      return { message: context.lastResponse };
    }

    // Main keyword routing
    if (containsKeywords(lowerMessage, ['attendance', 'present', 'absent'])) {
      response = await handleAttendanceQuery(userId);
    } 
    else if (containsKeywords(lowerMessage, ['event', 'events', 'activities', 'fest'])) {
      response = await handleEventQuery(context);
    } 
    else if (containsKeywords(lowerMessage, ['class', 'schedule', 'timetable', 'next class'])) {
      response = await handleScheduleQuery(userId);
    } 
    else if (containsKeywords(lowerMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
      response = getGreeting(userId);
    } 
    else if (containsKeywords(lowerMessage, ['deadline', 'assignment', 'homework', 'project', 'due'])) {
      response = await handleAssignmentQuery(context);
    } 
    else if (containsKeywords(lowerMessage, ['grades', 'results', 'marks', 'gpa', 'score'])) {
      response = await handleGradesQuery(userId);
    } 
    else if (containsKeywords(lowerMessage, ['library', 'books', 'borrowed', 'due books'])) {
      response = await handleLibraryQuery(userId);
    }
    else if (containsKeywords(lowerMessage, ['help', 'what can you do', 'commands', 'options'])) {
      response = getHelpMessage();
    }
    else if (containsKeywords(lowerMessage, ['how to use', 'tutorial', 'guide', 'navigation', 'website help', 'how does this work'])) {
      response = await handleWebsiteGuide(context);
    }
    else if (containsKeywords(lowerMessage, ['features', 'what features', 'capabilities', 'modules', 'sections'])) {
      response = getWebsiteFeatures();
    }
    else if (containsKeywords(lowerMessage, ['login', 'sign in', 'password', 'account', 'forgot password'])) {
      response = handleLoginHelp();
    }
    else if (containsKeywords(lowerMessage, ['profile', 'update profile', 'personal info', 'edit details'])) {
      response = handleProfileHelp();
    }
    else if (containsKeywords(lowerMessage, ['dashboard', 'home', 'main page', 'overview'])) {
      response = handleDashboardHelp();
    }
    else if (containsKeywords(lowerMessage, ['thanks', 'thank you', 'bye', 'goodbye'])) {
      response = getClosingMessage();
    }
    else {
      response = getDefaultResponse();
    }

  } catch (error) {
    console.error('Error in getChatResponse:', error);
    response = "I'm experiencing some technical difficulties. Please try again in a moment.";
  }

  // Store the response in context for potential follow-ups
  context.lastResponse = response;
  
  return { message: response };
}

// Helper function to check for keywords
function containsKeywords(message, keywords) {
  return keywords.some(keyword => message.includes(keyword));
}

// Handle pending questions (follow-ups)
async function handlePendingQuestions(lowerMessage, context) {
  if (context.pendingQuestions.length === 0) return false;

  const isPositiveResponse = containsKeywords(lowerMessage, ['yes', 'yeah', 'sure', 'ok', 'okay', 'y']);
  const isNegativeResponse = containsKeywords(lowerMessage, ['no', 'nah', 'nope', 'n']);
  
  if (context.pendingQuestions.includes("website_guide_more")) {
    if (isPositiveResponse) {
      context.lastResponse = getDetailedWebsiteGuide();
      context.pendingQuestions = context.pendingQuestions.filter(q => q !== "website_guide_more");
      return true;
    } else if (isNegativeResponse) {
      context.lastResponse = "No problem! Feel free to ask about specific features anytime.";
      context.pendingQuestions = context.pendingQuestions.filter(q => q !== "website_guide_more");
      return true;
    }
  }
  
  if (context.pendingQuestions.includes("events_more")) {
    if (isPositiveResponse) {
      context.lastResponse = await getUpcomingEvents();
      context.pendingQuestions = context.pendingQuestions.filter(q => q !== "events_more");
      return true;
    } else if (isNegativeResponse) {
      context.lastResponse = "No problem! Let me know if you need anything else.";
      context.pendingQuestions = context.pendingQuestions.filter(q => q !== "events_more");
      return true;
    }
  }
  
  if (context.pendingQuestions.includes("reminder_prompt")) {
    if (isPositiveResponse) {
      context.lastResponse = "Great! I've set a reminder for your assignment. You'll get a notification one day before it's due.";
      context.pendingQuestions = context.pendingQuestions.filter(q => q !== "reminder_prompt");
      return true;
    } else if (isNegativeResponse) {
      context.lastResponse = "No worries! You can always ask me to set reminders later.";
      context.pendingQuestions = context.pendingQuestions.filter(q => q !== "reminder_prompt");
      return true;
    }
  }
  
  return false;
}

// Specific handler functions
async function handleAttendanceQuery(userId) {
  try {
    const studentAttendance = await getAttendanceById(parseInt(userId));
    const total = studentAttendance.length;
    const presentCount = studentAttendance.filter(record => record.status === "present").length;
    
    if (total === 0) {
      return "No attendance records found. Please check with your academic office.";
    }
    
    const attendancePercentage = ((presentCount / total) * 100).toFixed(1);
    const status = attendancePercentage >= 75 ? "✅ You're eligible for exams!" : "⚠️ You need to improve your attendance to be eligible for exams.";
    
    return `Your attendance this semester is ${attendancePercentage}% (${presentCount}/${total} classes). ${status}`;
  } catch (error) {
    return "Unable to fetch attendance data at the moment. Please try again later.";
  }
}

async function handleEventQuery(context) {
  try {
    const latestEvent = await latestEvents();
    
    if (!latestEvent) {
      return "There are no upcoming events at the moment. Check back later for updates!";
    }
    
    const eventDate = new Date(latestEvent.startDatetime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const response = `🎉 The next campus event is "${latestEvent.title}" on ${eventDate}. Would you like to see more upcoming events?`;
    context.pendingQuestions.push("events_more");
    return response;
  } catch (error) {
    return "Unable to fetch event information right now. Please check the campus portal for updates.";
  }
}

async function handleScheduleQuery(userId) {
  // Dummy schedule data - static mock data
  const currentTime = new Date();
  const dayOfWeek = currentTime.getDay();
  const currentHour = currentTime.getHours();
  
  // Mock schedule based on day and time
  const weeklySchedule = {
    1: [{ subject: "Database Management", time: "9:00 AM", room: "Room 302" }, { subject: "Software Engineering", time: "2:00 PM", room: "Room 205" }],
    2: [{ subject: "Computer Networks", time: "10:00 AM", room: "Room 101" }, { subject: "Data Structures", time: "3:00 PM", room: "Room 204" }],
    3: [{ subject: "Operating Systems", time: "11:00 AM", room: "Room 103" }, { subject: "Web Development", time: "1:00 PM", room: "Lab 2" }],
    4: [{ subject: "Machine Learning", time: "9:30 AM", room: "Room 301" }, { subject: "Cybersecurity", time: "2:30 PM", room: "Room 107" }],
    5: [{ subject: "Project Work", time: "10:00 AM", room: "Lab 1" }, { subject: "Seminar", time: "4:00 PM", room: "Auditorium" }]
  };
  
  const todayClasses = weeklySchedule[dayOfWeek] || [];
  if (todayClasses.length === 0) {
    return `📚 No classes scheduled for today. Enjoy your free time!`;
  }
  
  // Find next class
  const nextClass = todayClasses[0]; // Simplified - taking first class
  return `📚 Your next class is ${nextClass.subject} at ${nextClass.time} in ${nextClass.room}.`;
}

async function handleAssignmentQuery(context) {
  // Dummy assignment data - static mock data
  const currentDate = new Date();
  const assignments = [
    { 
      title: "Advanced Database Project", 
      dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      subject: "Database Management" 
    },
    { 
      title: "Network Security Report", 
      dueDate: new Date(currentDate.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      subject: "Computer Networks" 
    },
    { 
      title: "Machine Learning Algorithm", 
      dueDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      subject: "AI & ML" 
    }
  ];
  
  const nextAssignment = assignments[0];
  const response = `📝 Your next assignment is "${nextAssignment.title}" for ${nextAssignment.subject}, due on ${nextAssignment.dueDate}. Would you like me to set a reminder?`;
  context.pendingQuestions.push("reminder_prompt");
  return response;
}

async function handleGradesQuery(userId) {
  // Dummy grades data - static mock data
  const studentGrades = [
    { userId: 1, gpa: 3.8, subjects: [{ name: "Programming", grade: "A+" }, { name: "Data Structures", grade: "A" }, { name: "Mathematics", grade: "B+" }] },
    { userId: 2, gpa: 3.6, subjects: [{ name: "Database Systems", grade: "A" }, { name: "Web Development", grade: "B+" }, { name: "Algorithms", grade: "A-" }] },
    { userId: 3, gpa: 3.9, subjects: [{ name: "Machine Learning", grade: "A+" }, { name: "Computer Networks", grade: "A" }, { name: "Statistics", grade: "A" }] }
  ];
  
  // Find user's grades or use default
  const userGrade = studentGrades.find(grade => grade.userId === parseInt(userId)) || studentGrades[0];
  
  const gradesList = userGrade.subjects.map(subject => `${subject.name}: ${subject.grade}`).join(', ');
  return `📊 Your current semester GPA is ${userGrade.gpa}. Subject grades: ${gradesList}`;
}

async function handleLibraryQuery(userId) {
  // Dummy library data - static mock data
  const libraryData = [
    {
      userId: 1,
      checkedOutBooks: [
        { title: "Database Systems", author: "Silberschatz", dueDate: "May 8th" },
        { title: "Software Engineering Principles", author: "Sommerville", dueDate: "May 12th" }
      ]
    },
    {
      userId: 2,
      checkedOutBooks: [
        { title: "Computer Networks", author: "Tanenbaum", dueDate: "May 10th" }
      ]
    },
    {
      userId: 3,
      checkedOutBooks: []
    }
  ];
  
  const libraryHours = "8:00 AM to 10:00 PM on weekdays, 9:00 AM to 6:00 PM on weekends";
  
  // Find user's library data or use default
  const userLibrary = libraryData.find(data => data.userId === parseInt(userId)) || libraryData[0];
  
  if (userLibrary.checkedOutBooks.length === 0) {
    return `📚 The library is open from ${libraryHours}. You currently have no books checked out.`;
  }
  
  const booksList = userLibrary.checkedOutBooks.map(book => `"${book.title}" by ${book.author} (due ${book.dueDate})`).join(', ');
  return `📚 The library is open from ${libraryHours}. You have ${userLibrary.checkedOutBooks.length} book(s) checked out: ${booksList}`;
}

async function getUpcomingEvents() {
  // This will use actual database call via latestEvents() function
  try {
    // You can call multiple events or create a function to get all upcoming events
    const allEvents = await getAllUpcomingEvents(); // Assuming this function exists
    
    if (!allEvents || allEvents.length === 0) {
      return "No upcoming events found at the moment. Check back later for updates!";
    }
    
    const eventsList = allEvents.slice(0, 5).map(event => {
      const eventDate = new Date(event.startDatetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `🎉 ${event.title}: ${eventDate}`;
    }).join('\n');
    
    return `Here are the upcoming events:\n${eventsList}`;
    
  } catch (error) {
    // Fallback to dummy data if database call fails
    const events = [
      "🎪 Tech Fest: May 10th",
      "💼 Career Fair: May 15th", 
      "🎓 Alumni Meet: May 22nd",
      "🏃 Sports Day: May 28th",
      "📚 Library Week: June 1st-7th"
    ];
    
    return `Here are the upcoming events for this month:\n${events.join('\n')}`;
  }
}

function getGreeting(userId) {
  const greetings = [
    "Hello! How can I assist you with Campus-Connect today?",
    "Hi there! What would you like to know about campus life?",
    "Hey! I'm here to help with your campus queries.",
    "Good to see you! How can I help you today?"
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Website guide and help functions
async function handleWebsiteGuide(context) {
  const quickGuide = `🌐 **Campus Connect Quick Start Guide:**

**Getting Started:**
1️⃣ **Login** - Use your student ID and password
2️⃣ **Dashboard** - Your home base with quick access to everything
3️⃣ **Navigation** - Use the sidebar menu to explore different sections

**Key Sections:**
📚 **Academics** - View schedules, grades, attendance
🎉 **Events** - Browse and register for campus activities  
📖 **Library** - Check book availability and renewals
💬 **Messages** - Communicate with faculty and peers
👤 **Profile** - Update personal information

Would you like a detailed walkthrough of any specific section?`;

  context.pendingQuestions.push("website_guide_more");
  return quickGuide;
}

function getWebsiteFeatures() {
  return `
🚀 **Campus Connect Features**

==============================
📊 **Academic Management**
==============================
• View real-time attendance  
• Check grades and GPA  
• Download mark sheets  
• Access class schedules  

==============================
🎓 **Student Services**
==============================
• Event registration and notifications  
• Library book search and renewals  
• Fee payment and receipts  
• Course registration  

==============================
💬 **Communication**
==============================
• Direct messaging with faculty  
• Campus announcements  
• Discussion forums  
• Group project collaboration  

==============================
📱 **Mobile-Friendly**
==============================
• Responsive design works on any device  
• Push notifications for important updates  
• Offline access to key information  

💡 _Type "tutorial" for step-by-step guidance on using these features!_
`;
}

function handleLoginHelp() {
  return `
🔐 **Login & Account Help**

==============================
🆕 **First-Time Login**
==============================
1. Go to the Campus Connect homepage  
2. Click on **"Student Login"**  
3. Enter your **Student Username**  
4. Use the **default password**  
5. You'll be redirected to your dashboard  

==============================
⚠️ **Account Issues**
==============================
• 📧 Email IT Support: **support@campusconnect.edu**  
• 🏢 Visit the Computer Center (Admin Block)  
• 📞 Call Helpline: **+1-234-567-8900**  

==============================
🔒 **Security Tips**
==============================
✅ Always log out after each session  
✅ Never share your credentials with anyone  
`;
}

function handleProfileHelp() {
  return `
👤 **Profile Management Guide**

==============================
🛠️ **Updating Your Profile**
==============================
1. Click on your name/photo in the top-right corner  
2. Select **"Profile Settings"**  
3. Edit the information you want to change  
4. Click **"Save Changes"**  

==============================
📝 **What You Can Update**
==============================
📧 **Contact Info** – Email, phone number, address  
🏠 **Emergency Contacts** – Parent/guardian details  
🔔 **Notifications** – Choose which alerts you'd like to receive  

==============================
⚠️ **Important Notes**
==============================
• Some details (e.g., **Student ID**, **Date of Birth**) cannot be changed online  
• Changes to **academic records** require approval from the registrar  
• Keep your contact info updated to receive important updates  

==============================
❓ **Need Help?**
==============================
Contact the **Registrar's Office** for official document changes.  
`;
}

function handleDashboardHelp() {
  return `
🏠 **Dashboard Navigation Guide**

==============================
📌 **Your Dashboard Overview**
==============================
The dashboard is your Campus Connect homepage, providing quick access to everything you need.

==============================
🧭 **Main Sections**
==============================
📋 **Quick Stats** – Attendance, GPA, pending assignments  
📅 **Today's Schedule** – Classes and events for the day  
📢 **Recent Announcements** – Latest campus updates  
📚 **Library Status** – Books due soon or overdue  
🎯 **Action Items** – Tasks that need your attention  

==============================
🗺️ **Navigation Tips**
==============================
• Use the **sidebar menu** to move between sections  
• The **search bar** at the top finds anything instantly  
• Access **account settings** via the profile menu (top-right)  

==============================
⚡ **Quick Actions**
==============================
Most dashboard items are **clickable** for instant access to detailed views!  
`;
}

function getDetailedWebsiteGuide() {
  return `
📖 **Detailed Campus Connect Tutorial**

==============================
🎯 **Step-by-Step Walkthrough**
==============================

==============================
📊 **1. Academic Section**
==============================
• **Attendance** – Go to **Academics → Attendance** to view detailed records  
• **Grades** – Check **Academics → Results** for semester-wise grades  
• **Schedule** – View your weekly plan under **Academics → Timetable**  
• **Assignments** – Track deadlines in **Academics → Assignments**  

==============================
🎉 **2. Events & Activities**
==============================
• Browse events under **Campus Life → Events**  
• Filter events by category, date, or interest  
• Click **"Register"** to sign up for events  
• View your registrations in **My Events**  

==============================
📚 **3. Library System**
==============================
• Search for books via **Library → Catalog**  
• Check availability and reserve books  
• View borrowed items and due dates  
• Renew books online (if eligible)  

==============================
💬 **4. Communication**
==============================
• Open messages using the **envelope icon**  
• Join subject-specific **discussion groups**  
• Receive announcements from faculty  
• Use **@mentions** to tag classmates in discussions  

==============================
📱 **5. Mobile Tips**
==============================
• Add Campus Connect to your **home screen**  
• Enable **push notifications** for updates  
• Use the **mobile app** for easier access  
• All activity is **synced across devices**  

==============================
❓ **Need Help?**
==============================
Just ask for guidance on any specific section! 😊  
`;
}

function getHelpMessage() {
  return `
🤖 **How Can I Assist You?**

==============================
📚 **Academic Information**
==============================
• 📊 View attendance records and percentages  
• 📅 Check class schedules and timetables  

==============================
🎉 **Campus Life**
==============================
• 🎪 Discover upcoming events and activities  
• 📚 Check library hours and book status  
• 📢 Stay updated with campus announcements  

==============================
💻 **Website Help**
==============================
• 🌐 How to use Campus Connect – Type **"tutorial"**  
• 🔐 Login and account support – Type **"login help"**  
• 👤 Profile management guidance  
• 🏠 Dashboard navigation tips  
• 🚀 Overview of available features – Type **"features"**  

==============================
💬 **Communication**
==============================
• 🤝 Chat and collaborate with your campus community  

==============================
⚡ **Quick Commands**
==============================
• Type **"help"** – Show this help menu  
• Type **"tutorial"** – Step-by-step website walkthrough  
• Type **"features"** – Full list of capabilities  
• Type **"login help"** – Account assistance  

🎓 Just ask me about any of these topics, and I’ll guide you!
`;
}


function getClosingMessage() {
  const closings = [
    "You're welcome! Have a great day! 😊",
    "Happy to help! See you around campus! 👋", 
    "Goodbye! Feel free to ask me anything anytime!",
    "Take care! I'm always here when you need campus info! 🎓"
  ];
  
  return closings[Math.floor(Math.random() * closings.length)];
}

function getDefaultResponse() {
  return `I'm not sure how to help with that specific request. I can assist you with:
• Attendance and grades
• Class schedules and events  
• Assignment deadlines
• Library information
• Campus activities

Try asking about any of these topics, or type "help" to see all my capabilities! 🤖`;
}
module.exports = {
  async getStudentDashboard(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const studentAttendance = await getAttendanceById(parseInt(userId));
    const total = studentAttendance.length;
    const presentCount = studentAttendance.filter(
      (record) => record.status === "present",
    ).length;

    const attendancePercentage = total > 0 ? (presentCount / total) * 100 : 0;
    const events = await getAllEvents();
    
    res.render("studentDashboard", {
      student,
      studentAttendance,
      events,
      attendancePercentage,
    });
  },
  async getStudentProfile(req, res) {
    const { userId } = req.session;
    const { id } = req.params;
    const student = await getAdmin(userId);
    // const studentProfile = await getStudentById(parseInt(id))
    res.render("studentProfile", { student });
  },
  async getStudentAttendance(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const studentAttendance = await getAttendanceById(parseInt(userId));
    res.render("studentAttendance", { student, studentAttendance });
  },
  async getTeacher(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const staffs = await getAllStaffs();
    res.render("StudentTeacherDashboard", { student, staffs });
  },
  async getSubject(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const subjects = await getAllSubjects();
    res.render("studentSubjectDashboard", { student, subjects });
  },
  async getEvent(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const events = await getAllEvents();
    console.log(events);
    res.render("studentEventDashboard", { student, events });
  },
  async getVehicle(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const vehicles = await getAllVehicles();
    res.render("studentVehicleDashboard", { student, vehicles });
  },
  async getComplaint(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const reports = await getComplaintByUserId();
    res.render("studentComplaintDashboard", { student, reports });
  },
  async getAddComplaint(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    res.render("studentAddComplaint", { student });
  },
  async addComplaint(req, res) {
    try {
      const { title, description, category, reportedBy, studentId } = req.body;
      const complaint = {
        title,
        description,
        category,
        reportedBy,
        studentId: parseInt(studentId),
      };
      await createComplaint(complaint);
      res.redirect("/student/complaints");
    } catch (error) {
      console.log(error);
    }
  },

  async getChats(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    res.render("chatbot", { student });
  },

  async chats(req, res) {
    try {
      console.log("ajdfj");
      const { message } = req.body;
      const { userId } = req.session;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get response based on message content and user context
      const response = await getChatResponse(
        message,
        userId || "anonymous-user",
      );

      // Add a slight delay to simulate processing time (optional)
      setTimeout(() => {
        res.json(response);
      }, 500);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getCommunity(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const messages = await getAllMessages();
    console.log(messages)
    res.render("studentCommunityDashboard", { student, messages });
  },
  async addCommunity(req, res) {
    const { userId } = req.session;
    const id = parseInt(userId);
    const student = await getAdmin(userId);
    const {content} = req.body;
    await createMessage(content, id);
    res.redirect("/student/community");
  },
  async getSIngleEvent(req, res) {
    const { userId } = req.session;
    const student = await getAdmin(userId);
    const { eventId } = req.params;
    const event = await getEventById(parseInt(eventId));
    console.log(event);
    res.render("singleEvent", { student, event });
  }
,
  async addFeedback(req, res) {
  const { userId } = req.session;
  const student = await getStudentById(parseInt(userId));
  console.log("Student ID:", student.id);
  const { comments, rating } = req.body;
  console.log("Comment:", comments, rating);
  const { eventId } = req.params;

  await addEventComment(parseInt(eventId), comments, parseInt(rating), student.id);


  res.status(200).json({ message: 'Feedback submitted successfully' });
}

};
