export default function ChatPage() {
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/chat-page.css";

  document.head.appendChild(link);
  document.addEventListener("click", () => {
    console.log(document.querySelector(".chat-page-container"));
  });

  let chatHestory = [];

  async function getMessages(id) {
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
      console.log("hnaaaa", res, req);
      users = res.data;

      renderchat(chatHestory);
    } catch (error) {}
  }

  function renderchat() {
    return ` <div class="chat-messages-body">
      <!-- Incoming Message -->
      <div class="message-row incoming">
        <div class="chat-avatar msg-avatar">
          <img src="../../assets/images/download.jpeg" alt="Alan Patterson">
        </div>
        <div class="message-content">
          <p>Hey! Are we still meeting up today for the project review?</p>
          <span class="message-time">10:14 AM</span>
        </div>
      </div>

      <!-- Outgoing Message -->
      <div class="message-row outgoing">
        <div class="message-content">
          <p>Hey Alan! Yes, absolutely. I'll be ready in about 15 minutes.</p>
          <span class="message-time">10:15 AM</span>
        </div>
      </div>

      <!-- Incoming Message -->
      <div class="message-row incoming">
        <div class="chat-avatar msg-avatar">
          <img src="../../assets/images/download.jpeg" alt="Alan Patterson">
        </div>
        <div class="message-content">
          <p>Was great meeting up today! Let me know when you push the updates to the repository.</p>
          <span class="message-time">2 hours ago</span>
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="chat-page-container">


  <main class="main-chat-window">
    <div class="chat-header">
      <div class="active-user-info">
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

    <!-- Messages Container -->
    ${renderchat()}

    <!-- Chat Input Footer -->
    <div class="chat-input-footer">
      <form class="chat-input-form" onsubmit="event.preventDefault();">
        <button type="button" class="input-action-btn"><i class="ri-emotion-line"></i></button>
        <button type="button" class="input-action-btn"><i class="ri-attachment-line"></i></button>
        <input type="text" class="message-input" placeholder="Type a message...">
        <button type="submit" class="send-message-btn"><i class="ri-send-plane-2-fill"></i></button>
      </form>
    </div>

  </main>
  
</div>  `;
}
