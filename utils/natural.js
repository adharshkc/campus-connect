const natural = require("natural");

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

function trainNLPModel() {
  // Basic intent classification
  classifier.addDocument("hello", "greeting");
  classifier.addDocument("hi", "greeting");
  classifier.addDocument("hey", "greeting");
  classifier.addDocument("how are you", "greeting");
  classifier.addDocument("good morning", "greeting");
  classifier.addDocument("good afternoon", "greeting");
  classifier.addDocument("good evening", "greeting");

  classifier.addDocument("bye", "farewell");
  classifier.addDocument("goodbye", "farewell");
  classifier.addDocument("see you later", "farewell");
  classifier.addDocument("talk to you later", "farewell");

  classifier.addDocument("what is your name", "identity");
  classifier.addDocument("who are you", "identity");
  classifier.addDocument("tell me about yourself", "identity");

  classifier.addDocument("help", "help");
  classifier.addDocument("I need help", "help");
  classifier.addDocument("can you help me", "help");
  classifier.addDocument("support", "help");

  // Train the classifier
  classifier.train();
}

function generateResponse(intent, message) {
  const responses = {
    greeting: [
      "Hello! How can I help you today?",
      "Hi there! What can I do for you?",
      "Greetings! How may I assist you?",
    ],
    farewell: [
      "Goodbye! Have a great day!",
      "See you later! Feel free to come back if you need anything.",
      "Take care! It was nice chatting with you.",
    ],
    identity: [
      "I'm an AI assistant. How can I help you?",
      "I'm your friendly AI chatbot. What would you like to know?",
      "I'm an AI assistant here to help with your questions.",
    ],
    help: [
      "I can help answer questions, provide information, or just chat. What do you need?",
      "I'm here to assist you. What kind of help are you looking for?",
      "How can I assist you today? Just let me know what you need help with.",
    ],
    unknown: [
      "I'm not sure I understand. Could you rephrase that?",
      "I don't have an answer for that yet. Can you try asking something else?",
      "I'm still learning. Could you try a different question?",
    ],
  };
  const category = responses[intent] || responses.unknown;
  const randomIndex = Math.floor(Math.random() * category.length);
  return category[randomIndex];
}
