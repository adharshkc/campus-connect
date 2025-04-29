$(document).ready(function() {
    const chatWindow = $('.chat-window-wrapper .card');
    const chatToggle = $('#chat-toggle');
    const minimizeBtn = $('#minimize-chat');
    const chatMessages = $('#chat-messages');
    const chatForm = $('#chat-form');
    const chatInput = $('#chat-input');
    const typingIndicator = $('#typing-indicator');
  
    // Initial state: show chat window, hide toggle button
    chatWindow.show();
    chatToggle.hide();
  
    // Scroll to bottom of chat
    function scrollToBottom() {
      chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }
  
    // Add message to chat
    function addMessage(message, isUser = false) {
      const now = new Date();
      const timeString = now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0');
      const messageHTML = `
        <div class="message ${isUser ? 'user-message' : 'bot-message'}">
          <div class="message-content">
            <div class="message-text">${message}</div>
            <div class="message-time">${timeString}</div>
          </div>
        </div>
      `;
      chatMessages.append(messageHTML);
      scrollToBottom();
    }
  
    // Show typing indicator
    function showTypingIndicator() {
      typingIndicator.show();
      scrollToBottom();
    }
  
    // Hide typing indicator
    function hideTypingIndicator() {
      typingIndicator.hide();
    }
  
    // Minimize chat window
    minimizeBtn.click(function() {
      chatWindow.hide();
      chatToggle.css('display', 'flex');
    });
  
    // Show chat window
    chatToggle.click(function() {
      chatWindow.show();
      chatToggle.hide();
      scrollToBottom();
    });
    
    // Handle form submission
    chatForm.submit(function(e) {
        e.preventDefault();
        const message = chatInput.val().trim();
        console.log(message)
      if (message === '') return;
  
      // Add user message
      addMessage(message, true);
      chatInput.val('');
  
      // Show typing indicator
      showTypingIndicator();
  
      // Make actual API call to backend
      $.ajax({
        url: 'http://localhost:3000/student/chat',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          message: message,
          userId: getUserId() // Assume this function gets the current user ID from session/localStorage
        }),
        success: function(response) {
          hideTypingIndicator();
          addMessage(response.message);
        },
        error: function(xhr, status, error) {
          hideTypingIndicator();
          console.error('Error communicating with server:', error);
          addMessage('Sorry, I encountered an error while processing your request. Please try again later.');
        }
      });
    });
  
    // Helper function to get user ID from session or localStorage
    function getUserId() {
      // This could get the user ID from localStorage, a cookie, or elsewhere
      return localStorage.getItem('userId') || 'anonymous-user';
    }
  
    // Initial scroll
    scrollToBottom();
  });