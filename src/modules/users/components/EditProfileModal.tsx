import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Loader2, Sparkles, FileUp, ImagePlus, X, User as UserIcon, Mail, Phone, Building2,
  CreditCard, MapPin, KeyRound, AlertCircle, CheckCircle2,
} from "lucide-react";
import { useStore } from "../../../store/useStore";
import type { District } from "../../../core/constants/districts";
import { Modal, Button, Field, FieldError, PasswordInput, inputCls, inputErrorCls, DistrictOptions } from "../../../core/ui";
import { cx } from "../../../core/utils/format";
import {
  validateEmail, validatePhone, validateFullName, validateDni, validateRuc, validateCompanyName, validatePassword,
  sanitizePhoneInput, sanitizeDniInput, sanitizeRucInput, sanitizeNameInput,
} from "../../../core/utils/validators";

const GENERIC_DESCRIPTIONS = [
  "es una empresa del sector agrícola en La Libertad, comprometida con la eficiencia operativa, la trazabilidad de sus servicios y un trato cercano con cada cliente.",
  "trabaja junto a productores de la región para modernizar el uso de maquinaria agrícola, con un enfoque en confiabilidad, puntualidad y buenos resultados en campo.",
  "impulsa la agricultura del norte del país ofreciendo un servicio moderno, transparente y orientado a la productividad de sus socios y clientes.",
];

