const supabaseClient = supabase.createClient(
  "https://wppducaylmjwdtzumvog.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcGR1Y2F5bG1qd2R0enVtdm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTU1ODAsImV4cCI6MjA3NTEzMTU4MH0.WaUWFutRBTQpEQluBj34fs2oC0PGbu1U-ZdYj-ipR_E"
);

const userName = document.getElementById("userNameInput");
const userPostText = document.getElementById("postTextInput");
const toggle = document.getElementById("myToggle");
const userCurrentEmail = document.getElementById("userCurrentEmail_P");
const postBtn = document.getElementById("postBtn");
const centerPostDiv = document.getElementById("centerPostDiv");
const signOutBtn = document.getElementById("signOutButton");


const congratsUser = () => {
   const toastLiveExample = document.getElementById('congratsForLogin');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
};

congratsUser();

const tellPostUpload = () => {
  const toastLiveExample = document.getElementById('postUploaded');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
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

// const likePost = () => {
//   const likeBtn = document.getElementById("likeBtn");
//   if (likeBtn.classList.contains("fa-regular")) {
//     likeBtn.classList.remove("fa-regular");
//     likeBtn.classList.add("fa-solid");
//     likeBtn.style.color = "red";
//   } else {
//     likeBtn.classList.remove("fa-solid");
//     likeBtn.classList.add("fa-regular");
//     likeBtn.style.color = "";
//   }
// }

const signOutUser = async () => {

  confirmSignOutUser = confirm("Are you sure You Want to sign Out?");

  if (!confirmSignOutUser) {
    return;
  };

  const { error } = await supabaseClient.auth.signOut({ scope: 'local' })

  if(error) {
    console.log("Something went Wrong");
  } else {
    signOutModal();
    window.location.href = "../SignIn/SignIn.html";
  };
};


signOutBtn.addEventListener("click" , signOutUser);

const showPost = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString();

    if(userName.value === "" || userPostText.value === "") {
      fieldErrorModal();
     return
  };


    const publicity = toggle.checked ? "Public" : "Private" ;
    
    const postDiv = document.createElement("div");
    postDiv.className = "postDiv";
    postDiv.id = "postDiv";
    postDiv.innerHTML = `
    <div class="postDataDiv">
      <img src="../Assets/user_pfp.jpeg" class="postDivUserImg"/>
      <div class="usernamePublicityDiv">
        <p class="postDivUserName">${userName.value.trim()}</p>
        <p class="postPublicty_P" id="postPublicty_P">${publicity}</p>
      </div>
    </div>
    <p>${userPostText.value.trim()}</p>
    <div>
      <div>
        <i class="fa-regular fa-heart likeBtn"></i>
        <i class="fa-solid fa-comment commentBtn" id="commentBtn" onclick="likePost()"></i>
      </div>
      <p>${time}</p>
    </div>
    `;
    centerPostDiv.appendChild(postDiv);
    
  userName.value = "";
  userPostText.value = "";

 const likeBtns = document.querySelectorAll(".likeBtn");

likeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("fa-regular")) {
      btn.classList.remove("fa-regular");
      btn.classList.add("fa-solid");
      btn.style.color = "red";
    } 
    else {
      btn.classList.remove("fa-solid");
      btn.classList.add("fa-regular");
      btn.style.color = "";
    }
  });
});
};
postBtn.addEventListener("click" , showPost);
