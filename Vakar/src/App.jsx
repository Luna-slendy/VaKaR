import { useEffect, useRef, useState } from "react";
import {
  Search, Plus, MoreHorizontal, Paperclip, Smile, Send,
  ImagePlus, LogOut, UserRound, CheckCheck,
  ArrowLeft, X, Camera, ShieldCheck,
  Palette, ChevronDown
} from "lucide-react";
import AuthPage from "./AuthPage.jsx";
import mascot from "./assets/blazy-mascot.gif";
import { connectChatSocket } from "./services/socket.js";

const THEMES = [
  { id: "light", name: "Light", color: "#FFFFFF" },
  { id: "dark", name: "Midnight", color: "#12355B" },
  { id: "violet", name: "Violet", color: "#420039" },
  { id: "blaze", name: "Blaze", color: "#FF570A" },
  { id: "crimson", name: "Crimson", color: "#D72638" }
];

const translations = {
  en: {
    language: "Language",
    appearance: "Appearance",
    newChat: "New conversation",
    messages: "MESSAGES",
    search: "Search conversations",
    noConversations: "No conversations found.",
    private: "Private",
    secured: "Secured and encrypted",
    editProfile: "Edit profile",
    signOut: "Sign out",
    active: "Active now",
    lastSeen: "Last seen recently",
    today: "TODAY",
    firstName: "First name",
    lastName: "Last name",
    username: "Username",
    email: "Email address",
    cancel: "Cancel",
    save: "Save changes",
    changePicture: "Change picture",
    profilePicture: "Your profile picture",
    pictureFormats: "JPG, PNG or GIF · up to 4 MB",
    close: "Close",
    send: "Send message",
    message: "Message",
    demoMode: "Demo mode",
    connected: "Connected",
    welcome: "Welcome back!",
    signedOut: "You have signed out.",
    profileSaved: "Profile saved.",
    pictureUpdated: "Profile picture updated.",
    invalidImage: "Please choose an image file.",
    largeImage: "Choose an image smaller than 4 MB.",
    newChatError: "Connect the WebAPI to start a new conversation.",
    chatSearchError: "Chat search can be connected to the WebAPI.",
    optionsPlaceholder: "Conversation options placeholder.",
    uploadError: "File uploads can be added through the WebAPI.",
    imageError: "Image sharing can be added through the WebAPI.",
    accountTitle: "YOUR ACCOUNT",
    securityNote: "Password and email security changes belong in the authenticated WebAPI.",
    moreOptions: "More options",
    clearSearch: "Clear search",
    back: "Back to conversations",
    searchChat: "Search chat",
    chatOptions: "More chat options",
    attach: "Attach file",
    addImage: "Add image",
    emoji: "Emoji",
    pressEnter: "Press",
    toSend: "to send",
    yesterday: "Yesterday",
    messagePlaceholder: "Message",
    welcomeBack: "Welcome back!",
    accountExists: "An account with this email already exists.",
    registrationFailed: "Registration failed.",
    nameRequired: "Please complete all required fields.",
    avatarAlt: "profile",
    cancel: "Cancel"
  },

  lv: {
    language: "Valoda",
    appearance: "Izskats",
    newChat: "Jauna saruna",
    messages: "ZIŅOJUMI",
    search: "Meklēt sarunas",
    noConversations: "Sarunas nav atrastas.",
    private: "Privāti",
    secured: "Aizsargāts un šifrēts",
    editProfile: "Rediģēt profilu",
    signOut: "Izrakstīties",
    active: "Aktīvs/-a tagad",
    lastSeen: "Pēdējo reizi redzēts/-a nesen",
    today: "ŠODIEN",
    firstName: "Vārds",
    lastName: "Uzvārds",
    username: "Lietotājvārds",
    email: "E-pasta adrese",
    cancel: "Atcelt",
    save: "Saglabāt izmaiņas",
    changePicture: "Mainīt attēlu",
    profilePicture: "Jūsu profila attēls",
    pictureFormats: "JPG, PNG vai GIF · līdz 4 MB",
    close: "Aizvērt",
    send: "Nosūtīt ziņojumu",
    message: "Ziņojums",
    demoMode: "Demonstrācijas režīms",
    connected: "Savienots",
    welcome: "Prieks tevi atkal redzēt!",
    signedOut: "Jūs esat izrakstījies/-usies.",
    profileSaved: "Profils ir saglabāts.",
    pictureUpdated: "Profila attēls ir atjaunināts.",
    invalidImage: "Lūdzu, izvēlieties attēla failu.",
    largeImage: "Izvēlieties attēlu, kas ir mazāks par 4 MB.",
    newChatError: "Pievienojiet WebAPI, lai sāktu jaunu sarunu.",
    chatSearchError: "Sarunas meklēšanu var pieslēgt WebAPI.",
    optionsPlaceholder: "Sarunas opciju vietturis.",
    uploadError: "Failu augšupielādi var pievienot, izmantojot WebAPI.",
    imageError: "Attēlu kopīgošanu var pievienot, izmantojot WebAPI.",
    accountTitle: "JŪSU KONTS",
    securityNote: "Paroles un e-pasta drošības izmaiņas jāveic autentificētajā WebAPI.",
    moreOptions: "Papildu opcijas",
    clearSearch: "Notīrīt meklēšanu",
    back: "Atpakaļ uz sarunām",
    searchChat: "Meklēt sarunā",
    chatOptions: "Citas sarunas opcijas",
    attach: "Pievienot failu",
    addImage: "Pievienot attēlu",
    emoji: "Emocijzīmes",
    pressEnter: "Nospiediet",
    toSend: "lai nosūtītu",
    yesterday: "Vakar",
    messagePlaceholder: "Ziņojums",
    welcomeBack: "Prieks tevi atkal redzēt!",
    accountExists: "Konts ar šo e-pasta adresi jau eksistē.",
    registrationFailed: "Reģistrācija neizdevās.",
    nameRequired: "Lūdzu, aizpildiet visus obligātos laukus.",
    avatarAlt: "profils"
  }
};

