const supabaseClient = supabase.createClient("https://queftwxqyuinynpsixqa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWZ0d3hxeXVpbnlucHNpeHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTQ5NDEsImV4cCI6MjA3NTQ5MDk0MX0.TWex1aIXHoopzD9q1LR2hOt6hsBY6JN3aAtaXpvM5hc"
);

const signInButton = document.getElementById("signInButton");

// Modals
const admin1IdPasswordModal = () => {
  const admin1IdPasswordModal = new bootstrap.Modal(
    document.getElementById("admin1IdPasswordModal")
  );
  admin1IdPasswordModal.show();
};

const admin2IdPasswordModal = () => {
  const admin2IdPasswordModal = new bootstrap.Modal(
    document.getElementById("admin2IdPasswordModal")
  );
  admin2IdPasswordModal.show();
};

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

const checkUser = async () => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      return;
    }
    window.location.href = "./Main/home.html";
  }
};
checkUser();

const showErrors = () => {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
    if (!email || !password) {
      fieldErrorModal();
    return;
    }

    if (password.length < 6) {
      passLenghtModal();
      return;
    }

    signInButton.setAttribute("disabled", "true") 
    signInButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Signing In</span>
    `;

    signInUser();
};

const signInUser = async () => {
  const Error_P = document.getElementById("showError_P");
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  const { data, error } = await supabaseClient.auth.signInWithPassword({
  email,
  password,
  });

  if(error){
    console.error(error.message);
    signInButton.innerHTML = `
      SIGN IN
    `;
    signInButton.removeAttribute("disabled")
    Error_P.textContent = error.message;
  } else {
    console.log(data);
    window.location.href = "./Main/home.html"
  }
};

signInButton.addEventListener("click", () => {
  showErrors();
});