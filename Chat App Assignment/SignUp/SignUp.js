const supabaseClient = supabase.createClient("https://queftwxqyuinynpsixqa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZWZ0d3hxeXVpbnlucHNpeHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTQ5NDEsImV4cCI6MjA3NTQ5MDk0MX0.TWex1aIXHoopzD9q1LR2hOt6hsBY6JN3aAtaXpvM5hc"
);

const signUpButton = document.getElementById("signUpButton");

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

const showErrors = () => {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const username = document.getElementById("usernameInput").value.trim();

    if (!username || !email || !password) {
      fieldErrorModal();
      return;
    }

    if (password.length < 6) {
        passLenghtModal();
        return;
    }

    signUpButton.setAttribute("disabled", "true") 
    signUpButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span role="status">Signing Up</span>
    `;

    signUpUser();
}

const signUpUser = async () => {
  const Error_P = document.getElementById("showError_P");
  const username = document.getElementById("usernameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
    const { data, error } = await supabaseClient.auth.signUp(
      {
        email,
         password,
         options: {
          data: {
            username
          }
        }
      }
    );

    if(error){
      signUpButton.innerHTML = "SIGN UP";
      signUpButton.removeAttribute("disabled")
      Error_P.textContent = error.message;
      console.error(error.message);
      return;
    }

    const { error: dbError } = await supabaseClient
    .from("users")
    .insert({ id: data.user.id, username });

    if(dbError){
      signUpButton.innerHTML = "SIGN UP";
      signUpButton.removeAttribute("disabled")
      Error_P.textContent = error.message;
      console.error(error.message);
      return;
    }

    window.location.href = "../index.html";
};

signUpButton.addEventListener("click", showErrors);