export default function ChatList() {
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "../../assets/styles/pepole-list.css";
  document.head.appendChild(link);
  const chatList = document.createElement("div");

  chatList.className = "chat-list";
  chatList.innerHTML = `<aside class="right-sidebar">
  <div class="card chat-sidebar-card">
    <div class="menu-section-title">Messages</div>
    
    <div class="item-list">
      
      <!-- Chat Item 1 -->
      <div class="list-item chat-item">
        <div class="item-info">
          <div class="chat-avatar">
            <img src="../../assets/images/download.jpeg" alt="Alan Patterson">
          </div>
          <div class="item-text">
            <h4>Alan Patterson</h4>
            <p>Was great meeting up today!...</p>
          </div>
        </div>
        <span class="chat-badge">2</span>
      </div>

      <!-- Chat Item 2 -->
      <div class="list-item chat-item">
        <div class="item-info">
          <div class="chat-avatar">
            <img src="../../assets/images/download.jpeg" alt="Anna Ferguson">
          </div>
          <div class="item-text">
            <h4>Anna Ferguson</h4>
            <p>Sounds good, see you there!</p>
          </div>
        </div>
      </div>

      <!-- Chat Item 3 -->
      <div class="list-item chat-item">
        <div class="item-info">
          <div class="chat-avatar">
            <img src="../../assets/images/download.jpeg" alt="Dave Bishop">
          </div>
          <div class="item-text">
            <h4>Dave Bishop</h4>
            <p>Sent you the project updates.</p>
          </div>
        </div>
        <span class="chat-badge">1</span>
      </div>

    </div>

    <a href="#" class="view-all chat-view-all">View All</a>
  </div>
</aside>`;
  return chatList;
}
