// ==========================================
// MOJ AI BALKAN - FRONTEND
// Auth + usage + generator + history
// ==========================================

const featureConfig = {
  message: {
    icon: "💗",
    eyebrow: "PORUKE",
    title: "Napiši mi poruku",
    description:
      "Ljubavna, poslovna, izvinjenje, čestitka ili odgovor na poruku.",
    styles: [
      "Nježna",
      "Direktna",
      "Romantična",
      "Smiješna",
      "Formalna"
    ]
  },

  song: {
    icon: "🎵",
    eyebrow: "PJESME",
    title: "Napravi mi pjesmu",
    description:
      "Opiši osobu, priču i emociju. MOJ AI će napraviti tekst pjesme.",
    styles: [
      "Balkan",
      "Pop",
      "Rap",
      "Tužna",
      "Vesela",
      "Turski stil"
    ]
  },

  cv: {
    icon: "📄",
    eyebrow: "POSAO",
    title: "CV / Molba za posao",
    description:
      "Pretvori svoje iskustvo u profesionalan tekst za CV ili prijavu.",
    styles: [
      "CV opis",
      "Molba",
      "Email prijava",
      "Kratko",
      "Profesionalno"
    ]
  },

  translate: {
    icon: "✉️",
    eyebrow: "PREVOD",
    title: "Objasni mi pismo",
    description:
      "Zalijepi tekst pisma i dobićeš jednostavno objašnjenje.",
    styles: [
      "Jednostavno",
      "Detaljno",
      "Prevedi",
      "Šta trebam uraditi"
    ]
  },

  social: {
    icon: "📱",
    eyebrow: "DRUŠTVENE MREŽE",
    title: "TikTok / Instagram",
    description:
      "Napravi opis, hook, CTA i hashtagove za objavu.",
    styles: [
      "TikTok",
      "Instagram",
      "YouTube",
      "Viralno",
      "Profesionalno"
    ]
  },

  love: {
    icon: "❤️",
    eyebrow: "LJUBAV",
    title: "Ljubavni savjet",
    description:
      "Opiši situaciju ili poruku i dobićeš prijedlog odgovora.",
    styles: [
      "Smireno",
      "Flert",
      "Direktno",
      "Pomirljivo",
      "Samouvjereno"
    ]
  }
};


// ==========================================
// STATE
// ==========================================

let currentType = "message";
let selectedStyle = "";
let currentResult = null;

let usageState = {
  plan: "free",
  limit: 5,
  used: 0,
  remaining: 5,
  loaded: false
};


// ==========================================
// HELPERS
// ==========================================

const $ = id =>
  document.getElementById(id);


const views = {
  home: $("homeView"),
  generator: $("generatorView"),
  history: $("historyView"),
  favorites: $("favoritesView"),
  profile: $("profileView")
};


function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}


// ==========================================
// NAVIGATION
// ==========================================

function nav(name) {

  Object.values(views).forEach(view => {
    view.classList.remove("active");
  });


  if (views[name]) {
    views[name].classList.add("active");
  }


  document
    .querySelectorAll(".nav")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.nav === name
      );
    });


  if (name === "history") {
    renderHistory();
  }


  if (name === "favorites") {
    renderFavorites();
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


document
  .querySelectorAll("[data-nav]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => nav(button.dataset.nav)
    );
  });


// ==========================================
// SUPABASE SESSION
// ==========================================

async function getSession() {

  try {

    if (!window.sb) {
      return null;
    }


    const {
      data: { session }
    } =
      await window.sb.auth.getSession();


    return session || null;

  } catch (error) {

    console.error(
      "Session error:",
      error
    );

    return null;
  }
}


// ==========================================
// USAGE UI
// ==========================================

function renderUsage() {

  const usageLabel =
    $("usageLabel");

  const usageHint =
    $("usageHint");

  const usageBar =
    $("usageBar");


  if (!usageState.loaded) {

    if (usageLabel) {
      usageLabel.textContent =
        "Provjeravam dnevni limit...";
    }

    if (usageBar) {
      usageBar.style.width = "0%";
    }

    return;
  }


  const {
    plan,
    limit,
    remaining
  } = usageState;


  if (usageLabel) {

    if (plan === "pro") {

      usageLabel.textContent =
        `${remaining} PRO generisanja danas`;

    } else {

      usageLabel.textContent =
        `${remaining} besplatnih generisanja danas`;
    }
  }


  if (usageBar) {

    const percentage =
      limit > 0
        ? Math.max(
            0,
            Math.min(
              100,
              (remaining / limit) * 100
            )
          )
        : 0;

    usageBar.style.width =
      `${percentage}%`;
  }


  if (usageHint) {

    usageHint.textContent =
      plan === "pro"
        ? "👑 MOJ AI PRO"
        : "FREE plan";
  }


  updatePlanCard();
}


