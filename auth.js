// ==========================================
// MOJ AI BALKAN - AUTH
// Supabase Login / Register / Logout
// ==========================================

let authMode = "login";

// ELEMENTI
const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authMessage = document.getElementById("authMessage");
const authSubmitButton = document.getElementById("authSubmitButton");
const authSwitchButton = document.getElementById("authSwitchButton");


// ==========================================
// PORUKE
// ==========================================

function setAuthMessage(message = "", isError = false) {
  if (!authMessage) return;

  authMessage.textContent = message;

  authMessage.style.color = isError
    ? "#ff7b9c"
    : "#8bdfff";
}


// ==========================================
// OTVORI / ZATVORI LOGIN
// ==========================================

function showAuth() {
  if (!authModal) return;

  authModal.classList.remove("hidden");
}

function hideAuth() {
  if (!authModal) return;

  authModal.classList.add("hidden");
}


// ==========================================
// LOGIN / REGISTER PRIKAZ
// ==========================================

function renderAuthMode(clearMessage = true) {

  if (authMode === "login") {

    authTitle.textContent = "Prijavi se";

    authSubtitle.textContent =
      "Prijavi se da koristiš MOJ AI Balkan.";

    authSubmitButton.textContent =
      "PRIJAVI SE";

    authSwitchButton.textContent =
      "Nemaš račun? Registruj se";

    authPassword.setAttribute(
      "autocomplete",
      "current-password"
    );

  } else {

    authTitle.textContent =
      "Napravi račun";

    authSubtitle.textContent =
      "Registruj se i dobijaš besplatna AI generisanja svaki dan.";

    authSubmitButton.textContent =
      "REGISTRUJ SE";

    authSwitchButton.textContent =
      "Već imaš račun? Prijavi se";

    authPassword.setAttribute(
      "autocomplete",
      "new-password"
    );
  }

  if (clearMessage) {
    setAuthMessage("");
  }
}


// ==========================================
// PROMIJENI LOGIN / REGISTER
// ==========================================

authSwitchButton.addEventListener(
  "click",
  () => {

    authMode =
      authMode === "login"
        ? "register"
        : "login";

    renderAuthMode(true);
  }
);


// ==========================================
// LOGIN / REGISTRACIJA
// ==========================================

authSubmitButton.addEventListener(
  "click",
  async () => {

    const email =
      authEmail.value.trim();

    const password =
      authPassword.value;

    // PROVJERA EMAILA

    if (!email) {

      setAuthMessage(
        "Upiši email adresu.",
        true
      );

      authEmail.focus();

      return;
    }

    // PROVJERA LOZINKE

    if (!password) {

      setAuthMessage(
        "Upiši lozinku.",
        true
      );

      authPassword.focus();

      return;
    }

    if (password.length < 6) {

      setAuthMessage(
        "Lozinka mora imati najmanje 6 znakova.",
        true
      );

      return;
    }


    authSubmitButton.disabled = true;

    authSubmitButton.textContent =
      authMode === "login"
        ? "PRIJAVLJUJEM..."
        : "REGISTRUJEM...";

    setAuthMessage("");


    try {

      // ======================================
      // REGISTRACIJA
      // ======================================

      if (authMode === "register") {

        const {
          data,
          error
        } = await window.sb.auth.signUp({
          email,
          password
        });


        if (error) {

          setAuthMessage(
            error.message,
            true
          );

          return;
        }


        // AKO JE EMAIL CONFIRMATION UKLJUČEN

        if (!data.session) {

          setAuthMessage(
            "Račun je napravljen. Provjeri email i potvrdi registraciju."
          );

          return;
        }


        // AKO JE ODMAH PRIJAVLJEN

        hideAuth();

        await updateUserUI();

        return;
      }


      // ======================================
      // LOGIN
      // ======================================

      const {
        data,
        error
      } =
        await window.sb.auth.signInWithPassword({
          email,
          password
        });


      if (error) {

        setAuthMessage(
          "Email ili lozinka nisu ispravni.",
          true
        );

        return;
      }


      if (data.session) {

        hideAuth();

        await updateUserUI();
      }


    } catch (error) {

      console.error(
        "Auth error:",
        error
      );

      setAuthMessage(
        "Došlo je do greške. Pokušaj ponovo.",
        true
      );

    } finally {

      authSubmitButton.disabled = false;

      authSubmitButton.textContent =
        authMode === "login"
          ? "PRIJAVI SE"
          : "REGISTRUJ SE";
    }
  }
);


// ==========================================
// ENTER = LOGIN
// ==========================================

authPassword.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      authSubmitButton.click();
    }
  }
);


// ==========================================
// AŽURIRAJ USER UI
// ==========================================

async function updateUserUI() {

  try {

    const {
      data: { user },
      error
    } =
      await window.sb.auth.getUser();


    if (error) {

      console.error(
        "Get user error:",
        error
      );
    }


    const usageHint =
      document.getElementById(
        "usageHint"
      );


    // ======================================
    // NIJE PRIJAVLJEN
    // ======================================

    if (!user) {

      if (usageHint) {

        usageHint.textContent =
          "Prijavi se za korištenje AI funkcija.";
      }

      showAuth();

      return;
    }


    // ======================================
    // PRIJAVLJEN
    // ======================================

    hideAuth();


    if (usageHint) {

      usageHint.textContent =
        user.email;
    }


    // ======================================
    // LOGOUT DUGME
    // ======================================

    const profileView =
      document.getElementById(
        "profileView"
      );


    if (
      profileView &&
      !document.getElementById(
        "logoutButton"
      )
    ) {

      const button =
        document.createElement(
          "button"
        );


      button.id =
        "logoutButton";

      button.className =
        "primary";

      button.textContent =
        "Odjavi se";


      button.addEventListener(
        "click",
        async () => {

          button.disabled = true;

          button.textContent =
            "Odjavljujem...";


          try {

            await window.sb.auth.signOut({
              scope: "local"
            });

            authEmail.value = "";
            authPassword.value = "";

            authMode = "login";

            renderAuthMode(true);

            showAuth();

          } catch (error) {

            console.error(
              "Logout error:",
              error
            );

          } finally {

            button.disabled = false;

            button.textContent =
              "Odjavi se";
          }
        }
      );


      profileView
        .querySelector(
          ".profile-card"
        )
        ?.appendChild(button);
    }

  } catch (error) {

    console.error(
      "Update user UI error:",
      error
    );
  }
}


// ==========================================
// AUTH PROMJENE
// ==========================================

window.sb.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    console.log(
      "Auth state:",
      event
    );


    if (session) {

      hideAuth();

    } else {

      showAuth();
    }


    await updateUserUI();
  }
);


// ==========================================
// START
// ==========================================

(async function initAuth() {

  renderAuthMode(true);


  try {

    const {
      data: { session }
    } =
      await window.sb.auth.getSession();


    if (session) {

      hideAuth();

    } else {

      showAuth();
    }


    await updateUserUI();


  } catch (error) {

    console.error(
      "Init auth error:",
      error
    );

    showAuth();

    setAuthMessage(
      "Greška pri povezivanju. Osvježi aplikaciju.",
      true
    );
  }

})();
