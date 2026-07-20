import type React from "react";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search, Tractor, ShieldCheck, ArrowLeft, Loader2, AlertCircle, User as UserIcon, Building2, CheckCircle2, KeyRound,
  BadgeCheck, Sparkles, Leaf, MapPin,
} from "lucide-react";
import { useStore } from "../../../store/useStore";
import type { Role, AccountType } from "../types";
import type { District } from "../../../core/constants/districts";
import { Button, Field, FieldError, PasswordInput, inputCls, inputErrorCls, Logo, DistrictOptions } from "../../../core/ui";
import { cx } from "../../../core/utils/format";
import {
  validateEmail,
  validatePhone,
  validateFullName,
  validateDni,
  validateRuc,
  validateCompanyName,
  validatePassword,
  sanitizePhoneInput,
  sanitizeDniInput,
  sanitizeRucInput,
  sanitizeNameInput,
} from "../../../core/utils/validators";

type Mode = "login" | "register" | "forgot";
type ForgotStep = "email" | "verify" | "done";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const loginWithCredentials = useStore((s) => s.loginWithCredentials);
  const loginDemo = useStore((s) => s.loginDemo);
  const registerUser = useStore((s) => s.registerUser);
  const requestPasswordReset = useStore((s) => s.requestPasswordReset);
  const confirmPasswordReset = useStore((s) => s.confirmPasswordReset);

  const initialMode: Mode = (location.state as { mode?: Mode } | null)?.mode === "register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<Role>("cliente");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registro
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [ruc, setRuc] = useState("");
  const [dni, setDni] = useState("");
  const [district, setDistrict] = useState<District>("Moche");

  // Olvidé mi contraseña
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [devCode, setDevCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const goToRole = (r: Role) => nav(r === "proveedor" ? "/proveedor" : "/cliente");

  // ---- Validación en vivo de registro ----
  const nameV = validateFullName(name);
  const emailV = validateEmail(email);
  const passV = validatePassword(password);
  const phoneV = validatePhone(phone);
  const companyV = validateCompanyName(company);
  const rucV = validateRuc(ruc);
  const dniV = validateDni(dni);

  const registerValid =
    nameV.ok && emailV.ok && passV.ok && phoneV.ok &&
    (accountType === "empresa" ? companyV.ok && rucV.ok : dniV.ok);

  const submitLogin = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = loginWithCredentials(email, password);
      setLoading(false);
      if (!res.ok) return setError(res.error ?? "No se pudo iniciar sesión.");
      // Navega según el rol real de la cuenta, no el tile seleccionado.
      goToRole(useStore.getState().user?.role ?? role);
    }, 700);
  };

  const submitRegister = () => {
    setError(null);
    if (!registerValid) {
      setTouched({ name: true, email: true, password: true, phone: true, company: true, ruc: true, dni: true });
      return setError("Revisa los campos marcados en rojo.");
    }
    setLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name, email, password, phone, role, accountType,
        company: accountType === "empresa" ? company : "",
        ruc: accountType === "empresa" ? ruc : "",
        dni: accountType === "individual" ? dni : undefined,
        district: role === "proveedor" ? district : undefined,
      });
      setLoading(false);
      if (!res.ok) return setError(res.error ?? "No se pudo crear la cuenta.");
      goToRole(role);
    }, 900);
  };

  const useDemo = (r: Role) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      loginDemo(r);
      setLoading(false);
      goToRole(r);
    }, 500);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setTouched({});
    if (m === "forgot") {
      setForgotStep("email");
      setForgotEmail(email);
      setForgotError(null);
      setCodeInput("");
      setNewPassword("");
      setDevCode("");
    }
  };

  const submitForgotEmail = () => {
    setForgotError(null);
    const check = validateEmail(forgotEmail);
    if (!check.ok) return setForgotError(check.error ?? "Correo inválido.");
    setForgotLoading(true);
    setTimeout(() => {
      const res = requestPasswordReset(forgotEmail);
      setForgotLoading(false);
      if (!res.ok) return setForgotError(res.error ?? "No se pudo procesar la solicitud.");
      setDevCode(res.code ?? "");
      setForgotStep("verify");
    }, 700);
  };

  const submitForgotVerify = () => {
    setForgotError(null);
    const passCheck = validatePassword(newPassword);
    if (!codeInput.trim()) return setForgotError("Ingresa el código.");
    if (!passCheck.ok) return setForgotError(passCheck.error ?? "Contraseña inválida.");
    setForgotLoading(true);
    setTimeout(() => {
      const res = confirmPasswordReset(forgotEmail, codeInput, newPassword);
      setForgotLoading(false);
      if (!res.ok) return setForgotError(res.error ?? "No se pudo restablecer la contraseña.");
      setForgotStep("done");
    }, 700);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel de marca — solo desktop, da contexto y confianza junto al formulario */}
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12">
        {/* Foto real de fondo (campo agrícola) + degradado de marca para legibilidad */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=1400&q=80"
            alt="Campo agrícola con maquinaria trabajando"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-agua-700/93 via-agua-600/90 to-[#0b7c72]/95" />
        </div>
        <div className="pointer-events-none absolute -top-24 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl z-10" />
        <div className="pointer-events-none absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-earth-300/20 blur-3xl z-10" />
        <Leaf size={26} className="z-10 pointer-events-none absolute top-28 left-[12%] text-white/25 animate-float-slow" />
        <Leaf size={20} className="z-10 pointer-events-none absolute bottom-40 right-[14%] text-white/20 animate-float-slow" style={{ animationDelay: "1.2s" }} />

        <Link to="/" className="relative z-10 flex items-center gap-2.5 w-fit">
          <Logo />
          <p className="font-display font-extrabold text-white tracking-tight text-lg">
            Traktor<span className="text-earth-100">Rent</span>
          </p>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display font-black text-3xl xl:text-4xl leading-[1.1] text-white">
            La flota agrícola de tu campo, a un clic de distancia
          </h1>
          <p className="mt-4 text-agua-50/90 leading-relaxed">
            Conectamos fundos y agroexportadoras con proveedores verificados de tractores e implementos,
            con telemetría y contratos digitales.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: <ShieldCheck size={16} />, text: "Empresa verificada" },
              { icon: <BadgeCheck size={16} />, text: "RUC validado por SUNAT" },
              { icon: <Sparkles size={16} />, text: "Telemetría en tiempo real" },
              { icon: <MapPin size={16} />, text: "Cobertura en La Libertad y Lambayeque" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2.5 text-sm font-semibold text-white">
                <span className="w-7 h-7 rounded-full grid place-items-center bg-white/15">{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-white">
          {[
            { k: "40+", v: "Unidades activas" },
            { k: "98%", v: "Reservas cumplidas" },
            { k: "<2h", v: "Tiempo de respuesta" },
          ].map((x) => (
            <div key={x.v}>
              <p className="font-display font-black text-xl">{x.k}</p>
              <p className="text-xs text-agua-50/80 font-medium">{x.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="mesh-bg min-h-screen grid place-items-center px-5 py-10">
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="lg:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-agua-600 mb-4">
          <ArrowLeft size={15} /> Volver
        </Link>
        <div className="glass rounded-2xl shadow-float p-7 animate-fade-in-up">
          {mode !== "forgot" ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => switchMode("login")}
                  className={`text-sm font-display font-bold pb-1 border-b-2 transition ${mode === "login" ? "border-agua-500 text-slate-800" : "border-transparent text-slate-400"}`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => switchMode("register")}
                  className={`text-sm font-display font-bold pb-1 border-b-2 transition ${mode === "register" ? "border-agua-500 text-slate-800" : "border-transparent text-slate-400"}`}
                >
                  Crear cuenta
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {mode === "login" ? "Ingresa con tu correo y contraseña." : "Regístrate como cliente o proveedor — cada cuenta es independiente."}
              </p>

              {/* Selector de rol — rutas mutuamente excluyentes */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <RoleTile active={role === "cliente"} onClick={() => setRole("cliente")}
                  icon={<Search size={20} />} title="Cliente" sub="Busco maquinaria" tone="agua" />
                <RoleTile active={role === "proveedor"} onClick={() => setRole("proveedor")}
                  icon={<Tractor size={20} />} title="Proveedor" sub="Ofrezco mi flota" tone="earth" />
              </div>

              {/* Subtipo de cuenta — solo en registro, cambia los datos pedidos */}
              {mode === "register" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <AccountTypeTile active={accountType === "individual"} onClick={() => setAccountType("individual")}
                    icon={<UserIcon size={16} />} label="Individual" />
                  <AccountTypeTile active={accountType === "empresa"} onClick={() => setAccountType("empresa")}
                    icon={<Building2 size={16} />} label="Empresa" />
                </div>
              )}

              <div className="mt-5 space-y-3">
                {mode === "register" && (
                  <>
                    <Field label={accountType === "empresa" ? "Nombre del contacto" : "Nombre completo"}>
                      <input
                        className={cx(inputCls, touched.name && !nameV.ok && inputErrorCls)}
                        value={name}
                        onChange={(e) => setName(sanitizeNameInput(e.target.value))}
                        onBlur={() => touch("name")}
                        placeholder="Ej. María Torres"
                      />
                      {touched.name && <FieldError>{nameV.error}</FieldError>}
                    </Field>

                    <Field label="Teléfono">
                      <input
                        className={cx(inputCls, touched.phone && !phoneV.ok && inputErrorCls)}
                        value={phone}
                        onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                        onBlur={() => touch("phone")}
                        placeholder="9XXXXXXXX"
                        inputMode="numeric"
                      />
                      {touched.phone && <FieldError>{phoneV.error}</FieldError>}
                    </Field>

                    {accountType === "empresa" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Razón social">
                          <input
                            className={cx(inputCls, touched.company && !companyV.ok && inputErrorCls)}
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            onBlur={() => touch("company")}
                            placeholder="Agrícola S.A.C."
                          />
                          {touched.company && <FieldError>{companyV.error}</FieldError>}
                        </Field>
                        <Field label="RUC">
                          <input
                            className={cx(inputCls, touched.ruc && !rucV.ok && inputErrorCls)}
                            value={ruc}
                            onChange={(e) => setRuc(sanitizeRucInput(e.target.value))}
                            onBlur={() => touch("ruc")}
                            placeholder="20xxxxxxxxx"
                            inputMode="numeric"
                          />
                          {touched.ruc && <FieldError>{rucV.error}</FieldError>}
                        </Field>
                      </div>
                    ) : (
                      <Field label="DNI">
                        <input
                          className={cx(inputCls, touched.dni && !dniV.ok && inputErrorCls)}
                          value={dni}
                          onChange={(e) => setDni(sanitizeDniInput(e.target.value))}
                          onBlur={() => touch("dni")}
                          placeholder="8 dígitos"
                          inputMode="numeric"
                        />
                        {touched.dni && <FieldError>{dniV.error}</FieldError>}
                      </Field>
                    )}

                    {role === "proveedor" && (
                      <Field label="Distrito de operación">
                        <select className={inputCls} value={district} onChange={(e) => setDistrict(e.target.value as District)}>
                          <DistrictOptions />
                        </select>
                      </Field>
                    )}
                  </>
                )}
                <Field label="Correo electrónico">
                  <input
                    type="email"
                    className={cx(inputCls, mode === "register" && touched.email && !emailV.ok && inputErrorCls)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch("email")}
                    placeholder="tucorreo@gmail.com"
                  />
                  {mode === "register" && touched.email && <FieldError>{emailV.error}</FieldError>}
                </Field>
                <Field label="Contraseña">
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    onBlur={() => touch("password")}
                    invalid={mode === "register" && touched.password && !passV.ok}
                  />
                  {mode === "register" && touched.password && <FieldError>{passV.error}</FieldError>}
                </Field>
              </div>

              {mode === "login" && (
                <button
                  onClick={() => switchMode("forgot")}
                  className="mt-2 text-xs font-semibold text-agua-600 hover:text-agua-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              {error && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-terra-500 bg-orange-50 ring-1 ring-orange-700/20 rounded-lg px-3 py-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <Button
                className="w-full mt-5" size="lg"
                onClick={mode === "login" ? submitLogin : submitRegister}
                disabled={loading || !email || !password || (mode === "register" && !name)}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {mode === "login" ? "Validando…" : "Creando cuenta…"}</>
                ) : mode === "login" ? (
                  <>Ingresar como {role === "proveedor" ? "Proveedor" : "Cliente"}</>
                ) : (
                  <>Crear cuenta de {role === "proveedor" ? "Proveedor" : "Cliente"}</>
                )}
              </Button>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-semibold">O PRUEBA CON UNA CUENTA DEMO</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" onClick={() => useDemo("cliente")} disabled={loading}>Demo Cliente</Button>
                <Button variant="secondary" size="sm" onClick={() => useDemo("proveedor")} disabled={loading}>Demo Proveedor</Button>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400 inline-flex items-center gap-1.5 justify-center w-full">
                <ShieldCheck size={13} className="text-agua-500" /> Sesión persistida de forma segura en tu dispositivo
              </p>
            </>
          ) : (
            <ForgotPasswordPanel
              step={forgotStep}
              email={forgotEmail}
              setEmail={setForgotEmail}
              devCode={devCode}
              codeInput={codeInput}
              setCodeInput={setCodeInput}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              error={forgotError}
              loading={forgotLoading}
              onSubmitEmail={submitForgotEmail}
              onSubmitVerify={submitForgotVerify}
              onBackToLogin={() => switchMode("login")}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

function RoleTile({ active, onClick, icon, title, sub, tone }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string; tone: "agua" | "earth";
}) {
  const ring = active ? (tone === "agua" ? "ring-agua-400 bg-agua-50" : "ring-earth-300 bg-earth-50") : "ring-slate-200 bg-white/60";
  return (
    <button onClick={onClick} className={`text-left rounded-xl ring-2 ${ring} p-3.5 transition-all hover:-translate-y-0.5`}>
      <div className={`w-9 h-9 grid place-items-center rounded-lg mb-2 ${tone === "agua" ? "bg-agua-500 text-white" : "bg-earth-400 text-white"}`}>{icon}</div>
      <p className="font-display font-bold text-sm text-slate-800">{title}</p>
      <p className="text-[11px] text-slate-500 leading-tight">{sub}</p>
    </button>
  );
}

function AccountTypeTile({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
        active ? "bg-slate-800 text-white shadow-float" : "bg-white/60 text-slate-500 ring-1 ring-slate-200 hover:ring-slate-300"
      )}
    >
      {icon} {label}
    </button>
  );
}

function ForgotPasswordPanel({
  step, email, setEmail, devCode, codeInput, setCodeInput, newPassword, setNewPassword,
  error, loading, onSubmitEmail, onSubmitVerify, onBackToLogin,
}: {
  step: ForgotStep;
  email: string; setEmail: (v: string) => void;
  devCode: string;
  codeInput: string; setCodeInput: (v: string) => void;
  newPassword: string; setNewPassword: (v: string) => void;
  error: string | null; loading: boolean;
  onSubmitEmail: () => void; onSubmitVerify: () => void; onBackToLogin: () => void;
}) {
  return (
    <div>
      <button onClick={onBackToLogin} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-agua-600 mb-3">
        <ArrowLeft size={14} /> Volver a iniciar sesión
      </button>

      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={18} className="text-agua-500" />
        <h2 className="font-display font-bold text-lg text-slate-800">Recuperar contraseña</h2>
      </div>

      {step === "email" && (
        <>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Ingresa el correo con el que te registraste. Te enviaremos un código de verificación.
          </p>
          <Field label="Correo electrónico">
            <input
              type="email"
              className={cx(inputCls, error && inputErrorCls)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@gmail.com"
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button className="w-full mt-5" size="lg" onClick={onSubmitEmail} disabled={loading || !email}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Enviando…</> : "Enviar código"}
          </Button>
        </>
      )}

      {step === "verify" && (
        <>
          <p className="text-sm text-slate-500 mt-1 mb-2">
            Enviamos un código a <span className="font-semibold text-slate-700">{email}</span>.
          </p>
          {devCode && (
            <div className="mb-4 text-xs font-semibold text-agua-700 bg-agua-50 ring-1 ring-agua-400/30 rounded-lg px-3 py-2">
              Modo demo — sin servidor de correo conectado. Tu código es: <span className="font-mono text-sm">{devCode}</span>
            </div>
          )}
          <div className="space-y-3">
            <Field label="Código de verificación">
              <input
                className={inputCls}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 dígitos"
                inputMode="numeric"
              />
            </Field>
            <Field label="Nueva contraseña">
              <PasswordInput value={newPassword} onChange={setNewPassword} />
            </Field>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-terra-500 bg-orange-50 ring-1 ring-orange-700/20 rounded-lg px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <Button className="w-full mt-5" size="lg" onClick={onSubmitVerify} disabled={loading || !codeInput || !newPassword}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verificando…</> : "Restablecer contraseña"}
          </Button>
        </>
      )}

      {step === "done" && (
        <div className="text-center py-4">
          <CheckCircle2 size={40} className="mx-auto text-agua-500 mb-3" />
          <p className="text-sm font-semibold text-slate-700 mb-1">Contraseña actualizada</p>
          <p className="text-xs text-slate-500 mb-5">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Button className="w-full" size="lg" onClick={onBackToLogin}>Ir a iniciar sesión</Button>
        </div>
      )}
    </div>
  );
}
