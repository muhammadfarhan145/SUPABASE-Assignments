const supabaseClient = supabase.createClient("https://queftwxqyuinynpsixqa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWZ0d3hxeXVpbnlucHNpeHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTQ5NDEsImV4cCI6MjA3NTQ5MDk0MX0.TWex1aIXHoopzD9q1LR2hOt6hsBY6JN3aAtaXpvM5hc"
);

// Modals & Toasts
const signInFirstModal = () => {
  const signInFirstModal = new bootstrap.Modal(
    document.getElementById("signInFirstModal")
  );
  signInFirstModal.show();
};

const signOutModal = () => {
  const SignOutModal = new bootstrap.Modal(
    document.getElementById("signOutModal")
  );
  SignOutModal.show();
};

const RequestSentErrorAlert = () => {
  const RequestSentErrorAlert = new bootstrap.Modal(
    document.getElementById("RequestSentErrorAlert")
  );
  RequestSentErrorAlert.show();
};

const RequestSentToast = () => {
  const RequestSentSuccessfullyToast = document.getElementById("RequestSentSuccessfullyToast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(RequestSentSuccessfullyToast);
  toastBootstrap.show();
};

const requests_Counter = document.getElementById("requests_Counter");
const friendCards = document.querySelector(".friendCards");
const chatColheader = document.querySelector(".chatColheader");
const chatBoxMessageInput = document.querySelector(".chatBoxMessageInput");
const messagesendBtn = document.querySelector(".messagesendBtn");
const userCards = document.querySelector(".userCards");


let currentChatUser = null;
let currentUserId = null;

// Check User
const checkUser = async () => {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if(!user){
        console.error(error.message);
        signInFirstModal();
        setTimeout(() =>window.location.href = "../index.html", 900);
        return false;
    }
    currentUserId = user.id;
    return true;
}
checkUser();


const headerData = async () => {
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authUser){   
        console.error('Not logged in');
        signOutModal();
        return;
    }

    const { data: profile, error: profileError } = await supabaseClient
    .from("users")
    .select("username, profile_pic")
    .eq('id', authUser.id)
    .single();

    if(profileError){
        console.error(error.message);
        return;
    }

    const header = document.querySelector('.chatColheader');
    if (!header) return;

    header.innerHTML = `
        <img src="${profile.profile_pic}" class="chatColHeaderUserImg">
        <h2 class="chatColHeaderUsername">${profile.username}</h2>
        <button id="signOutBtn" class="chatColHeadersignOutBtn">Sign Out</button>
    `;

    const signOutBtn = document.getElementById("signOutBtn");
    if (signOutBtn) {
        signOutBtn.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to sign out?")) return;

            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error(error.message);
                return;
            }

            signOutModal();
            setTimeout(() => {
                window.location.href = "..index.html";
            }, 1500);
        });
    }
}

headerData();

const updateIncomingCounter = async () => {
    if (!currentUserId) return;

    const { count, error } = await supabaseClient
        .from("friend_requests")
        .select('*', { count: 'exact', head: true })
        .eq("receiver_id", currentUserId)
        .eq("status", "pending");

    if (error) {
        console.error("Counter error:", error.message);
        return;
    }

    requests_Counter.textContent = count || 0;
};

