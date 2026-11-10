import { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  UserRound,
  Palette,
  Check,
  ShieldCheck
} from "lucide-react";
import mascot from "./assets/blazy-mascot.gif";

const authTranslations = {
  en: {
    language: "Language",
    appearance: "Appearance",
    chooseTheme: "CHOOSE YOUR THEME",
    secure: "Secure space",
    personalSpace: "YOUR PERSONAL SPACE",
    conversations: "Conversations",
    with: "with",
    description:
      "Connect with people, share ideas and keep everything in one place.",
    tagline: "Your space. Your rules.",
    private: "Private conversations",
    ownAppearance: "Your own appearance",

    welcome: "WELCOME BACK",
    getStarted: "GET STARTED",
    signIn: "Sign in",
    createAccount: "Create account",

    loginDescription: "Enter your details to access your space.",
    registerDescription: "Join Vakar and create your personal space.",

    firstName: "First name",
    lastName: "Last name",
    username: "Username",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",

    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    usernamePlaceholder: "your_username",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Enter your password",
    confirmPlaceholder: "Repeat your password",

    remember: "Remember me",
    forgot: "Forgot password?",
    terms: "I agree to the terms and privacy policy.",

    wait: "Please wait...",
    createOne: "Create one",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",

    footer: "Your personal space starts here.",
    copyright: "Made for meaningful conversations.",

    showPassword: "Show password",
    hidePassword: "Hide password",

    completeFields: "Please complete all required fields.",
    usernameLength: "Username must contain at least 3 characters.",
    passwordLength: "Your password must contain at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
    registrationFailed: "Registration failed.",
    accountCreated: "Your account has been created!",
    incorrectCredentials: "Incorrect email or password.",

    accountExists: "An account with this email already exists.",
    recovery:
      "Password recovery needs to be configured in your WebAPI."
  },

  lv: {
    language: "Valoda",
    appearance: "Izskats",
    chooseTheme: "IZVĒLIETIES MOTĪVU",
    secure: "Droša vide",
    personalSpace: "JŪSU PERSONĪGĀ VIDE",
    conversations: "Sarunas",
    with: "ar",
    description:
      "Sazinieties ar cilvēkiem, dalieties idejās un glabājiet visu vienuviet.",
    tagline: "Jūsu vide. Jūsu noteikumi.",
    private: "Privātas sarunas",
    ownAppearance: "Jūsu izvēlētais izskats",

    welcome: "LAIPNI ATGRIEZIES",
    getStarted: "SĀKT",
    signIn: "Pieteikties",
    createAccount: "Izveidot kontu",

    loginDescription: "Ievadiet savus datus, lai piekļūtu savai videi.",
    registerDescription:
      "Pievienojieties Vakar un izveidojiet savu personīgo vidi.",

    firstName: "Vārds",
    lastName: "Uzvārds",
    username: "Lietotājvārds",
    email: "E-pasta adrese",
    password: "Parole",
    confirmPassword: "Apstiprināt paroli",

    firstNamePlaceholder: "Vārds",
    lastNamePlaceholder: "Uzvārds",
    usernamePlaceholder: "jūsu_lietotājvārds",
    emailPlaceholder: "jusu.epasts@example.com",
    passwordPlaceholder: "Ievadiet paroli",
    confirmPlaceholder: "Atkārtojiet paroli",

    remember: "Atcerēties mani",
    forgot: "Aizmirsāt paroli?",
    terms: "Es piekrītu lietošanas noteikumiem un privātuma politikai.",

    wait: "Lūdzu, uzgaidiet...",
    createOne: "Izveidot kontu",
    noAccount: "Nav konta?",
    hasAccount: "Jau ir konts?",

    footer: "Jūsu personīgā vide sākas šeit.",
    copyright: "Radīts jēgpilnām sarunām.",

    showPassword: "Parādīt paroli",
    hidePassword: "Paslēpt paroli",

    completeFields: "Lūdzu, aizpildiet visus obligātos laukus.",
    usernameLength: "Lietotājvārdam jāsatur vismaz 3 rakstzīmes.",
    passwordLength: "Parolei jāsatur vismaz 8 rakstzīmes.",
    passwordMismatch: "Paroles nesakrīt.",
    registrationFailed: "Reģistrācija neizdevās.",
    accountCreated: "Jūsu konts ir izveidots!",
    incorrectCredentials: "Nepareizs e-pasts vai parole.",

    accountExists: "Konts ar šo e-pasta adresi jau eksistē.",
    recovery:
      "Paroles atkopšana jākonfigurē jūsu WebAPI."
  }
};

