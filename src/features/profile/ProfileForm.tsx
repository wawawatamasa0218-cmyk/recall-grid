"use client";

import { useState, useTransition } from "react";
import { updateDisplayNameAction } from "./actions";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName); const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  return <div className="profile-form"><label>公開名<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="公開デッキに表示する名前" /></label><button className="button secondary" disabled={pending || !name.trim()} onClick={() => startTransition(async () => setMessage((await updateDisplayNameAction(name)).message))}>{pending ? "保存中…" : "公開名を保存"}</button>{message && <small role="status">{message}</small>}</div>;
}