// ==========================================
// PROFILE PLAN CARD
// ==========================================

function updatePlanCard() {

  const planCard =
    document.querySelector(
      ".plan-card"
    );

  if (!planCard) {
    return;
  }


  const title =
    planCard.querySelector("h3");

  const list =
    planCard.querySelector("ul");

  const button =
    $("profileProButton");


  if (usageState.plan === "pro") {

    if (title) {
      title.innerHTML =
        `MOJ AI PRO <span>AKTIVAN</span>`;
    }


    if (list) {

      list.innerHTML = `
        <li>✓ Do ${usageState.limit} generisanja dnevno</li>
        <li>✓ Sve AI funkcije</li>
        <li>✓ Historija i sačuvani tekstovi</li>
        <li>✓ PRO pogodnosti</li>
      `;
    }


    if (button) {

      button.textContent =
        "👑 PRO AKTIVAN";

      button.disabled = true;
    }

  } else {

    if (title) {
      title.innerHTML =
        `BESPLATNO <span>0 €</span>`;
    }


    if (list) {

      list.innerHTML = `
        <li>✓ 5 generisanja dnevno</li>
        <li>✓ Sve osnovne funkcije</li>
        <li>✓ Lokalna historija</li>
      `;
    }


    if (button) {

      button.textContent =
        "👑 Pogledaj PRO";

      button.disabled = false;
    }
  }
}


// ==========================================
// LOAD USAGE FROM SERVER
// ==========================================