const loadFriendRequest = async () => {
    if (!currentUserId) return;

    const { data: requests, error } = await supabaseClient
        .from("friend_requests")
        .select("id, sender_id, users!sender_id(username, profile_pic)")
        .eq("receiver_id", currentUserId)
        .eq("status", "pending")
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error.message);
        return;
    }

    const requestedUserCards = document.getElementById("requestedUserCards");

    if (!requests || requests.length === 0) {
        requestedUserCards.innerHTML = `<p class="text-muted text-center p-3">No pending requests</p>`;
        updateIncomingCounter();
        return;
    }

    const map = new Map();
    requests.forEach(req => {
        if (!map.has(req.sender_id)) {
            map.set(req.sender_id, {
                username: req.users.username,
                profile_pic: req.users.profile_pic || '../Assets/defaultuserimg.jpeg',
                id: req.id,
                count: 0
            });
        }
        map.get(req.sender_id).count++;
    });

    requestedUserCards.innerHTML = '';

    map.forEach((info, sender_id) => {
        const card = document.createElement("div");
        card.className = "RequestedUserCard";
        card.innerHTML = `
            <div class="RequestedUser-img-username">
                <img src="${info.profile_pic}" class="RequestedUserImg" onerror="this.src='../Assets/defaultuserimg.jpeg'">
                <div>
                    <p class="RequestedUserUsername">${info.username}</p>
                    <small class="text-muted">${info.count} request${info.count > 1 ? 's' : ''}</small>
                </div>
            </div>
            <button class="RequestAcceptBtn" onclick="acceptRequest(${info.id}, '${sender_id}')">Accept</button>
        `;
        requestedUserCards.appendChild(card);
    });

    updateIncomingCounter();
};

const acceptRequest = async (request_id, sender_id) => {
    if (!currentUserId) return;

    await supabaseClient
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", request_id);

    await supabaseClient
        .from("friend_requests")
        .delete()
        .eq("sender_id", sender_id)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending");

    await supabaseClient
        .from("friends")
        .insert([
            { user_id: currentUserId, friend_id: sender_id },
            { user_id: sender_id, friend_id: currentUserId }
        ]);


};

const loadFriends = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabaseClient
        .from("friends")
        .select("friend_id, users!friend_id(username, profile_pic)")
        .eq("user_id", currentUserId);

    if (error) {
        console.error("Load friends error:", error.message);
        return;
    }

    const uniqueFriends = new Map();
    data.forEach(f => {
        if (!uniqueFriends.has(f.friend_id)) {
            uniqueFriends.set(f.friend_id, f);
        }
    });

    friendCards.innerHTML = "";

    uniqueFriends.forEach(f => {
        const friendCard = document.createElement("div");
        friendCard.className = "friendCard";
        friendCard.dataset.friendId = f.friend_id;
        friendCard.onclick = () => loadChat(f.friend_id, f.users.username);

        friendCard.innerHTML = `
            <img src="${f.users.profile_pic || '../Assets/default-pic.png'}" 
                 class="friendImg" onerror="this.src='../Assets/default-pic.png'">
            <div class="friendCard_content">
                <p class="friend_username_P">${f.users.username}</p>
                <p class="friendStatus_p">Online</p>
            </div>
        `;

        friendCards.appendChild(friendCard);
    });
};


const loadUsers = async () => {
    if (!currentUserId) return;

    function FakePhoneNumber() {
        const twoDigits = "+92";
        let number = twoDigits;
        for (let i = 0; i < 9; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    }
    const fakeNumber = FakePhoneNumber();
    const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .neq("id", currentUserId);
    if(error) {
        console.error(error.message);
        return;
    }
    userCards.innerHTML = "";
    data.forEach(user => {
        const userCard = document.createElement("div");
        userCard.className = "userCard";
        userCard.innerHTML = `
            <img src="${user.profile_pic}" class="userCardImg">
            <div class="userCard_Content">
                <p class="userCardUsername_P">${user.username}</p>
                <p class="userCardUserNumber_P">${fakeNumber}</p>
                <button class="userCardAddUserBtn" onclick="sendFriendRequest('${user.id}')">Add User</button>            </div>
        `;
        userCards.appendChild(userCard);
    });
};

const sendFriendRequest = async (receiver_id) => {
    if(!currentUserId) return;
    const { error } = await supabaseClient 
    .from("friend_requests")
    .insert({
        sender_id: currentUserId,
        receiver_id
    });
    if(error){
        console.error(error.message);
        RequestSentErrorAlert();
    } else {
        RequestSentToast();
    }
};

const loadChat = async (friend_id, friend_username) => {
    currentChatUser = { id: friend_id, username: friend_username };
    document.getElementById("selectChatH3").textContent = "";

    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friend_id}),and(sender_id.eq.${friend_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Load chat error:", error);
        return;
    }

    const messageDiv = document.getElementById("messages");
    messageDiv.innerHTML = "";

    data.forEach(msg => {
        if (!msg || !msg.message) return;

        const message = document.createElement("div");
        message.dataset.msgId = msg.id;
        message.className = `message ${msg.sender_id === currentUserId ? "sent" : "received"}`;
        message.textContent = msg.message;
        messageDiv.appendChild(message);
    });

    messageDiv.scrollTop = messageDiv.scrollHeight;
};