const initialContacts = [
  {
    id: 1,
    name: "Mika Ozola",
    username: "@mika",
    avatar: "",
    color: "orange",
    last: "Did you see the new design?",
    time: "10:42",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "Alex Kalniņš",
    username: "@alexk",
    avatar: "",
    color: "violet",
    last: "Perfect, thank you!",
    time: "09:18",
    unread: 0,
    online: true
  },
  {
    id: 3,
    name: "Sam Rivera",
    username: "@samr",
    avatar: "",
    color: "crimson",
    last: "I'll send it over later.",
    time: "Yesterday",
    unread: 0,
    online: false
  },
  {
    id: 4,
    name: "Nora Liepa",
    username: "@nora",
    avatar: "",
    color: "navy",
    last: "That sounds great ✨",
    time: "Yesterday",
    unread: 0,
    online: false
  }
];

const initialMessages = {
  1: [
    {
      id: 1,
      from: "them",
      text: "Hey! How is the new project coming along?",
      time: "10:38"
    },
    {
      id: 2,
      from: "me",
      text: "Pretty well! I'm putting the final touches on the chat UI.",
      time: "10:40"
    },
    {
      id: 3,
      from: "them",
      text: "Did you see the new design?",
      time: "10:42"
    }
  ],
  2: [
    {
      id: 1,
      from: "them",
      text: "Perfect, thank you!",
      time: "09:18"
    }
  ],
  3: [
    {
      id: 1,
      from: "them",
      text: "I'll send it over later.",
      time: "Yesterday"
    }
  ],
  4: [
    {
      id: 1,
      from: "them",
      text: "That sounds great ✨",
      time: "Yesterday"
    }
  ]
};

const defaultProfile = {
  firstName: "guest",
  lastName: "guest junior",
  username: "guest",
  email: "guest@gmail.com",
  avatar: ""
};

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase() || "U";
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function Avatar({
  name,
  src,
  size = "md",
  online = false,
  color = "navy"
}) {
  return (
    <span className={`avatar avatar-${size} avatar-${color}`}>
      {src ? (
        <img src={src} alt={`${name} profile`} />
      ) : (
        <span>{initials(name)}</span>
      )}

      {online && <i className="online-dot" />}
    </span>
  );
}

