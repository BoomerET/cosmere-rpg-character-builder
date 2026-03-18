// src/app/router.tsx
import { createBrowserRouter } from "react-router";
import { HomePage } from "../pages/HomePage";
import { NewCharacterPage } from "../pages/NewCharacterPage";
import { EditCharacterPage } from "../pages/EditCharacterPage";
import { ExportPage } from "../pages/ExportPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/new", Component: NewCharacterPage },
  { path: "/character/:id", Component: EditCharacterPage },
  { path: "/export/:id", Component: ExportPage },
],
{  basename: "/cosmere",
},
);

