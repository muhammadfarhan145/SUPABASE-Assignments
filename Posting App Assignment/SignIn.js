const supabaseClient = supabase.createClient(
  "https://queftwxqyuinynpsixqa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWZ0d3hxeXVpbnlucHNpeHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTQ5NDEsImV4cCI6MjA3NTQ5MDk0MX0.TWex1aIXHoopzD9q1LR2hOt6hsBY6JN3aAtaXpvM5hc"
);

const userEmailInput = document.getElementById("SignIn_emailInput");
const userPasswordInput = document.getElementById("SignIn_PasswordInput");
const signInBtn = document.getElementById("SignIn_btn");

const fieldErrorModal = () => {
  const fieldsErrorModal = new bootstrap.Modal(
    document.getElementById("fielderrorModal")
  );
  fieldsErrorModal.show();
};

const passLenghtModal = () => {
  const passwordErrorModal = new bootstrap.Modal(
    document.getElementById("passworderrorModal")
  );
  passwordErrorModal.show();
};

const checkAllInputs = () => {
  const checkEmailInput = userEmailInput.value.trim();
  const checkPasswordInput = userPasswordInput.value.trim();
  if (!checkEmailInput || !checkPasswordInput) {
    fieldErrorModal();
    return;
  }
};

const checkPassInputs = () => {
  const userPasswordInputLength = userPasswordInput.value.trim();
  if (userPasswordInputLength.length < 6) {
    passLenghtModal();
    return;
  }
};

const checkUser = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      alert("User does not exist Or Deleted");
      await supabaseClient.auth.signOut();
      return;
    }
    window.location.href = "./Main/homepage.html";
  }
};

checkUser();

const signInUser = async () => {
  const email = userEmailInput.value.trim();
  const password = userPasswordInput.value.trim();
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error.message);
  } else {
    console.log(data);
    window.location.href = "./Main/homepage.html";
  }
};

const showErrors = () => {
  const loadBtn = document.createElement("button");
  loadBtn.className = "btn btn-primary text-secondary SignIn_btn";
  loadBtn.type = "button";
  loadBtn.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px;">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span role="status">Loading...</span>
    </span>
    `;

  signInBtn.replaceWith(loadBtn);
  setTimeout(() => {
    loadBtn.replaceWith(signInBtn);
  }, 900);

  const checkEmailInput = userEmailInput.value.trim();
  const checkPasswordInput = userPasswordInput.value.trim();

  if (!checkEmailInput || !checkPasswordInput) {
    fieldErrorModal();
  } else if (checkPasswordInput.length < 6) {
    passLenghtModal();
  } else if (!checkEmailInput && !checkPasswordInput) {
    fieldErrorModal();
  }

  signInUser();
};

signInBtn.addEventListener("click", showErrors);
