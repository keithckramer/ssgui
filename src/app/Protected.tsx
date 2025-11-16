// src/app/Protected.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function Protected({ children }: { children: ReactNode }) {
  // Temporary: allow all routes while auth is under construction.
  // We still keep this wrapper so it's easy to wire up real auth later.
  const isAuthed = true;

  return isAuthed ? children : <Navigate to="/login" replace />;
}

/* usage:
<Route path="/games" element={<Protected><Games/></Protected>} />
*/
