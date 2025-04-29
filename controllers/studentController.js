const { getAdmin } = require("../services/admin");
const { getAllEvents, latestEvents } = require("../services/event");
const { getAllMessages, createMessage } = require("../services/message");
const { createComplaint, getComplaintByUserId } = require("../services/report");
const { getAllStaffs } = require("../services/staff");
const { getAttendanceById } = require("../services/student");
const { getAllSubjects } = require("../services/subject");
const { getAllVehicles } = require("../services/vehicles");
const userContexts = {};
async function getChatResponse(message, userId) {
  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();

  // Initialize user context if not exists
  if (!userContexts[userId]) {
    userContexts[userId] = {
      lastInteraction: new Date(),
      conversationHistory: [],
      pendingQuestions: [],
    };
  }

  // Update user context
  const context = userContexts[userId];
  context.lastInteraction = new Date();
  context.conversationHistory.push({ message, timestamp: new Date() });

  // Store response before returning
  let response = "";

  // Check for keywords and return appropriate responses
  if (lowerMessage.includes("attendance")) {
    // Could fetch real attendance data from a database here
    const studentAttendance = await getAttendanceById(parseInt(userId));
    const total = studentAttendance.length;
    const presentCount = studentAttendance.filter(
      (record) => record.status === "present",
    ).length;

    const attendancePercentage = total > 0 ? (presentCount / total) * 100 : 0;
    response = `Your attendance this semester is ${attendancePercentage}%. You need to maintain at least 75% to be eligible for exams.`;
  } else if (
    lowerMessage.includes("event") ||
    lowerMessage.includes("events")
  ) {
    const latestEvent = await latestEvents();
    
    response = "There are no upcoming events at the moment.";
    if (latestEvent) {
      response = `The next campus event is "${
        latestEvent.title
      }" on ${latestEvent.startDatetime.toDateString()}. Would you like to see more upcoming events?`;
      context.pendingQuestions.push("events_more");
    }
    context.pendingQuestions.push("events_more");
  } else if (
    lowerMessage.includes("class") ||
    lowerMessage.includes("schedule")
  ) {
    response =
      "Your next class is Database Management at 11:00 AM in Room 302.";
  } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    response = "Hello! How can I assist you with Campus-Connect today?";
  } else if (
    lowerMessage.includes("yes") &&
    context.pendingQuestions.includes("events_more")
  ) {
    // Handle follow-up to previous question about events
    response =
      "Here are the upcoming events for this month:\n- Tech Fest: May 10th\n- Career Fair: May 15th\n- Alumni Meet: May 22nd\n- Sports Day: May 28th";
    // Remove pending question once addressed
    context.pendingQuestions = context.pendingQuestions.filter(
      (q) => q !== "events_more",
    );
  } else if (
    lowerMessage.includes("deadline") ||
    lowerMessage.includes("assignment")
  ) {
    response =
      "Your next assignment deadline is for Advanced Database project on May 12th. Would you like me to send you a reminder?";
    context.pendingQuestions.push("reminder_prompt");
  } else if (
    lowerMessage.includes("yes") &&
    context.pendingQuestions.includes("reminder_prompt")
  ) {
    response =
      "Great! I've set a reminder for your Advanced Database project on May 11th, a day before it's due.";
    context.pendingQuestions = context.pendingQuestions.filter(
      (q) => q !== "reminder_prompt",
    );
  } else if (
    lowerMessage.includes("grades") ||
    lowerMessage.includes("results")
  ) {
    response =
      "Your current semester GPA is 3.8. You've performed particularly well in Programming (A+) and Data Structures (A).";
  } else if (
    lowerMessage.includes("library") ||
    lowerMessage.includes("books")
  ) {
    response =
      "The library is open from 8:00 AM to 10:00 PM on weekdays. You currently have 2 books checked out, with 'Database Systems' due for return on May 8th.";
  } else {
    // Default response if no keywords matched
    response =
      "I'm not sure how to help with that. You can ask about your attendance, schedule, events, assignments, grades, or library books.";
  }

  return { message: response };
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
  }
};
