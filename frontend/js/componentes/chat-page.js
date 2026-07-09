import Baner from "./ui/baner.js";

export default function ChatPage() {
  if (!document.querySelector('link[href*="chat-page.css"]')) {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "../../assets/styles/chat-page.css";
    document.head.appendChild(link);
  }

  document.getElementById("nav-bar").innerHTML = "";

  document.body.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("dddd", e.target.id);

    if (e.target.id == "messageform") {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      try {
        const req = await fetch(`http://localhost:9090/send-message/${id}`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(data),
        });
        const res = await req.json();

        if (!req.ok) {
          Baner(res.error, res.message);
          return;
        }
        window.location.reload();
      } catch (error) {}
    }
  });

  let chatHistory = [];

  const urlParts = window.location.href.split("/");
  const id = urlParts[urlParts.length - 1];

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
        return;
      }

      chatHistory = res.data;

      const messagesBody = document.querySelector(".chat-messages-body");
      if (messagesBody) {
        messagesBody.innerHTML = renderChat(chatHistory);
        messagesBody.scrollTo({
          top: messagesBody.scrollHeight,
  
        });
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  function renderChat(history = []) {
    return history
      .map((el) => {
        if (id != el.recipient_id) {
          return `
                <div class="message-row incoming">
                    <div class="chat-avatar msg-avatar">
                        <img src="../../assets/images/download.jpeg">
                    </div>
                    <div class="message-content">
                        <p>${el.content}</p>
                        <span class="message-time">${el.creat_time || el.create_time}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="message-row outgoing">
                <div class="message-content">
                    <p>${el.content}</p>
                    <span class="message-time">${el.creat_time || el.create_time}</span>
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
          <!-- Back Home Arrow Button -->
          <a href="#/" class="back-home-btn" title="Back to Home">
           <i class="fa-solid fa-angle-left"></i>
          </a>
          
          <div class="chat-avatar">
            <img src="../../assets/images/download.jpeg" alt="Alan Patterson">
          </div>
          <div class="item-text">
            <h4>Alan Patterson</h4>
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
          <input type="text" name="message-content" class="message-input" placeholder="Type a message...">
          <button type="submit" class="send-message-btn"><i class="fa-regular fa-paper-plane"></i></button>
        </form>
      </div>

    </main>
  </div>`;
}
