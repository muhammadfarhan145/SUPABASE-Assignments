const supabaseClient = supabase.createClient(
  "https://queftwxqyuinynpsixqa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWZ0d3hxeXVpbnlucHNpeHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTQ5NDEsImV4cCI6MjA3NTQ5MDk0MX0.TWex1aIXHoopzD9q1LR2hOt6hsBY6JN3aAtaXpvM5hc"
);

const userName = document.getElementById("userNameInput");
const userPostText = document.getElementById("postTextInput");
const toggle = document.getElementById("myToggle");
const userCurrentEmail = document.getElementById("userCurrentEmail_P");
const postBtn = document.getElementById("postBtn");
const centerPostDiv = document.getElementById("centerPostDiv");
const signOutBtn = document.getElementById("signOutButton");
const DocumentationBtn = document.getElementById("DocumentationBtn");

const checkSession = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "./SignUp/SignUp.html";
  }
};
checkSession();

// Modals , Toasts

const tellPostUpload = () => {
  const toastLiveExample = document.getElementById("postUploaded");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  toastBootstrap.show();
};

const congratsForLogin = () => {
  const congratsForLoginModal = document.getElementById("congratsForLogin");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(congratsForLoginModal);
  toastBootstrap.show();
};

const fieldErrorModal = () => {
  const fieldsErrorModal = new bootstrap.Modal(
    document.getElementById("fielderrorModal")
  );
  fieldsErrorModal.show();
};

const signOutModal = () => {
  const SignOutModal = new bootstrap.Modal(
    document.getElementById("signOutModal")
  );
  SignOutModal.show();
};

const documentationModal = () => {
  const documentationModal = new bootstrap.Modal(
    document.getElementById("documentationModal")
  );
  documentationModal.show();
};

const userCurrentAccount = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user) {
    userCurrentEmail.textContent = user.email;
  }
};
userCurrentAccount();

const signOutUser = async () => {
  const confirmSignOutUser = confirm("Are you sure you want to sign out?");
  if (!confirmSignOutUser) return;

  const { error } = await supabaseClient.auth.signOut({ scope: "local" });
  if (error) {
    console.error(error.message);
    return;
  }

  signOutModal();
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
};
signOutBtn.addEventListener("click", signOutUser);

postBtn.addEventListener("click", async () => {
  const user = (await supabaseClient.auth.getUser()).data.user;
  const publicity = toggle.checked ? "Public" : "Private";

  if (userName.value.trim() === "" || userPostText.value.trim() === "") {
    fieldErrorModal()
    return;
  }

  const { error } = await supabaseClient.from("posts").insert({
    user_name: userName.value,
    content: userPostText.value,
    publicity,
    user_id: user.id,
  });

  if (error) {
    console.error(error.message);
    return;
  }

  tellPostUpload();
  userName.value = "";
  userPostText.value = "";
  loadPost();
});

const loadPost = async () => {
  centerPostDiv.innerHTML = "";
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  const { data: posts, error } = await supabaseClient
    .from("posts")
    .select("*")
    .or(`publicity.eq.Public,user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }

  posts.forEach(async (post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "postDiv";

    let postHTML = `
      <div class="postDataDiv">
        <img src="../Assets/user_pfp.jpeg" class="postDivUserImg"/>
        <div class="usernamePublicityDiv">
          <p class="postDivUserName">${post.user_name}</p>
          <p class="postPublicty_P">${post.publicity}</p>
        </div>
      </div>
      <p class="userPostContent">${post.content}</p>
    `;

    if (post.publicity === "Public") {
      postHTML += `
        <div>
          <div class="likeSection">
            <i class="fa-regular fa-heart fa-lg likeBtn" data-post-id="${post.id}"></i>
            <i class="fa-regular fa-comment fa-lg commentBtn" data-post-id="${post.id}"></i>
          </div>
          <div class="likedByDiv" id="likedBy-${post.id}">
            <p class="likedByText">Loading likes...</p>
          </div>
        </div>
      `;
    } else {
      postHTML += `
        <div class="privateInfo">
          <p class="privateText"> This is a private post, So You Cant Like Or Comment</p>
        </div>
      `;
    }

    postDiv.innerHTML = postHTML;
    centerPostDiv.appendChild(postDiv);

    if (post.publicity === "Public") {
      await loadLikedBy(post.id);
    }
  });

  attachLikeEvents();


};

const loadLikedBy = async (postId) => {
  const LikedbyDiv = document.getElementById(`likedBy-${postId}`);

  const { data: likes, error } = await supabaseClient
    .from("likes")
    .select("user_id")
    .eq("post_id", postId);

  if (error) {
    console.error("Error loading likes:", error.message);
    LikedbyDiv.textContent = "Failed to load likes";
    return;
  }

  if (!likes || likes.length === 0) {
    LikedbyDiv.textContent = "No likes yet";
    return;
  }

  const likedByNames = [];

  for (let i = 0; i < likes.length; i++) {
    const like = likes[i];
    const { data: userPost } = await supabaseClient
      .from("posts")
      .select("user_name")
      .eq("user_id", like.user_id)
      .limit(1)
      .single();

    likedByNames.push(userPost?.user_name || "Unknown");
  }

  LikedbyDiv.innerHTML = `Liked by: ${likedByNames.join(", ")}`;
};

const attachLikeEvents = async () => {
  const likeBtns = document.querySelectorAll(".likeBtn");
  const user = (await supabaseClient.auth.getUser()).data.user;

  likeBtns.forEach((btn) => {
    btn.onclick = async () => {
      const postId = btn.dataset.postId;

      const { data: existingLike } = await supabaseClient
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingLike) {
        await supabaseClient
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        btn.classList.remove("fa-solid");
        btn.classList.add("fa-regular");
        btn.style.color = "";
      } else {
        await supabaseClient.from("likes").insert({
          post_id: postId,
          user_id: user.id,
        });

        btn.classList.remove("fa-regular");
        btn.classList.add("fa-solid");
        btn.style.color = "red";
      }

      await loadLikedBy(postId);
    };
  });
};

loadPost();
congratsForLogin();      
DocumentationBtn.addEventListener("click", documentationModal);
