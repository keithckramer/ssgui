// src/app/Protected.tsx
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export default function Protected({ children }: { children: ReactNode }) {
  const isAuthed = false; // TODO: wire to real auth
  return isAuthed ? children : <Navigate to="/login" replace />;
}


/* usage:
<Route path="/games" element={<Protected><Games/></Protected>} />
*/