async function refreshUsage() {

  renderUsage();


  const session =
    await getSession();


  if (!session?.access_token) {

    usageState = {
      plan: "free",
      limit: 5,
      used: 0,
      remaining: 5,
      loaded: false
    };


    if ($("usageLabel")) {
      $("usageLabel").textContent =
        "Prijavi se za korištenje";
    }


    if ($("usageHint")) {
      $("usageHint").textContent =
        "MOJ AI Balkan";
    }


    if ($("usageBar")) {
      $("usageBar").style.width =
        "0%";
    }


    return null;
  }


  try {

    const response =
      await fetch(
        "/api/generate",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${session.access_token}`
          }
        }
      );


    const data =
      await response
        .json()
        .catch(() => ({}));


    if (!response.ok) {

      console.error(
        "Usage API error:",
        data
      );


      if (
        response.status === 401 &&
        typeof showAuth === "function"
      ) {
        showAuth();
      }


      return null;
    }


    usageState = {
      plan:
        data.plan || "free",

      limit:
        Number(data.limit || 5),

      used:
        Number(data.used || 0),

      remaining:
        Number(
          data.remaining ?? 5
        ),

      loaded: true
    };


    renderUsage();

    return usageState;

  } catch (error) {

    console.error(
      "Usage request failed:",
      error
    );

    return null;
  }
}


window.refreshUsage =
  refreshUsage;


// ==========================================
// FEATURES
// ==========================================

document
  .querySelectorAll(".feature")
  .forEach(button => {

    button.addEventListener(
      "click",
      () =>
        openGenerator(
          button.dataset.type
        )
    );
  });


$("backButton")
  ?.addEventListener(
    "click",
    () => nav("home")
  );


function openGenerator(type) {

  currentType = type;


  const config =
    featureConfig[type];


  if (!config) {
    return;
  }


  $("generatorIcon").textContent =
    config.icon;

  $("generatorEyebrow").textContent =
    config.eyebrow;

  $("generatorTitle").textContent =
    config.title;

  $("generatorDescription").textContent =
    config.description;


  $("promptInput").value = "";

  $("charCount").textContent = "0";

  $("resultCard")
    .classList
    .add("hidden");


  currentResult = null;

  selectedStyle =
    config.styles[0];


  $("styleChips").innerHTML =
    config.styles
      .map(
        (style, index) => `
          <button
            class="chip ${index === 0 ? "active" : ""}"
            data-style="${escapeHtml(style)}"
          >
            ${escapeHtml(style)}
          </button>
        `
      )
      .join("");


  document
    .querySelectorAll(".chip")
    .forEach(chip => {

      chip.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".chip")
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );


          chip.classList.add(
            "active"
          );


          selectedStyle =
            chip.dataset.style;
        }
      );
    });


  nav("generator");
}


// ==========================================
// CHARACTER COUNT
// ==========================================

$("promptInput")
  ?.addEventListener(
    "input",
    event => {

      $("charCount").textContent =
        event.target.value.length;
    }
  );


// ==========================================
// SHOW API ERROR
// ==========================================

function showResultMessage(
  message
) {

  $("resultText").textContent =
    message;

  $("resultCard")
    .classList
    .remove("hidden");


  setTimeout(
    () => {

      $("resultCard")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    },
    50
  );
}


// ==========================================
// GENERATE AI
// ==========================================

$("generateButton")
  ?.addEventListener(
    "click",
    async () => {

      const prompt =
        $("promptInput")
          .value
          .trim();


      if (!prompt) {

        $("promptInput").focus();

        return;
      }


      const session =
        await getSession();


      if (!session?.access_token) {

        if (
          typeof showAuth ===
          "function"
        ) {
          showAuth();
        }

        return;
      }


      const button =
        $("generateButton");


      button.disabled = true;

      button.textContent =
        "✨ GENERIŠEM...";


      try {

        const response =
          await fetch(
            "/api/generate",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`
              },

              body:
                JSON.stringify({
                  type:
                    currentType,

                  prompt,

                  style:
                    selectedStyle
                })
            }
          );


        const data =
          await response
            .json()
            .catch(() => ({}));


        // SESSION EXPIRED

        if (response.status === 401) {

          showResultMessage(
            data.error ||
            "Sesija je istekla. Prijavi se ponovo."
          );


          if (
            typeof showAuth ===
            "function"
          ) {
            showAuth();
          }


          return;
        }


        // DAILY LIMIT

        if (response.status === 429) {

          if (
            data.plan ||
            data.limit
          ) {

            usageState = {
              plan:
                data.plan ||
                usageState.plan,

              limit:
                Number(
                  data.limit ||
                  usageState.limit
                ),

              used:
                Number(
                  data.used ||
                  usageState.used
                ),

              remaining: 0,

              loaded: true
            };


            renderUsage();
          }


          showResultMessage(
            data.error ||
            "Dostigao si današnji limit."
          );


          if (
            usageState.plan ===
            "free"
          ) {

            setTimeout(
              () => openPro(),
              700
            );
          }


          return;
        }


        // OTHER ERROR

        if (
          !response.ok ||
          !data.text
        ) {

          showResultMessage(
            data.error ||
            "AI trenutno nije dostupan. Pokušaj ponovo."
          );

          return;
        }


        // SUCCESS

        const text =
          data.text.trim();


        currentResult = {
          id: Date.now(),

          type:
            currentType,

          style:
            selectedStyle,

          prompt,

          text,

          createdAt:
            new Date()
              .toISOString(),

          favorite: false
        };


        $("resultText")
          .textContent =
          text;


        $("resultCard")
          .classList
          .remove("hidden");


        saveHistory(
          currentResult
        );


        $("favoriteButton")
          .classList
          .remove("active");


        $("favoriteButton")
          .textContent =
          "♡";


        // UPDATE REAL SERVER USAGE

        usageState = {
          plan:
            data.plan ||
            "free",

          limit:
            Number(
              data.limit || 5
            ),

          used:
            Number(
              data.used || 0
            ),

          remaining:
            Number(
              data.remaining ?? 0
            ),

          loaded: true
        };


        renderUsage();


        setTimeout(
          () => {

            $("resultCard")
              .scrollIntoView({
                behavior: "smooth",
                block: "start"
              });

          },
          50
        );


      } catch (error) {

        console.error(
          "Generate error:",
          error
        );


        showResultMessage(
          "Nema veze sa serverom. Pokušaj ponovo."
        );


      } finally {

        button.disabled = false;

        button.textContent =
          "✨ GENERIŠI";
      }
    }
  );


// ==========================================
// HISTORY
// ==========================================

function getHistory() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "mojai_history"
      ) || "[]"
    );

  } catch {

    return [];
  }
}


function saveHistory(item) {

  const history =
    getHistory();


  history.unshift(item);


  localStorage.setItem(
    "mojai_history",
    JSON.stringify(
      history.slice(0, 30)
    )
  );
}


function updateItem(
  id,
  patch
) {

  const history =
    getHistory()
      .map(item =>
        item.id === id
          ? {
              ...item,
              ...patch
            }
          : item
      );


  localStorage.setItem(
    "mojai_history",
    JSON.stringify(history)
  );
}


