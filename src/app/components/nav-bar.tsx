"use client";

import { useState } from "react";
import AboutPopup from "./about-popup";

export default function NavBar() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center my-[1.5rem] mx-[7%] max-w-[80vw]">
        <h1 className="text-[1.8rem] font-bold">buds ✿</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-[1.35rem] font-medium text-foreground hover:text-health-bar-sage hover:cursor-pointer"
            onClick={() => setAboutOpen(true)}
          >
            about
          </button>
        </div>
      </div>
      {aboutOpen ? <AboutPopup onClose={() => setAboutOpen(false)} /> : null}
    </>
  );
}