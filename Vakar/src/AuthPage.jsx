
import { useState } from "react";

import {
  Eye, EyeOff, ArrowRight, ArrowLeft,
  Mail, Lock, UserRound, Palette,
  Check, ShieldCheck
} from "lucide-react";

import mascot from "./assets/blazy-mascot.gif";

export default function AuthPage({
  theme,
  setTheme,
  themes,
  onLogin,
  onRegister
}) {
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
        setError("Please complete all required fields.");
        setLoading(false);
        return;
      }

      if (form.password.length < 8) {
        setError("Your password must contain at least 8 characters.");
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
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
        setError(result?.message || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess("Your account has been created!");
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
        item.email.toLowerCase() === email &&
        item.password === form.password
    );

    if (account) {
      const { password, ...safeAccount } = account;
      onLogin(safeAccount);
      setLoading(false);
      return;
    }

    // Allow the original demo profile to sign in.
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
      existingUser.email.toLowerCase() === email
    ) {
      onLogin(existingUser);
      setLoading(false);
      return;
    }

    setError("Incorrect email or password.");
    setLoading(false);
  }

  return (
    <main className="auth-page">

      {/* BACKGROUND DECORATION */}
      <div className="auth-decoration decoration-one" />
      <div className="auth-decoration decoration-two" />

      {/* TOP NAVIGATION */}
      <header className="auth-header">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <img src={mascot} alt="Vakar mascot" />
          </div>

          <span>vakar<span>.</span></span>
        </div>

        <div className="auth-header-right">

          <div className="theme-picker-container">
            <button
              className="theme-picker-trigger"
              onClick={() =>
                setShowThemePicker(!showThemePicker)
              }
              type="button"
            >
              <Palette size={17} />
              <span>Appearance</span>
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
                  CHOOSE YOUR THEME
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
            Secure space
          </span>

        </div>
      </header>

      {/* AUTH CONTENT */}
      <section className="auth-content">

        {/* LEFT SIDE */}
        <div className="auth-intro">

          <span className="auth-eyebrow">
            <span className="eyebrow-dot" />
            YOUR PERSONAL SPACE
          </span>

          <h1>
            Conversations
            <br />
            without <span>limits.</span>
          </h1>

          <p className="auth-description">
            A calmer place for your conversations.
            Connect with people, share ideas and keep
            everything in one place.
          </p>

          <div className="mascot-container">
            <div className="mascot-glow" />

            <img
              src={mascot}
              alt="Vakar mascot"
              className="auth-mascot"
            />

            <div className="mascot-label">
              <span className="mascot-status" />
              Your space. Your rules.
            </div>
          </div>

          <div className="auth-feature-list">
            <div>
              <ShieldCheck size={17} />
              Private conversations
            </div>

            <div>
              <Palette size={17} />
              Your own appearance
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="auth-card">

          <div className="auth-card-heading">
            <span className="auth-card-eyebrow">
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>

            <h2>
              {mode === "login"
                ? "Sign in"
                : "Create account"}
            </h2>

            <p>
              {mode === "login"
                ? "Enter your details to access your space."
                : "Join Vakar and create your personal space."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="auth-message auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message auth-success">
              {success}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {mode === "register" && (
              <>
                <div className="auth-field-row">

                  <label className="auth-field">
                    <span>First name</span>

                    <div className="auth-input-wrapper">
                      <UserRound size={17} />

                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={updateField}
                        placeholder="First name"
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Last name</span>

                    <div className="auth-input-wrapper">
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={updateField}
                        placeholder="Last name"
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </label>

                </div>

                <label className="auth-field">
                  <span>Username</span>

                  <div className="auth-input-wrapper">
                    <span className="username-prefix">@</span>

                    <input
                      name="username"
                      value={form.username}
                      onChange={updateField}
                      placeholder="your_username"
                      minLength={3}
                      maxLength={30}
                      required
                    />
                  </div>
                </label>
              </>
            )}

            <label className="auth-field">
              <span>Email address</span>

              <div className="auth-input-wrapper">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>

              <div className="auth-input-wrapper">
                <Lock size={17} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder="Enter your password"
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
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? <EyeOff size={17} />
                    : <Eye size={17} />}
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label className="auth-field">
                <span>Confirm password</span>

                <div className="auth-input-wrapper">
                  <Lock size={17} />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            )}

            {mode === "login" && (
              <div className="auth-form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={updateField}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError(
                      "Password recovery needs to be configured in your WebAPI."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === "register" && (
              <label className="remember-option terms-option">
                <input type="checkbox" required />
                <span>
                  I agree to the terms and privacy policy.
                </span>
              </label>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="auth-switch">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() =>
                switchMode(
                  mode === "login" ? "register" : "login"
                )
              }
            >
              {mode === "login"
                ? "Create one"
                : "Sign in"}
            </button>
          </div>

          <div className="auth-card-footer">
            <ShieldCheck size={15} />
            Your personal space starts here.
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Vakar</span>
        <span>Made for meaningful conversations.</span>
      </footer>

    </main>
  );
}