function renderHistory() {

  const history =
    getHistory();


  $("historyList").innerHTML =
    history.length
      ? history
          .map(renderHistoryItem)
          .join("")
      : `
        <div class="empty">
          Još nema generisanih tekstova.
        </div>
      `;
}


function renderFavorites() {

  const favorites =
    getHistory()
      .filter(
        item =>
          item.favorite
      );


  $("favoritesList").innerHTML =
    favorites.length
      ? favorites
          .map(renderHistoryItem)
          .join("")
      : `
        <div class="empty">
          Još ništa nisi sačuvao/la.
        </div>
      `;
}


function renderHistoryItem(item) {

  const date =
    new Date(
      item.createdAt
    ).toLocaleString(
      "bs-BA",
      {
        dateStyle:
          "short",

        timeStyle:
          "short"
      }
    );


  return `
    <article class="history-item">

      <div class="history-meta">

        <span>
          ${
            featureConfig[
              item.type
            ]?.icon || "✨"
          }

          ${
            escapeHtml(
              featureConfig[
                item.type
              ]?.title ||
              item.type
            )
          }
        </span>

        <span>
          ${escapeHtml(date)}
        </span>

      </div>

      <b>
        ${escapeHtml(
          item.prompt
        )}
      </b>

      <p>
        ${escapeHtml(
          item.text
        )}
      </p>

    </article>
  `;
}


// ==========================================
// COPY
// ==========================================

$("copyButton")
  ?.addEventListener(
    "click",
    async () => {

      if (!currentResult) {
        return;
      }


      try {

        await navigator
          .clipboard
          .writeText(
            currentResult.text
          );


        $("copyButton")
          .textContent =
          "✓ Kopirano";


        setTimeout(
          () => {

            $("copyButton")
              .textContent =
              "📋 Kopiraj";

          },
          1400
        );

      } catch {

        alert(
          "Nije moguće kopirati tekst."
        );
      }
    }
  );


// ==========================================
// SHARE
// ==========================================

$("shareButton")
  ?.addEventListener(
    "click",
    async () => {

      if (!currentResult) {
        return;
      }


      try {

        if (navigator.share) {

          await navigator.share({
            title:
              "MOJ AI Balkan",

            text:
              currentResult.text
          });

        } else {

          await navigator
            .clipboard
            .writeText(
              currentResult.text
            );
        }

      } catch (error) {

        console.log(
          "Share cancelled:",
          error
        );
      }
    }
  );


// ==========================================
// FAVORITES
// ==========================================

$("favoriteButton")
  ?.addEventListener(
    "click",
    () => {

      if (!currentResult) {
        return;
      }


      currentResult.favorite =
        !currentResult.favorite;


      updateItem(
        currentResult.id,
        {
          favorite:
            currentResult.favorite
        }
      );


      $("favoriteButton")
        .classList
        .toggle(
          "active",
          currentResult.favorite
        );


      $("favoriteButton")
        .textContent =
        currentResult.favorite
          ? "♥"
          : "♡";
    }
  );


// ==========================================
// PRO MODAL
// ==========================================

function openPro() {

  $("proModal")
    ?.classList
    .remove("hidden");
}


function closePro() {

  $("proModal")
    ?.classList
    .add("hidden");
}


$("proButton")
  ?.addEventListener(
    "click",
    openPro
  );


$("profileProButton")
  ?.addEventListener(
    "click",
    openPro
  );


$("closeModal")
  ?.addEventListener(
    "click",
    closePro
  );


$("proModal")
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target.id ===
        "proModal"
      ) {
        closePro();
      }
    }
  );


$("fakeCheckout")
  ?.addEventListener(
    "click",
    () => {

      alert(
        "PRO plaćanje povezujemo u sljedećem koraku."
      );
    }
  );


// ==========================================
// AUTH CHANGES
// ==========================================

if (window.sb?.auth) {

  window.sb.auth.onAuthStateChange(
    () => {

      setTimeout(
        () => {
          refreshUsage();
        },
        100
      );
    }
  );
}


// ==========================================
// INITIAL LOAD
// ==========================================

renderUsage();

setTimeout(
  () => {
    refreshUsage();
  },
  250
);


// ==========================================
// SERVICE WORKER
// ==========================================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator
        .serviceWorker
        .register("/sw.js")
        .catch(error => {

          console.error(
            "Service worker error:",
            error
          );
        });
    }
  );
}