const sendMessage = async () => {
    if (!currentChatUser) return;

    const messageText = chatBoxMessageInput.value.trim();
    if (!messageText) return;

    const { data: insertedMsg, error } = await supabaseClient
        .from("messages")
        .insert({
            sender_id: currentUserId,
            receiver_id: currentChatUser.id,
            message: messageText
        })
        .select()
        .single();

    if (error) {
        console.error("Send message error:", error);
        alert("Failed to send message!");
        return;
    }

    chatBoxMessageInput.value = "";

    const messageDiv = document.getElementById("messages");

    if (messageDiv.querySelector(`[data-msg-id="${insertedMsg.id}"]`)) return;

    const messageEl = document.createElement("div");
    messageEl.dataset.msgId = insertedMsg.id;
    messageEl.className = "message sent";
    messageEl.textContent = messageText;
    messageDiv.appendChild(messageEl);

    messageDiv.scrollTop = messageDiv.scrollHeight;
}


const RealtimeSubscriptions = () => {

  supabaseClient
    .channel('friend_requests_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'friend_requests' },
      (payload) => {
        if (
          payload.eventType === 'INSERT' &&
          payload.new.receiver_id === currentUserId &&
          payload.new.status === 'pending'
        ) {
          loadFriendRequest();
          updateIncomingCounter();
        }

        if (
          payload.eventType === 'UPDATE' &&
          payload.new.receiver_id === currentUserId &&
          payload.new.status === 'accepted'
        ) {
          loadFriendRequest();
          updateIncomingCounter();
          loadFriends();
        }

        if (
          payload.eventType === 'DELETE' &&
          payload.old.receiver_id === currentUserId
        ) {
          loadFriendRequest();
          updateIncomingCounter();
        }
      }
    )
    .subscribe();

  supabaseClient
    .channel('messages_channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        if (
          currentChatUser &&
          (payload.new.sender_id === currentChatUser.id ||
            payload.new.receiver_id === currentUserId)
        ) {
          const messageDiv = document.getElementById('messages');

          if (messageDiv.querySelector(`[data-msg-id="${payload.new.id}"]`)) return;

          const div = document.createElement('div');
          div.dataset.msgId = payload.new.id;
          div.className = `message ${
            payload.new.sender_id === currentUserId ? 'sent' : 'received'
          }`;
          div.textContent = payload.new.message;
          messageDiv.appendChild(div);

          messageDiv.scrollTop = messageDiv.scrollHeight;
        }
      }
    )
    .subscribe();

  supabaseClient
    .channel('friends_channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'friends' },
      (payload) => {
        if (
          payload.new.user_id === currentUserId ||
          payload.new.friend_id === currentUserId
        ) {
          loadFriends();
        }
      }
    )
    .subscribe();
};

(async () => {
    const isLoggedIn = await checkUser();
    if (!isLoggedIn) return;

    await headerData();
    await loadUsers();
    await loadFriends();
    await loadFriendRequest();
    RealtimeSubscriptions();
})();

document.getElementById("messagesendBtn").addEventListener("click", sendMessage);

chatBoxMessageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});