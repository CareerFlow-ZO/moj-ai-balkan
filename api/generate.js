module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY nije podešen."
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const { type, prompt, style } = body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Nedostaje tekst korisnika."
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({
        error: "Tekst je predugačak."
      });
    }

    const instructionsByType = {
      message: `
Napiši odličnu poruku prema zahtjevu korisnika.
Poruka mora zvučati prirodno, ljudski i biti spremna za copy/paste.
Nemoj objašnjavati šta radiš.
`,

      song: `
Napiši originalan tekst pjesme prema priči korisnika.
Koristi strukturu poput [STROFA], [PRED-REFREN], [REFREN] kada odgovara.
Refren treba biti upečatljiv i lako pamtljiv.
Ne kopiraj postojeće pjesme niti poznate stihove.
`,

      cv: `
Pomozi korisniku napraviti profesionalan CV tekst, molbu za posao
ili email prijavu, zavisno od zahtjeva.
Tekst treba biti jasan, profesionalan i spreman za korištenje.
Ne izmišljaj iskustvo, diplome ili kvalifikacije koje korisnik nije naveo.
`,

      translate: `
Prevedi ili objasni tekst koji korisnik pošalje.
Koristi jednostavan jezik.
Ako se radi o službenom pismu, jasno napiši:
šta pismo znači, šta se od korisnika traži i koji su važni rokovi
ako su navedeni u tekstu.
`,

      social: `
Napravi sadržaj za TikTok, Instagram ili YouTube prema zahtjevu.
Kada ima smisla uključi jak hook, opis, CTA i relevantne hashtagove.
Tekst treba zvučati moderno i prirodno, bez spam izgleda.
`,

      love: `
Daj korisniku prirodan prijedlog poruke ili odgovora za ljubavnu situaciju.
Poštuj stil koji korisnik izabere.
Nemoj manipulirati, prijetiti ili ponižavati drugu osobu.
`
    };

    const taskInstructions =
      instructionsByType[type] ||
      "Odgovori korisno, prirodno i direktno na zahtjev korisnika.";

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",
          store: false,
          max_output_tokens: 1400,

          instructions: `
Ti si MOJ AI Balkan, digitalni AI pomoćnik za Balkan i dijasporu.

Piši prvenstveno na jeziku korisnika.
Odlično razumiješ bosanski, srpski, hrvatski, slovenski,
engleski i njemački.

Odgovori trebaju biti prirodni, korisni i bez nepotrebnog uvoda.

${taskInstructions}
`,

          input: `
Izabrani stil: ${style || "prirodan"}

Zahtjev korisnika:
${prompt}
`
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Greška prilikom AI generisanja."
      });
    }

    const text = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n")
      .trim();

    if (!text) {
      return res.status(502).json({
        error: "AI nije vratio tekst."
      });
    }

    return res.status(200).json({
      text
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Došlo je do greške. Pokušaj ponovo."
    });
  }
};
