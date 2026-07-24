import type { Dict } from "./index";

export const de: Dict = {
  common: {
    brand: "TRUSTLINE",
    brandLight: "Financial Group",
    signIn: "Anmelden",
    signOut: "Abmelden",
    openAccount: "Konto eröffnen",
    chooseFile: "Datei auswählen",
    noFileChosen: "Keine Datei ausgewählt",
    language: "Sprache",
  },
  nav: {
    personal: "Privatkunden",
    commercial: "Firmenkunden",
    why: "Warum Trustline",
    contact: "Kontakt",
  },
  landing: {
    badge: "Privatkunden-Banking",
    heroTitle1: "Ihr Geld,",
    heroTitle2: "in guten Händen.",
    heroBody:
      "Konten, Kredite und Kreditlinien von einem Team, das jeden Antrag persönlich prüft. Modernes Banking, ohne den menschlichen Kontakt zu verlieren.",
    personal: {
      kicker: "Privatkunden-Banking",
      title: "Banking, das zu Ihrem Leben passt.",
      body: "Von alltäglichen Ausgaben bis zum Traumhaus — eine Beziehung, jeder Meilenstein.",
      items: [
        { title: "Kreditkarte", body: "Kaufkraft für den Alltag mit klaren Konditionen und persönlich geprüften Limits." },
        { title: "Sparkonto", body: "Lassen Sie Ihr Geld stetig wachsen — mit voller Transparenz und wöchentlichen Auszügen." },
        { title: "Privatkredite", body: "Feste Tilgungspläne und transparente Konditionen, entschieden von einem Menschen." },
        { title: "Baufinanzierung", body: "Finanzierung für das Zuhause, das zu Ihrem Leben passt — Schritt für Schritt begleitet." },
        { title: "Private Versicherung", body: "Schutz für das Wichtigste, organisiert von Menschen, die Sie anrufen können." },
      ],
    },
    commercial: {
      kicker: "Firmenkunden-Banking",
      title: "Banking, das so hart arbeitet wie Ihr Unternehmen.",
      body: "Werkzeuge für Liquidität, Wachstum und das Tagesgeschäft — mit einem Team, das Ihre Firma beim Namen kennt.",
      items: [
        { title: "Firmenkreditkarten", body: "Geschäftsausgaben sauber getrennt, mit verlässlichen Kontrollen." },
        { title: "Einlagen", body: "Sichere Geschäftseinlagen — jede Transaktion geprüft und quittiert." },
        { title: "Auslandsschecks", body: "Bezahlen Sie internationale Partner zuverlässig in ihrer Währung." },
        { title: "Verzinstes Girokonto", body: "Ein Arbeitskonto, das Erträge bringt, während Ihr Geld arbeitet." },
        { title: "Telefon-Banking", body: "Bankgeschäfte am Telefon mit einem echten Menschen, wann immer Sie nicht vorbeikommen können." },
        { title: "Geldmarktkonto", body: "Höher verzinste Reserven, die für Ihr Unternehmen griffbereit bleiben." },
        { title: "Kleinunternehmen", body: "Persönliche Betreuung und Kredite für die Unternehmen, die unsere Gemeinde tragen." },
      ],
    },
    getStarted: "Jetzt starten",
    whyKicker: "Warum Trustline",
    whyTitle: "Eine Bank, die Ihren Namen kennt.",
    pillars: [
      {
        title: "Menschliche Prüfung, jedes Mal",
        body: "Jeder Antrag, jede Einzahlung und jede Anfrage wird von unserem Team geprüft. Entscheidungen, zu denen Sie uns anrufen und nachfragen können.",
      },
      {
        title: "Sicherheit auf Bankniveau",
        body: "Ende-zu-Ende verschlüsselt, mit Identitätsprüfung bei der Registrierung und einem dauerhaften Prüfprotokoll jeder Aktion.",
      },
      {
        title: "Antworten von echten Menschen",
        body: "Erreichen Sie unser Team direkt unter support@trustlinefinancialgroup.com — jede Nachricht wird von einem Menschen gelesen und beantwortet.",
      },
    ],
    ctaTitle1: "Eröffnen Sie Ihr Konto in wenigen Minuten.",
    ctaTitle2: "Genehmigt von einem Menschen, nicht von einem Bot.",
    footerTagline:
      "Privatkunden-Banking, Kredite und Kreditlinien — auf Vertrauen gebaut, ganz in Ihrer Nähe.",
    footerContact: "Kontakt",
    footerClients: "Kunden",
    footerRights: "Alle Rechte vorbehalten.",
  },
  auth: {
    signupTitle: "Eröffnen Sie Ihr Konto",
    signupSubtitle:
      "Erzählen Sie uns etwas über sich — die Identitätsprüfung folgt direkt danach.",
    signupPanelTitle1: "Banking, das mit einem",
    signupPanelTitle2: "Gespräch beginnt.",
    signupPanelBody:
      "Jeder Antrag wird von unserem Team persönlich geprüft — in der Regel innerhalb eines Werktags.",
    accountTypeLabel: "Kontotyp",
    typePersonal: "Privat",
    typeCommercial: "Geschäftlich",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail-Adresse",
    phone: "Telefonnummer",
    password: "Passwort",
    passwordHint: "Mindestens 10 Zeichen, mit einem Buchstaben und einer Zahl.",
    submit: "Konto erstellen",
    submitting: "Konto wird erstellt…",
    alreadyClient: "Bereits Kunde?",
    loginTitle: "Anmelden",
    loginSubtitle: "Geben Sie Ihre E-Mail und Ihr Passwort ein, um auf Ihr Konto zuzugreifen.",
    loginPanelTitle: "Willkommen zurück.",
    loginPanelBody: "Ihre Konten, Anträge und Auszüge — alles an einem Ort.",
    signingIn: "Anmeldung…",
    newTo: "Neu bei Trustline?",
  },
  onboarding: {
    steps: ["E-Mail bestätigen", "Identität", "Prüfung"],
    verifyTitle: "Bestätigen Sie Ihre E-Mail-Adresse",
    verifyBody:
      "Wir haben einen Bestätigungslink an {email} gesendet. Klicken Sie darauf und kehren Sie hierher zurück — diese Seite geht dann zum nächsten Schritt über.",
    verifyChecked: "Bestätigt — aktualisieren",
    resend: "E-Mail erneut senden",
    resent: "Eine neue Bestätigungs-E-Mail ist unterwegs.",
    resendWait: "Bitte warten Sie eine Minute, bevor Sie eine weitere E-Mail anfordern.",
    kycTitle: "Verifizieren Sie Ihre Identität",
    kycBody:
      "Laden Sie ein amtliches Dokument hoch. Unser Team prüft es persönlich — es wird niemals weitergegeben.",
    docTypeLabel: "Dokumenttyp",
    docTypes: {
      GOVERNMENT_ID: "Personalausweis",
      DRIVERS_LICENSE: "Führerschein",
      PASSPORT: "Reisepass",
    },
    uploadLabel: "Foto oder Scan des Dokuments",
    uploadHint: "JPG, PNG oder PDF — bis zu 8 MB. Wird nur zur Identitätsprüfung verwendet.",
    submitKyc: "Zur Prüfung einreichen",
    submittingKyc: "Wird hochgeladen…",
    reviewTitle: "Ihr Antrag wird geprüft",
    reviewBody:
      "Danke, {name}. Unser Team prüft Ihre Angaben und Ihr Dokument — das dauert in der Regel weniger als einen Werktag. Wir schreiben Ihnen an {email}, sobald Ihr Konto freigegeben ist.",
  },
  verifyPage: {
    successTitle: "E-Mail bestätigt",
    successBody:
      "Danke — Ihre E-Mail-Adresse ist bestätigt. Fahren Sie mit dem nächsten Schritt fort, um Ihre Identität zu verifizieren.",
    alreadyTitle: "E-Mail bereits bestätigt",
    alreadyBody: "Ihre E-Mail-Adresse war bereits bestätigt. Alles erledigt.",
    expiredTitle: "Link abgelaufen",
    expiredBody:
      "Dieser Bestätigungslink ist abgelaufen. Melden Sie sich an und fordern Sie im Bestätigungsschritt einen neuen an.",
    invalidTitle: "Ungültiger Bestätigungslink",
    invalidBody:
      "Dieser Link fehlt oder ist fehlerhaft. Bitte verwenden Sie den Button aus Ihrer Willkommens-E-Mail.",
    continue: "Weiter",
  },
  dashboard: {
    welcome: "Willkommen, {name}",
    subtitle:
      "Ihr Konto ist aktiv. Salden, Einzahlungen und Anträge folgen in der nächsten Phase.",
    balance: "Kontostand",
    loans: "Kredite",
    credit: "Kreditlinie",
    phase2: "Verfügbar in Phase 2",
    phase3: "Verfügbar in Phase 3",
  },
  bank: {
    availableBalance: "Verfügbarer Saldo",
    accountNo: "Konto",
    pendingNote: "{amount} an Einzahlungen warten auf Verifizierung",
    makeDeposit: "Einzahlung vornehmen",
    recent: "Letzte Aktivität",
    none: "Noch keine Umsätze. Ihre erste Einzahlung erscheint hier.",
    types: {
      DEPOSIT: "Einzahlung",
      WITHDRAWAL: "Auszahlung",
      ADJUSTMENT: "Korrektur",
    },
    statuses: {
      PENDING: "Wird geprüft",
      POSTED: "Abgeschlossen",
      REJECTED: "Abgelehnt",
    },
    loansCard: "Kredite",
    creditCard: "Kreditlinie",
    comingSoon: "Bald verfügbar",
    reference: "Referenz",
    depositTitle: "Einzahlung vornehmen",
    depositBody:
      "Geben Sie den eingezahlten Betrag an und fügen Sie einen Nachweis bei (Überweisungsbestätigung oder Beleg). Unser Team prüft ihn und schreibt Ihren Saldo gut — Sie erhalten eine Quittung per E-Mail.",
    amount: "Betrag (USD)",
    note: "Notiz (optional)",
    proof: "Einzahlungsnachweis (optional)",
    proofHint:
      "Optional — unser Team prüft in der Regel ohne Nachweis und schreibt Ihnen, falls einer benötigt wird. JPG, PNG oder PDF, bis zu 8 MB.",
    submitDeposit: "Einzahlung einreichen",
    submittingDeposit: "Wird gesendet…",
    submittedBanner:
      "Einzahlung eingereicht — wir schreiben Ihnen, sobald sie geprüft und gutgeschrieben ist.",
    back: "Zurück zum Dashboard",
    amountInvalid: "Geben Sie einen gültigen Betrag zwischen 0,01 $ und 1.000.000 $ ein.",
  },
  errors: {
    emailExists: "Mit dieser E-Mail existiert bereits ein Konto. Versuchen Sie, sich anzumelden.",
    invalidCreds: "E-Mail oder Passwort falsch.",
    blocked:
      "Dieses Konto ist derzeit eingeschränkt. Bitte kontaktieren Sie support@trustlinefinancialgroup.com.",
    rejected:
      "Dieser Antrag wurde nicht genehmigt. Kontaktieren Sie support@trustlinefinancialgroup.com für Einzelheiten.",
    needFile: "Bitte laden Sie Ihr Dokument hoch.",
    fileTooBig: "Das Dokument muss kleiner als 8 MB sein.",
    fileType: "Das Dokument muss eine JPG-, PNG-, WEBP- oder PDF-Datei sein.",
    firstNameRequired: "Vorname ist erforderlich",
    lastNameRequired: "Nachname ist erforderlich",
    emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein",
    phoneInvalid: "Geben Sie eine gültige Telefonnummer ein",
    passwordWeak:
      "Das Passwort muss mindestens 10 Zeichen lang sein, mit einem Buchstaben und einer Zahl",
    generic: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
};
