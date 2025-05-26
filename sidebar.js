(function injectSidebar() {
  if (document.getElementById('whatsblitz-sidebar')) return; // Already injected

  const sidebar = document.createElement('div');
  sidebar.id = 'whatsblitz-sidebar';
  sidebar.style.position = 'fixed';
  sidebar.style.top = '100px';
  sidebar.style.right = '20px';
  sidebar.style.width = '300px';
  sidebar.style.height = '400px';
  sidebar.style.backgroundColor = '#fefefe';
  sidebar.style.border = '1px solid #ddd';
  sidebar.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  sidebar.style.zIndex = '999999';
  sidebar.style.padding = '10px';
  sidebar.style.overflowY = 'auto';
  sidebar.style.fontFamily = 'Arial, sans-serif';
  sidebar.style.fontSize = '14px';
  sidebar.style.color = '#222';
  sidebar.style.borderRadius = '8px';

  sidebar.innerHTML = `
    <h3 style="margin-top:0; font-size:18px;">WhatsBlitz Sidebar</h3>
    <p>Upload file & control sending from here in future upgrades.</p>
    <!-- Could add file input and buttons here for next versions -->
  `;

  document.body.appendChild(sidebar);

  // Optional: make draggable
  makeDraggable(sidebar);

  function makeDraggable(elm) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elm.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elm.style.top = (elm.offsetTop - pos2) + "px";
      elm.style.right = (window.innerWidth - (elm.offsetLeft - pos1) - elm.offsetWidth) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
})();