function App() {
  // Language
  const [language, setLanguage] = useState(
    () => localStorage.getItem("blaze-language") || "en"
  );

  const t = key => translations[language]?.[key] || translations.en[key] || key;

  useEffect(() => {
    localStorage.setItem("blaze-language", language);
    document.documentElement.lang = language;
  }, [language]);

  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("blaze-auth") === "true"
  );

  const [authUser, setAuthUser] = useState(
    () => readStorage("blaze-user", null)
  );

  // Theme
  const [theme, setTheme] = useState(
    () => localStorage.getItem("blaze-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("blaze-theme", theme);
  }, [theme]);

  // Profile
  const [profile, setProfile] = useState(() => {
    const saved = readStorage("blaze-profile", null);

    return {
      ...defaultProfile,
      ...(saved || {}),
      ...(authUser || {})
    };
  });

  // Chat
  const [contacts] = useState(initialContacts);
  const [activeId, setActiveId] = useState(1);

  const [messages, setMessages] = useState(
    () => readStorage("blaze-messages", initialMessages)
  );

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  // Interface
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);

  const [socketStatus, setSocketStatus] = useState("demo");
  const [toast, setToast] = useState("");

  const fileInput = useRef(null);

  const activeContact =
    contacts.find(contact => contact.id === activeId) || contacts[0];

  const activeMessages = messages[activeId] || [];

  useEffect(() => {
    localStorage.setItem("blaze-profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("blaze-messages", JSON.stringify(messages));
  }, [messages]);


  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectChatSocket({
      onStatus: setSocketStatus,

      onMessage: incoming => {
        if (incoming?.conversationId && incoming?.text) {
          setMessages(old => ({
            ...old,
            [incoming.conversationId]: [
              ...(old[incoming.conversationId] || []),
              {
                id: Date.now(),
                from: "them",
                text: incoming.text,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }
            ]
          }));
        }
      }
    });

    return () => socket?.close();
  }, [isAuthenticated]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }


  function handleLogin(user) {
    const normalizedUser = {
      ...defaultProfile,
      ...user
    };

    setAuthUser(normalizedUser);
    setProfile(normalizedUser);
    setIsAuthenticated(true);

    localStorage.setItem("blaze-auth", "true");
    localStorage.setItem(
      "blaze-user",
      JSON.stringify(normalizedUser)
    );

    notify(t("welcome"));
  }

  function handleRegister(user) {
    const accounts = readStorage("blaze-accounts", []);

    const exists = accounts.some(
      account =>
        account.email.toLowerCase() === user.email.toLowerCase()
    );

    if (exists) {
      return {
        success: false,
        message: t("accountExists")
      };
    }

    const account = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: ""
    };

    localStorage.setItem(
      "blaze-accounts",
      JSON.stringify([...accounts, account])
    );

    handleLogin(account);

    return { success: true };
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setAuthUser(null);

    localStorage.removeItem("blaze-auth");
    localStorage.removeItem("blaze-user");

    setProfileOpen(false);
    setEditOpen(false);
    setMobileChat(false);

    notify(t("signedOut"));
  }

  // Avatar upload
  function chooseAvatar(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify(t("invalidImage"));
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      notify(t("largeImage"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfile(current => ({
        ...current,
        avatar: String(reader.result)
      }));

      notify(t("pictureUpdated"));
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  // Send message
  function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text) return;

    const message = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages(old => ({
      ...old,
      [activeId]: [...(old[activeId] || []), message]
    }));

    setDraft("");
  }

  // Save profile
  function saveProfile(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const updated = {
      ...profile,
      firstName: String(data.get("firstName") || "").trim(),
      lastName: String(data.get("lastName") || "").trim(),
      username: String(data.get("username") || "").trim(),
      email: String(data.get("email") || "").trim()
    };

    setProfile(updated);
    setAuthUser(updated);

    localStorage.setItem("blaze-user", JSON.stringify(updated));

    setEditOpen(false);
    notify(t("profileSaved"));
  }

  const filteredContacts = contacts.filter(contact =>
    `${contact.name} ${contact.username} ${contact.last}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <AuthPage
        theme={theme}
        setTheme={setTheme}
        themes={THEMES}
        language={language}
        setLanguage={setLanguage}
        t={t}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <main className="app-shell">

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          mobileChat ? "sidebar-hidden-mobile" : ""
        }`}
      >

        <div className="brand-row">
          <div className="brand-mark">
            <img src={mascot} alt="Vakar mascot" />
          </div>

          <span className="brand-name">
            vakar<span>.</span>
          </span>

          <button
            className="icon-button sidebar-more"
            aria-label={t("moreOptions")}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <MoreHorizontal />
          </button>
        </div>

        <button
          className="new-chat-button"
          onClick={() => notify(t("newChatError"))}
        >
          <Plus size={18} />
          {t("newChat")}
          <span>⌘ K</span>
        </button>

        <div className="section-label">
          {t("messages")} <span>{contacts.length}</span>
        </div>

        <label className="search-box">
          <Search size={17} />

          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t("search")}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={t("clearSearch")}
            >
              <X size={14} />
            </button>
          )}
        </label>

        <div className="contact-list">
          {filteredContacts.map(contact => (
            <button
              key={contact.id}
              className={`contact ${
                activeId === contact.id ? "contact-active" : ""
              }`}
              onClick={() => {
                setActiveId(contact.id);
                setMobileChat(true);
              }}
            >
              <Avatar
                name={contact.name}
                color={contact.color}
                online={contact.online}
              />

              <span className="contact-copy">
                <span className="contact-top">
                  <strong>{contact.name}</strong>
                  <time>
                    {contact.time === "Yesterday"
                      ? t("yesterday")
                      : contact.time}
                  </time>
                </span>

                <span className="contact-bottom">
                  <span>{contact.last}</span>

                  {contact.unread > 0 && (
                    <b>{contact.unread}</b>
                  )}
                </span>
              </span>
            </button>
          ))}

          {filteredContacts.length === 0 && (
            <p className="empty-search">
              {t("noConversations")}
            </p>
          )}
        </div>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

          <div className="workspace-card">
            <div className="workspace-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <strong>{t("private")}</strong>
              <span>{t("secured")}</span>
            </div>

            <span className="workspace-status" />
          </div>

          <button
            className="profile-card"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <Avatar
              name={`${profile.firstName} ${profile.lastName}`}
              src={profile.avatar}
              size="sm"
              color="orange"
            />

            <span className="profile-card-copy">
              <strong>
                {profile.firstName} {profile.lastName}
              </strong>

              <span>@{profile.username}</span>
            </span>

            <MoreHorizontal size={19} />
          </button>

          {profileOpen && (
            <div className="profile-popover">

              {/* LANGUAGE */}
              <div className="language-picker" style={{ padding: "8px 12px" }}>
                <label
                  htmlFor="app-language"
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    opacity: 0.7,
                    marginBottom: 6
                  }}
                >
                  {t("language")}
                </label>

                <select
                  id="app-language"
                  value={language}
                  onChange={event => setLanguage(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px",
                    borderRadius: 8
                  }}
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="lv">🇱🇻 Latviešu</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setEditOpen(true);
                  setProfileOpen(false);
                }}
              >
                <UserRound size={16} />
                {t("editProfile")}
              </button>

              <button onClick={() => setThemeOpen(!themeOpen)}>
                <Palette size={16} />
                {t("appearance")}
                <ChevronDown size={14} />
              </button>

              {themeOpen && (
                <div className="popover-themes">
                  {THEMES.map(item => (
                    <button
                      key={item.id}
                      className={
                        theme === item.id ? "theme-active" : ""
                      }
                      onClick={() => {
                        setTheme(item.id);
                        setThemeOpen(false);
                      }}
                    >
                      <span
                        className="theme-dot"
                        style={{ background: item.color }}
                      />
                      {item.name}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={handleLogout}>
                <LogOut size={16} />
                {t("signOut")}
              </button>

            </div>
          )}
        </div>
      </aside>

      {/* CHAT PANEL */}
      <section
        className={`chat-panel ${
          !mobileChat ? "chat-hidden-mobile" : ""
        }`}
      >

        <header className="chat-header">

          <button
            className="icon-button mobile-back"
            aria-label={t("back")}
            onClick={() => setMobileChat(false)}
          >
            <ArrowLeft />
          </button>

          <Avatar
            name={activeContact.name}
            color={activeContact.color}
            online={activeContact.online}
          />

          <div className="chat-person">
            <strong>{activeContact.name}</strong>

            <span>
              <i
                className={
                  activeContact.online ? "status-online" : ""
                }
              />

              {activeContact.online
                ? t("active")
                : t("lastSeen")}
            </span>
          </div>

          <div className="header-actions">
            <button
              className="icon-button"
              aria-label={t("searchChat")}
              onClick={() => notify(t("chatSearchError"))}
            >
              <Search />
            </button>

            <button
              className="icon-button"
              aria-label={t("chatOptions")}
              onClick={() => notify(t("optionsPlaceholder"))}
            >
              <MoreHorizontal />
            </button>
          </div>
        </header>

        <div className="conversation">

          <div className="date-divider">
            <span />
            <p>{t("today")}</p>
            <span />
          </div>

          <div className="message-stack">

            {activeMessages.map(message => (
              <div
                key={message.id}
                className={`message-row ${
                  message.from === "me"
                    ? "message-row-me"
                    : ""
                }`}
              >
                {message.from !== "me" && (
                  <Avatar
                    name={activeContact.name}
                    color={activeContact.color}
                    size="xs"
                  />
                )}

                <div className="message-content">

                  <div
                    className={`message-bubble ${
                      message.from === "me"
                        ? "bubble-me"
                        : "bubble-them"
                    }`}
                  >
                    {message.text}
                  </div>

                  <div
                    className={`message-meta ${
                      message.from === "me"
                        ? "meta-me"
                        : ""
                    }`}
                  >
                    <time>{message.time}</time>

                    {message.from === "me" && (
                      <CheckCheck size={14} />
                    )}
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* MESSAGE COMPOSER */}
        <form className="composer" onSubmit={sendMessage}>

          <div className="composer-toolbar">
            <button
              type="button"
              className="tool-button"
              aria-label={t("attach")}
              onClick={() => notify(t("uploadError"))}
            >
              <Paperclip size={19} />
            </button>

            <button
              type="button"
              className="tool-button"
              aria-label={t("addImage")}
              onClick={() => notify(t("imageError"))}
            >
              <ImagePlus size={19} />
            </button>
          </div>

          <input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder={`${t("message")} ${activeContact.name.split(" ")[0]}...`}
            aria-label={t("message")}
          />

          <button
            type="button"
            className="tool-button emoji-button"
            aria-label={t("emoji")}
            onClick={() => setDraft(value => value + " ✨")}
          >
            <Smile size={19} />
          </button>

          <button
            type="submit"
            className="send-button"
            disabled={!draft.trim()}
            aria-label={t("send")}
          >
            <Send size={17} />
          </button>

        </form>

        <div className="composer-hint">
          {t("pressEnter")} <kbd>Enter</kbd> {t("toSend")}
          <span>•</span>
          <span className="connection-indicator" />

          {socketStatus === "demo"
            ? t("demoMode")
            : socketStatus === "online"
              ? t("connected")
              : socketStatus}
        </div>

      </section>

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setEditOpen(false);
            }
          }}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
          >

            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {t("accountTitle")}
                </span>
                <h2 id="profile-title">{t("editProfile")}</h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setEditOpen(false)}
                aria-label={t("close")}
              >
                <X />
              </button>
            </div>

            <div className="avatar-editor">
              <Avatar
                name={`${profile.firstName} ${profile.lastName}`}
                src={profile.avatar}
                size="xl"
                color="orange"
              />

              <div>
                <strong>{t("profilePicture")}</strong>
                <p>{t("pictureFormats")}</p>

                <button
                  type="button"
                  className="upload-button"
                  onClick={() => fileInput.current?.click()}
                >
                  <Camera size={15} />
                  {t("changePicture")}
                </button>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={chooseAvatar}
                  hidden
                />
              </div>
            </div>

            <form
              className="profile-form"
              onSubmit={saveProfile}
            >

              <div className="field-pair">
                <label>
                  {t("firstName")}
                  <input
                    name="firstName"
                    required
                    maxLength="60"
                    defaultValue={profile.firstName}
                  />
                </label>

                <label>
                  {t("lastName")}
                  <input
                    name="lastName"
                    required
                    maxLength="60"
                    defaultValue={profile.lastName}
                  />
                </label>
              </div>

              <label>
                {t("username")}
                <div className="input-prefix">
                  <span>@</span>
                  <input
                    name="username"
                    required
                    minLength="3"
                    maxLength="30"
                    defaultValue={profile.username}
                  />
                </div>
              </label>

              <label>
                {t("email")}
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={profile.email}
                />
              </label>

              <p className="form-note">
                <ShieldCheck size={15} />
                {t("securityNote")}
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditOpen(false)}
                >
                  {t("cancel")}
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {t("save")}
                </button>
              </div>

            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span className="toast-dot" />
          {toast}
        </div>
      )}

    </main>
  );
}

export default App;