export default function AuthPage({
  theme,
  setTheme,
  themes,
  language,
  setLanguage,
  onLogin,
  onRegister
}) {
  const t = key =>
    authTranslations[language]?.[key] ||
    authTranslations.en[key] ||
    key;

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: true
  });

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setForm(current => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setShowPassword(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const email = form.email.trim().toLowerCase();

    if (mode === "register") {
      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.username.trim()
      ) {
        setError(t("completeFields"));
        setLoading(false);
        return;
      }

      if (form.username.trim().replace(/^@/, "").length < 3) {
        setError(t("usernameLength"));
        setLoading(false);
        return;
      }

      if (form.password.length < 8) {
        setError(t("passwordLength"));
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError(t("passwordMismatch"));
        setLoading(false);
        return;
      }

      const result = onRegister({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim().replace(/^@/, ""),
        email,
        password: form.password
      });

      if (!result?.success) {
        setError(
          result?.message === "An account with this email already exists."
            ? t("accountExists")
            : result?.message || t("registrationFailed")
        );

        setLoading(false);
        return;
      }

      setSuccess(t("accountCreated"));
      setLoading(false);
      return;
    }

    const accounts = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("blaze-accounts") || "[]"
        );
      } catch {
        return [];
      }
    })();

    const account = accounts.find(
      item =>
        item.email?.toLowerCase() === email &&
        item.password === form.password
    );

    if (account) {
      const { password, ...safeAccount } = account;
      onLogin(safeAccount);
      setLoading(false);
      return;
    }

    const existingUser = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("blaze-user") || "null"
        );
      } catch {
        return null;
      }
    })();

    if (
      existingUser &&
      existingUser.email?.toLowerCase() === email
    ) {
      onLogin(existingUser);
      setLoading(false);
      return;
    }

    setError(t("incorrectCredentials"));
    setLoading(false);
  }

  return (
    <main className="auth-page">

      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />

      {/* GALVENE */}
      <header className="auth-header">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <img src={mascot} alt="Vakar mascot" />
          </div>

          <span>
            vakar<span>.</span>
          </span>
        </div>

        <div className="auth-header-right">

          {/* VALODAS IZVĒLE */}
          <div className="language-picker">
            <select
              value={language}
              onChange={event => setLanguage(event.target.value)}
              aria-label={t("language")}
            >
              <option value="en">🇬🇧 English</option>
              <option value="lv">🇱🇻 Latviešu</option>
            </select>
          </div>

          {/* KRĀSU TĒMAS IZVĒLE */}
          <div className="theme-picker-container">

            <button
              className="theme-picker-trigger"
              onClick={() =>
                setShowThemePicker(current => !current)
              }
              type="button"
              aria-expanded={showThemePicker}
            >
              <Palette size={17} />
              <span>{t("appearance")}</span>

              <span
                className="current-theme-dot"
                style={{
                  background:
                    themes.find(item => item.id === theme)?.color
                }}
              />
            </button>

            {showThemePicker && (
              <div className="theme-picker-menu">

                <div className="theme-picker-heading">
                  {t("chooseTheme")}
                </div>

                {themes.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      theme === item.id
                        ? "theme-option selected"
                        : "theme-option"
                    }
                    onClick={() => {
                      setTheme(item.id);
                      setShowThemePicker(false);
                    }}
                  >
                    <span
                      className="theme-option-color"
                      style={{ background: item.color }}
                    />

                    <span>{item.name}</span>

                    {theme === item.id && (
                      <Check size={15} />
                    )}
                  </button>
                ))}

              </div>
            )}
          </div>

          <span className="header-divider" />

          <span className="header-secure">
            <ShieldCheck size={16} />
            {t("secure")}
          </span>

        </div>
      </header>

      {/* PAMATSATURS */}
      <section className="auth-content">

        {/* IEVADS */}
        <div className="auth-intro">

          <span className="auth-eyebrow">
            <span className="eyebrow-dot" />
            {t("personalSpace")}
          </span>

          <h1>
            {t("conversations")}
            <br />
            {t("with")} <span>Vakar.</span>
          </h1>

          <p className="auth-description">
            {t("description")}
          </p>

          <div className="mascot-container">

            <img
              src={mascot}
              alt="Vakar mascot"
              className="auth-mascot"
            />

            <div className="mascot-label">
              <span className="mascot-status" />
              {t("tagline")}
            </div>

          </div>

          <div className="auth-feature-list">

            <div>
              <ShieldCheck size={17} />
              {t("private")}
            </div>

            <div>
              <Palette size={17} />
              {t("ownAppearance")}
            </div>

          </div>

        </div>

        {/* AUTENTIFIKĀCIJAS PANELIS */}
        <div className="auth-card">

          <div className="auth-card-heading">

            <span className="auth-card-eyebrow">
              {mode === "login"
                ? t("welcome")
                : t("getStarted")}
            </span>

            <h2>
              {mode === "login"
                ? t("signIn")
                : t("createAccount")}
            </h2>

            <p>
              {mode === "login"
                ? t("loginDescription")
                : t("registerDescription")}
            </p>

          </div>

          {/* AUTENTIFIKĀCIJAS CILNES */}
          <div className="auth-tabs">

            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              {t("signIn")}
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              {t("createAccount")}
            </button>

          </div>

          {/* KĻŪDA */}
          {error && (
            <div
              className="auth-message auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* VEIKSMĪGAS DARBĪBAS PAZIŅOJUMS */}
          {success && (
            <div
              className="auth-message auth-success"
              role="status"
            >
              {success}
            </div>
          )}

          {/* VEIDLAPA */}
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* REĢISTRĀCIJAS LAUKI */}
            {mode === "register" && (
              <>
                <div className="auth-field-row">

                  <label className="auth-field">
                    <span>{t("firstName")}</span>

                    <div className="auth-input-wrapper">
                      <UserRound size={17} />

                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={updateField}
                        placeholder={t("firstNamePlaceholder")}
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>{t("lastName")}</span>

                    <div className="auth-input-wrapper">
                      <UserRound size={17} />

                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={updateField}
                        placeholder={t("lastNamePlaceholder")}
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </label>

                </div>

                <label className="auth-field">
                  <span>{t("username")}</span>

                  <div className="auth-input-wrapper">
                    <span className="username-prefix">@</span>

                    <input
                      name="username"
                      value={form.username}
                      onChange={updateField}
                      placeholder={t("usernamePlaceholder")}
                      minLength={3}
                      maxLength={30}
                      autoComplete="username"
                      required
                    />
                  </div>
                </label>

              </>
            )}

            {/* E-PASTS */}
            <label className="auth-field">
              <span>{t("email")}</span>

              <div className="auth-input-wrapper">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {/* PAROLE */}
            <label className="auth-field">
              <span>{t("password")}</span>

              <div className="auth-input-wrapper">
                <Lock size={17} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(current => !current)
                  }
                  aria-label={
                    showPassword
                      ? t("hidePassword")
                      : t("showPassword")
                  }
                >
                  {showPassword
                    ? <EyeOff size={17} />
                    : <Eye size={17} />}
                </button>

              </div>
            </label>

            {/* PAROLES APSTIPRINĀŠANA */}
            {mode === "register" && (
              <label className="auth-field">
                <span>{t("confirmPassword")}</span>

                <div className="auth-input-wrapper">
                  <Lock size={17} />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder={t("confirmPlaceholder")}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            )}

            {/* PIETEIKŠANĀS IESPĒJAS */}
            {mode === "login" && (
              <div className="auth-form-options">

                <label className="remember-option">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={updateField}
                  />

                  <span>{t("remember")}</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError(t("recovery"))
                  }
                >
                  {t("forgot")}
                </button>

              </div>
            )}

            {/* REĢISTRĀCIJAS NOTEIKUMI */}
            {mode === "register" && (
              <label className="remember-option terms-option">
                <input type="checkbox" required />

                <span>{t("terms")}</span>
              </label>
            )}

            {/* IESNIEGŠANA */}
            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? t("wait")
                : mode === "login"
                  ? t("signIn")
                  : t("createAccount")}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* REŽĪMA MAIŅA */}
          <div className="auth-switch">

            {mode === "login"
              ? t("noAccount")
              : t("hasAccount")}

            <button
              type="button"
              onClick={() =>
                switchMode(
                  mode === "login" ? "register" : "login"
                )
              }
            >
              {mode === "login"
                ? t("createOne")
                : t("signIn")}
            </button>

          </div>

          {/* PANEĻA KĀJENE */}
          <div className="auth-card-footer">
            <ShieldCheck size={15} />
            {t("footer")}
          </div>

        </div>
      </section>

      {/* LAPAS KĀJENE */}
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Vakar</span>
        <span>{t("copyright")}</span>
      </footer>

    </main>
  );
}