export default function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const updateProfile = useStore((s) => s.updateProfile);
  const changePassword = useStore((s) => s.changePassword);
  const providers = useStore((s) => s.providers);
  const updateProvider = useStore((s) => s.updateProvider);

  const isEmpresa = user?.accountType === "empresa";
  const isProveedor = user?.role === "proveedor";
  const myProvider = providers.find((p) => p.id === user?.providerId);

  const [avatar, setAvatar] = useState<string | null | undefined>(user?.avatarUrl);
  const [description, setDescription] = useState(user?.description ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [docName, setDocName] = useState<string | null>(null);

  // Datos de la cuenta — comunes a los 4 perfiles (cliente/proveedor x individual/empresa)
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [company, setCompany] = useState(user?.company && user.company !== "—" ? user.company : "");
  const [ruc, setRuc] = useState(user?.ruc && user.ruc !== "—" ? user.ruc : "");
  const [dni, setDni] = useState(user?.dni ?? "");
  const [district, setDistrict] = useState<District>(myProvider?.district ?? "Trujillo");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Cambio de contraseña — requiere la contraseña actual antes de aceptar la nueva
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Recarga los campos con los datos vigentes cada vez que se abre el modal
  useEffect(() => {
    if (!open || !user) return;
    setAvatar(user.avatarUrl);
    setDescription(user.description ?? "");
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setCompany(user.company && user.company !== "—" ? user.company : "");
    setRuc(user.ruc && user.ruc !== "—" ? user.ruc : "");
    setDni(user.dni ?? "");
    setDistrict(myProvider?.district ?? "Trujillo");
    setTouched({});
    setProfileError(null);
    setProfileSaved(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError(null);
    setPwSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  if (!user) return null;

  const nameV = validateFullName(name);
  const emailV = validateEmail(email);
  const phoneV = validatePhone(phone);
  const companyV = isEmpresa ? validateCompanyName(company) : { ok: true as const };
  const rucV = isEmpresa ? validateRuc(ruc) : { ok: true as const };
  const dniV = !isEmpresa ? validateDni(dni) : { ok: true as const };
  const profileValid = nameV.ok && emailV.ok && phoneV.ok && companyV.ok && rucV.ok && dniV.ok;

  const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Simula una IA redactando la descripción del perfil a partir de un documento
  // subido (ficha comercial, brochure, presentación de la empresa, etc.).
  const onPickDocument = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocName(file.name);
    setAnalyzing(true);

    const finish = (excerpt?: string) => {
      const base = GENERIC_DESCRIPTIONS[Math.floor(Math.random() * GENERIC_DESCRIPTIONS.length)];
      const subject = user.company && user.company !== "—" ? user.company : user.name;
      const generated = excerpt ? `${subject} ${base} ${excerpt}` : `${subject} ${base}`;
      setTimeout(() => {
        setDescription(generated.trim());
        setAnalyzing(false);
      }, 1600);
    };

    const isTextLike = file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name);
    if (isTextLike) {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = typeof reader.result === "string" ? reader.result : "";
        const clean = raw.replace(/\s+/g, " ").trim().slice(0, 200);
        finish(clean ? `Extracto del documento: "${clean}${raw.length > 200 ? "…" : ""}"` : undefined);
      };
      reader.onerror = () => finish();
      reader.readAsText(file);
    } else {
      finish();
    }
  };

  const saveProfile = () => {
    setProfileError(null);
    setProfileSaved(false);
    setTouched({ name: true, email: true, phone: true, company: true, ruc: true, dni: true });
    if (!profileValid) {
      setProfileError("Revisa los campos marcados en rojo.");
      return;
    }
    setProfileSaving(true);
    setTimeout(() => {
      const res = updateProfile(user.id, {
        name, email, phone,
        ...(isEmpresa ? { company, ruc } : {}),
        ...(!isEmpresa ? { dni } : {}),
      });
      if (!res.ok) {
        setProfileSaving(false);
        setProfileError(res.error ?? "No se pudo guardar los cambios.");
        return;
      }
      if (isProveedor && user.providerId && district !== myProvider?.district) {
        updateProvider(user.providerId, { district });
      }
      updateUser(user.id, { avatarUrl: avatar ?? undefined, description: description.trim() || undefined });
      setProfileSaving(false);
      setProfileSaved(true);
    }, 500);
  };

  const submitPasswordChange = () => {
    setPwError(null);
    setPwSaved(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Completa los tres campos para cambiar tu contraseña.");
      return;
    }
    const newPassCheck = validatePassword(newPassword);
    if (!newPassCheck.ok) {
      setPwError(newPassCheck.error ?? "Contraseña inválida.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    setPwSaving(true);
    setTimeout(() => {
      const res = changePassword(user.id, currentPassword, newPassword);
      setPwSaving(false);
      if (!res.ok) {
        setPwError(res.error ?? "No se pudo actualizar la contraseña.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSaved(true);
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar perfil" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        {/* Foto de perfil */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Foto de perfil</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 grid place-items-center text-white font-bold text-lg ring-1 ring-slate-200" style={{ background: user.avatarColor }}>
              {avatar ? (
                <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            <div className="flex-1 flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                <ImagePlus size={15} /> {avatar ? "Cambiar foto" : "Subir foto"}
              </Button>
              {avatar && (
                <button type="button" onClick={() => setAvatar(null)} className="text-xs font-semibold text-slate-400 hover:text-terra-500 inline-flex items-center gap-1">
                  <X size={13} /> Quitar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Datos de la cuenta — nombre, correo, teléfono + campos según rol/tipo */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Datos de la cuenta</p>
          <div className="space-y-3">
            <Field label={isEmpresa ? "Nombre del contacto" : "Nombre completo"}>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={cx(inputCls, "pl-9", touched.name && !nameV.ok && inputErrorCls)}
                  value={name}
                  onChange={(e) => setName(sanitizeNameInput(e.target.value))}
                  onBlur={() => touch("name")}
                />
              </div>
              {touched.name && <FieldError>{nameV.error}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Correo electrónico">
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className={cx(inputCls, "pl-9", touched.email && !emailV.ok && inputErrorCls)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch("email")}
                  />
                </div>
                {touched.email && <FieldError>{emailV.error}</FieldError>}
              </Field>
              <Field label="Teléfono">
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={cx(inputCls, "pl-9", touched.phone && !phoneV.ok && inputErrorCls)}
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                    onBlur={() => touch("phone")}
                    inputMode="numeric"
                  />
                </div>
                {touched.phone && <FieldError>{phoneV.error}</FieldError>}
              </Field>
            </div>

            {isEmpresa ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Razón social">
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={cx(inputCls, "pl-9", touched.company && !companyV.ok && inputErrorCls)}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      onBlur={() => touch("company")}
                    />
                  </div>
                  {touched.company && <FieldError>{companyV.error}</FieldError>}
                </Field>
                <Field label="RUC">
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={cx(inputCls, "pl-9", touched.ruc && !rucV.ok && inputErrorCls)}
                      value={ruc}
                      onChange={(e) => setRuc(sanitizeRucInput(e.target.value))}
                      onBlur={() => touch("ruc")}
                      inputMode="numeric"
                    />
                  </div>
                  {touched.ruc && <FieldError>{rucV.error}</FieldError>}
                </Field>
              </div>
            ) : (
              <Field label="DNI">
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={cx(inputCls, "pl-9", touched.dni && !dniV.ok && inputErrorCls)}
                    value={dni}
                    onChange={(e) => setDni(sanitizeDniInput(e.target.value))}
                    onBlur={() => touch("dni")}
                    inputMode="numeric"
                  />
                </div>
                {touched.dni && <FieldError>{dniV.error}</FieldError>}
              </Field>
            )}

            {isProveedor && (
              <Field label="Distrito de operación">
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <select className={cx(inputCls, "pl-9")} value={district} onChange={(e) => setDistrict(e.target.value as District)}>
                    <DistrictOptions />
                  </select>
                </div>
              </Field>
            )}
          </div>
        </div>

        {/* Descripción */}
        <Field label="Descripción del perfil">
          <textarea
            className={`${inputCls} min-h-[100px] resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe una breve descripción de tu empresa o de ti, o genera una automáticamente subiendo un documento."
          />
        </Field>

        {/* Generar descripción con IA a partir de un documento */}
        <div>
          <input ref={docInputRef} type="file" accept=".txt,.md,.csv,.pdf,.doc,.docx" className="hidden" onChange={onPickDocument} />
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-agua-300 bg-agua-50/60 py-3.5 text-sm font-semibold text-agua-600 hover:bg-agua-50 transition disabled:opacity-70"
          >
            {analyzing ? (
              <><Loader2 size={16} className="animate-spin" /> Redactando descripción con IA…</>
            ) : (
              <><FileUp size={16} /> Subir documento para que la IA redacte tu descripción</>
            )}
          </button>
          {analyzing && (
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Sparkles size={12} /> Analizando {docName}…
            </p>
          )}
        </div>

        {profileError && (
          <div className="flex items-center gap-2 text-xs font-semibold text-terra-500 bg-orange-50 ring-1 ring-orange-700/20 rounded-lg px-3 py-2">
            <AlertCircle size={14} /> {profileError}
          </div>
        )}
        {profileSaved && !profileError && (
          <div className="flex items-center gap-2 text-xs font-semibold text-agua-700 bg-agua-50 ring-1 ring-agua-400/30 rounded-lg px-3 py-2">
            <CheckCircle2 size={14} /> Cambios guardados.
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cerrar</Button>
          <Button className="flex-1" onClick={saveProfile} disabled={analyzing || profileSaving}>
            {profileSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : "Guardar cambios"}
          </Button>
        </div>

        {/* Seguridad — cambio de contraseña, exige la contraseña actual */}
        <div className="border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><KeyRound size={13} /> Seguridad — cambiar contraseña</p>
          <div className="space-y-3">
            <Field label="Contraseña actual">
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="Tu contraseña actual" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nueva contraseña">
                <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="Mínimo 8 caracteres" />
              </Field>
              <Field label="Confirmar nueva contraseña">
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repite la nueva contraseña" />
              </Field>
            </div>
          </div>

          {pwError && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-terra-500 bg-orange-50 ring-1 ring-orange-700/20 rounded-lg px-3 py-2">
              <AlertCircle size={14} /> {pwError}
            </div>
          )}
          {pwSaved && !pwError && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-agua-700 bg-agua-50 ring-1 ring-agua-400/30 rounded-lg px-3 py-2">
              <CheckCircle2 size={14} /> Contraseña actualizada correctamente.
            </div>
          )}

          <Button
            className="w-full mt-3"
            variant="secondary"
            onClick={submitPasswordChange}
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
          >
            {pwSaving ? <><Loader2 size={16} className="animate-spin" /> Actualizando…</> : <><KeyRound size={15} /> Actualizar contraseña</>}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
