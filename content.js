console.log("🚀 WhatsBlitz content script loaded on WhatsApp Web");

const checkElements = () => {
  const searchBox = document.querySelector("#side > div._ak9t > div > div._ai04 > div > div > div.x1hx0egp.x6ikm8r.x1odjw0f.x6prxxf.x1k6rcq7.x1whj5v > p");
  const chatName = document.querySelector("#main > header > div.x78zum5.xdt5ytf.x1iyjqo2.xl56j7k.xeuugli.xtnn1bt.x9v5kkp.xmw7ebm.xrdum7p > div > div > div > div > span");
  const messageBox = document.querySelector("#main > footer > div.x1n2onr6.xhtitgo.x9f619.x78zum5.x1q0g3np.xuk3077.xjbqb8w.x1wiwyrm.x1gryazu.xkrivgy.xquzyny.xnpuxes.copyable-area > div > span > div > div._ak1r > div > div.x9f619.x78zum5.x6s0dn4.xl56j7k.xpvyfi4.x2lah0s.x1c4vz4f.x1fns5xo.x1ba4aug.x14yjl9h.xudhj91.x18nykt9.xww2gxu.x1pse0pq.x8j4wrb.xfn3atn.x1ypdohk.x1m2oepg");
  const sendButton = document.querySelector("#main > footer > div.x1n2onr6.xhtitgo.x9f619.x78zum5.x1q0g3np.xuk3077.xjbqb8w.x1wiwyrm.x1gryazu.xkrivgy.xquzyny.xnpuxes.copyable-area > div > span > div > div._ak1r > div > div.x9f619.x78zum5.x6s0dn4.xl56j7k.xpvyfi4.x2lah0s.x1c4vz4f.x1fns5xo.x1ba4aug.x14yjl9h.xudhj91.x18nykt9.xww2gxu.x1pse0pq.x8j4wrb.xfn3atn.x1ypdohk.x1m2oepg > button");

  console.log("Search Box:", searchBox);
  console.log("Chat Name:", chatName);
  console.log("Message Input Box:", messageBox);
  console.log("Send Button:", sendButton ? "Found" : "Not found");
};

setTimeout(checkElements, 8000);
