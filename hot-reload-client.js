try {
  const ws = new WebSocket("ws://localhost:4008");
  ws.onmessage = (msg) => {
    if (msg.data === "reload") {
      console.log("Hot reloading...");
      window.location.reload();
    }
  };
} catch (e) {
  console.error(e);
}
