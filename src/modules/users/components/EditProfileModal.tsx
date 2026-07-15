import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Sparkles, FileUp, ImagePlus, X } from "lucide-react";
import { useStore } from "../../../store/useStore";
import { Modal, Button, Field, inputCls } from "../../../core/ui";

const GENERIC_DESCRIPTIONS = [
  "es una empresa del sector agrícola en La Libertad, comprometida con la eficiencia operativa, la trazabilidad de sus servicios y un trato cercano con cada cliente.",
  "trabaja junto a productores de la región para modernizar el uso de maquinaria agrícola, con un enfoque en confiabilidad, puntualidad y buenos resultados en campo.",
  "impulsa la agricultura del norte del país ofreciendo un servicio moderno, transparente y orientado a la productividad de sus socios y clientes.",
];

export default function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);

  const [avatar, setAvatar] = useState<string | null | undefined>(user?.avatarUrl);
  const [description, setDescription] = useState(user?.description ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [docName, setDocName] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

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
      const generated = excerpt
        ? `${subject} ${base} ${excerpt}`
        : `${subject} ${base}`;
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

  const save = () => {
    updateUser(user.id, { avatarUrl: avatar ?? undefined, description: description.trim() || undefined });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar perfil">
      <div className="space-y-5">
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

        {/* Descripción */}
        <Field label="Descripción del perfil">
          <textarea
            className={`${inputCls} min-h-[110px] resize-none`}
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
          <p className="text-[11px] text-slate-400 mt-1.5">
            También puedes escribir la descripción manualmente en el campo de arriba.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1" onClick={save} disabled={analyzing}>Guardar cambios</Button>
      </div>
    </Modal>
  );
}
