const supabaseClient = supabase.createClient(
  "https://mkuvrvijlxluembvduld.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdXZydmlqbHhsdWVtYnZkdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODU2NzIsImV4cCI6MjA3NDQ2MTY3Mn0.4ic4pz1jkldt7ifyiKeksAgyYuP6pYk6ONMsGviarIY"
);

const friends_counter = document.getElementById("friends-count");
const all_contacts = document.getElementById("contact");
const searchInput = document.getElementById("search_input");
const addContactBtn = document.getElementById("add-contact-btn");

async function loadContacts() {
  const { data, error } = await supabaseClient.from("contact_book").select("*");

  if (error) {
    console.error("Error fetching contacts:", error);
    return;
  }
  console.log(data);
  friends_counter.textContent = `${data.length} Friends`;
  renderContact(data);
}

function renderContact(list) {
  all_contacts.innerHTML = "";
  list.forEach((c) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.innerHTML = `
      <img src="Assets/usericon.png"/>
      <div class="text">
        <h3>${c.name}</h3>
        <p>${c.phone}</p>
      </div>
      <i class="fa-solid fa-trash fa-xl delete-btn"></i>
    `;

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete contact: ${c.name}?`)) return;

      const { error } = await supabaseClient
        .from("contact_book")
        .delete()
        .eq("id", c.id);

      if (error) {
        console.error("Error deleting contact:", error);
        return;
      }

      card.remove();
      loadContacts();
    });

    all_contacts.appendChild(card);
  });
}


// add Contact

addContactBtn.addEventListener("click", () => {
  if (document.getElementById("new-contact-form")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "new-contact-form";
  wrapper.className = "newContactDiv";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Enter your Name";
  nameInput.id = "name_input";
  nameInput.className = "name_input";

  const phoneInput = document.createElement("input");
  phoneInput.type = "number";
  phoneInput.placeholder = "Enter Phone Number";
  phoneInput.id = "phone_input";
  phoneInput.className = "phone_input";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Contact";
  saveBtn.id = "save_btn";
  saveBtn.className = "save_btn";
  
  const removeWrapperViaCross = () => {
    wrapper.remove();
  };
  
  const removeWrapper = document.createElement("i");
  removeWrapper.className = "fa-solid fa-xmark cross";
  removeWrapper.addEventListener("click", removeWrapperViaCross);

  wrapper.append(nameInput, phoneInput, saveBtn, removeWrapper);

  const header = document.querySelector(".user-banner");
  header.appendChild(wrapper);


  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name || !phone) return wrapper.remove();

    const { data, error } = await supabaseClient
      .from("contact_book")
      .insert([{ name, phone }]);

    if (error) {
      console.error("Error adding contact:", error);
      return;
    }

    loadContacts();
    wrapper.remove();
  });
});

// search Contact

searchInput.addEventListener("input", (e) => {
  const search = e.target.value.toLowerCase();
  document.querySelectorAll(".contact-card").forEach((card) => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    if (name.includes(search)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
});

loadContacts();
