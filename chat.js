// const connection = new signalR.HubConnectionBuilder()
//   .withUrl("https://chatsvcdev.interacers.com/chat", { //https://localhost:50090/  chatsvcdev.interacers.com/chat
//     skipNegotiation: true,  // This skips the negotiation step
//     transport: signalR.HttpTransportType.WebSockets // Explicitly specify the transport
// }) // Replace with your server's SignalR URL
//   .configureLogging(signalR.LogLevel.Debug)
//   .withAutomaticReconnect()
//   .build();


  let connection;
 // const rtHubURL = "https://localhost:50090/chat";
 const rtHubURL = "https://chatsvcdev.interacers.com/chat";

  const hubOptions = { 
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
  };
  
//   const startSRConnection = () => {
    connection = new signalR.HubConnectionBuilder()
          .withUrl(rtHubURL, hubOptions)
          .configureLogging(signalR.LogLevel.Debug)
          .withAutomaticReconnect({
              nextRetryDelayInMilliseconds: retryContext => {
                  return retryContext.previousRetryCount <= 15 ? Math.random() * 15000 : null;
              }
          })
          .build();
// UI Elements
const sendButton = document.getElementById("sendButton");
const sendToUserButton = document.getElementById("sendToUser");
const userInput = document.getElementById("userInput");
const messageInput = document.getElementById("messageInput");
const receiverIdInput = document.getElementById("receiverId");
const groupNameInput = document.getElementById("groupName");
const groupUserNameInput = document.getElementById("groupUserName");
const messageList = document.getElementById("messagesList");
const messageGroupList = document.getElementById("messagesGroupList");
const connectionIdDisplay = document.getElementById("connectionId");
const connectionTab = document.getElementById("connectionTab");
const groupTab = document.getElementById("groupTab");

// Tab switching functionality
document.getElementById("tabConnectionId").addEventListener("click", function () {
    showTab("connectionTab");
});

document.getElementById("tabGroupChat").addEventListener("click", function () {
    showTab("groupTab");
});

function showTab(tabId) {
    if (tabId === "connectionTab") {
        connectionTab.classList.add("active");
        groupTab.classList.remove("active");
        document.getElementById("tabConnectionId").classList.add("active");
        document.getElementById("tabGroupChat").classList.remove("active");
    } else {
        groupTab.classList.add("active");
        connectionTab.classList.remove("active");
        document.getElementById("tabConnectionId").classList.remove("active");
        document.getElementById("tabGroupChat").classList.add("active");
    }
}

// Disable send buttons until connection is established
sendButton.disabled = true;
sendToUserButton.disabled = true;
// Event listeners
connection.onclose(async (error) => {
    console.error('SignalR connection closed due to error: ', error);

    alert('SignalR connection closed due to error: ', error);

});

connection.onreconnecting((error) => {
    console.warn('SignalR reconnecting: ', error);
});

connection.onreconnected((connectionId) => {
    console.log('SignalR reconnected: ', connectionId);
});

// Listen for incoming messages from SignalR
connection.on("ReceiveGroupMessage", function (message,senderName,ms1) {
    const li = document.createElement("li");
    li.textContent = message + " -  " + senderName + " -  " + ms1;
    messageGroupList.appendChild(li);
});

//Recive messge for singal chat
// connection.on("ReceiveMessage", function (user, message) {
//  var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//  var encodedMsg = user + " : " + msg;
//  var li = document.createElement("li");
//  li.textContent = encodedMsg;
//  messageList.appendChild(li);
// });

connection.on("ReceiveMessage", function (message,senderName,ms1) {
    console.log(message,senderName,ms1);
    var li = document.createElement("li");
        li.textContent = message + " -  " + senderName + " -  " + ms1;
        messageList.appendChild(li);
});

// Start the connection and handle connectionId
connection.start().then(function () {
    connection.invoke("GetConnectionId").then(function (id) {
        connectionIdDisplay.innerText = id;
    }).catch(function (err) {
        console.error("Error fetching connectionId:", err);
        connectionIdDisplay.innerText = "Failed to get connection ID";
    });

    // Enable send buttons after connection
    sendButton.disabled = false;
    sendToUserButton.disabled = false;
}).catch(function (err) {
    console.error("Error starting SignalR connection:", err);
    connectionIdDisplay.innerText = "Connection failed!";
});

// Event listener for sending a message to all users
sendButton.addEventListener("click", function (event) {
    event.preventDefault();
    const user = userInput.value.trim();
    const message = messageInput.value.trim();

    if (user && message) {
        connection.invoke("SendMessage", user, message).catch(function (err) {
            console.error("Error sending message to all users:", err);
        });
    } else {
        alert("Please provide both username and message.");
    }
});

// Event listener for sending a message to a specific user
sendToUserButton.addEventListener("click", function (event) {
    event.preventDefault();
    const user = userInput.value.trim();
    const receiverConnectionId = receiverIdInput.value.trim();
    const message = messageInput.value.trim();

    if (user && message && receiverConnectionId) {
        connection.invoke("SendMessageToUser",receiverConnectionId,message, user).catch(function (err) {
            console.error("Error sending message to specific user:", err);
        });
    } else {
        alert("Please provide all fields: username, message, and receiver connection id.");
    }
});

  // Send the message to the backend via SignalR and MediatR

//   Event listener for sending a message to a specific user
// sendToUserButton.addEventListener("click", function (event) {
//     event.preventDefault();
//     const user = userInput.value.trim();
//     const receiverConnectionId = receiverIdInput.value.trim();
//     const message = messageInput.value.trim();

//     if (user && message && receiverConnectionId) {
//         fetch("http://localhost:50091/api/Chat/sendmessage", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 userName: userInput.value.trim(),  // Replace with actual sender user information
//                 receiverId: "7c37caa4-2605-42e1-954c-9ceac3b66618",  // Replace with actual receiver user ID
//                 receiverConnectionId: receiverIdInput.value.trim(),  // This would be their SignalR connection ID
//                 message: message,
//                 senderId: "a260d39e-daf5-418a-be25-fa61066c2e32"  // Replace with actual sender user ID
//             })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.value !== null) {
//                 console.log("Message sent successfully");
//                 document.getElementById("message").value = "";  // Clear message input
//             } else {
//                 alert(data.message);
//             }
//         })
//         .catch(error => {
//             console.error("Error sending message:", error);
//         });
//     } else {
//         alert("Please provide all fields: username, message, and receiver connection id.");
//     }
// });
 



// Function to join a group
function joinGroup() {
    const groupName = groupNameInput.value.trim();
    const groupUserName = groupUserNameInput.value.trim();
    if (groupName && groupUserName) {
        connection.invoke("JoinGroup", groupName,groupUserName)
        .then(function () {
            console.log("Successfully joined the group!");
        })
        .catch(function (err) {
            console.error("Error joining group:", err);
        });
    } else {
        alert("Please provide a group name.");
    }
}

// Function to send a message to a group
function sendGroupMessage() {
    const message = document.getElementById("message").value.trim();
    const groupName = groupNameInput.value.trim();
    const userName = groupUserNameInput.value.trim();

    if (groupName && message && userName) {
        connection.invoke("SendMessageToGroup", groupName, message, userName)
        .then(function () {
            console.log("Successfully joined the group!");
        }).catch(function (err) {
            console.error("Error sending group message:", err);
        });
    } else {
        alert("Please provide both a group name and a message.");
    }
}

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
