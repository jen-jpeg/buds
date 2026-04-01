"use client";

import { useState } from "react";
import AboutPopup from "./about-popup";
import JsonEditorPopup from "./json-editor-popup";

export default function NavBar() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center my-[1.5rem] mx-[7%] max-w-[80vw]">
        <h1 className="text-[1.8rem] font-bold">buds ✿</h1>
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="text-[1.35rem] font-medium text-foreground hover:text-health-bar-sage hover:cursor-pointer"
            onClick={() => setAboutOpen(true)}
          >
            about
          </button>
          <button
            type="button"
            className="text-[1.35rem] font-medium text-foreground hover:text-health-bar-sage hover:cursor-pointer"
            onClick={() => setJsonOpen(true)}
          >
            edit
          </button>
        </div>
      </div>
      {aboutOpen ? <AboutPopup onClose={() => setAboutOpen(false)} /> : null}
      {jsonOpen ? <JsonEditorPopup onClose={() => setJsonOpen(false)} /> : null}
    </>
  );
}