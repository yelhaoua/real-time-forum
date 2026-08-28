import MainHeaders from "../shared/main-headers.js";
import Baner from "./ui/baner.js";

export default function ChatPage() {
  MainHeaders();

  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/chat-page.css";
  document.head.appendChild(link);

  document.getElementById("nav-bar").innerHTML = "";

  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

  let chatHistory = [];

  // const ws = new WebSocket(`ws://localhost:9090/ws`);

  // ws.onopen = () => {
  //   console.log("WebSocket connected to Go server securely.");
  // };

  // ws.onmessage = (event) => {
  //   try {
  //     const incomingMsg = JSON.parse(event.data);
  //     chatHistory.AllMessages.push(incomingMsg);
  //   } catch (e) {
  //     chatHistory.AllMessages.push({
  //       content: event.data,
  //       sender_id: null,
  //       create_time: new Date().toLocaleTimeString(),
  //     });
  //   }

  //   updateChatDOM();
  // };

  // ws.onerror = (error) => {
  //   console.error("WebSocket Error Details:", error);
  // };

  // ws.onclose = () => {
  //   console.log("Persistent connection with Go server dropped.");
  // };

  document.body.addEventListener("submit", (e) => {
    e.preventDefault();

    if (e.target.id === "messageform") {
      const inputElement = e.target.querySelector(
        'input[name="message-content"]',
      );
      const messageText = inputElement.value.trim();

      if (!messageText) return;

      const payload = {
        content: messageText,
        recipient_id: Number(id),
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));

        inputElement.value = "";
      } else {
        Baner("Connection Error", "WebSocket connection is closed. Try again.");
      }
    }
  });

  async function getMessages() {
    try {
      const req = await fetch(`http://localhost:9090/getcahtinfo/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const res = await req.json();

      if (!req.ok) {
        Baner(res.error, res.message);
        setTimeout(() => (window.location.href = "/"), 1000);
        return;
      }
      chatHistory = res.data || [];
      console.log(chatHistory, "1");
      updateChatDOM();
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  function updateChatDOM() {
    const username = document.querySelector(".user-name");
    username.innerHTML = chatHistory.Resc_user_name;
    const messagesBody = document.querySelector(".chat-messages-body");
    if (messagesBody) {
      messagesBody.innerHTML = renderChat(chatHistory.AllMessages);
      messagesBody.scrollTo({
        top: messagesBody.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  function renderChat(history = []) {
    if (!history) {
      history = [];
    }

    return history
      .map((el) => {
        if (id == el.sender_id) {
          return `
                <div class="message-row incoming">
                    <div class="chat-avatar msg-avatar">
                        <img src="../../assets/images/download.jpeg">
                    </div>
                    <div>
                      <h5>${el.sender_name}</h5>
                      <div class="message-content">
                          <p>${el.content}</p>
                          <span class="message-time">${el.creat_time || el.create_time || ""}</span>
                      </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="message-row outgoing">
              <div style="text-align: right">
                <h5>${el.sender_name}</h5>
                <div class="message-content">
                  <div>
                    <p>${el.content}</p>
                    <span class="message-time">${el.creat_time || el.create_time || ""}</span>
                  </div>
                </div>
              </div>  
            </div>
        `;
      })
      .join("");
  }
  setTimeout(getMessages, 0);

  return `
  <div class="chat-page-container">
    <main class="main-chat-window">
      
      <div class="chat-header">
        <div class="active-user-info">
          <a href="#/" class="back-home-btn" title="Back to Home">
           <i class="fa-solid fa-angle-left"></i>
          </a>
          
          <div class="chat-avatar">
            <img src="../../assets/images/download.jpeg" alt="Avatar">
          </div>
          <div class="item-text">
            <h4 class="user-name"></h4>
            <p class="status-text"><span class="status-dot"></span> Online</p>
          </div>
        </div>
        
        <div class="chat-actions">
          <button class="action-btn"><i class="ri-phone-line"></i></button>
          <button class="action-btn"><i class="ri-vidicon-line"></i></button>
          <button class="action-btn"><i class="ri-more-2-fill"></i></button>
        </div>
      </div>

      <div class="chat-messages-body">
        <div class="loading-spinner" style="text-align:center; padding: 20px; color: #718096;">Loading messages...</div>
      </div>

      <div class="chat-input-footer">
        <form class="chat-input-form" id="messageform">
          <input type="text" name="message-content" class="message-input" placeholder="Type a message..." autocomplete="off">
          <button type="submit" class="send-message-btn"><i class="fa-regular fa-paper-plane"></i></button>
        </form>
      </div>

    </main>
  </div>`;
}
