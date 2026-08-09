"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AboutPopup from "./about-popup";
import JsonEditorPopup from "./json-editor-popup";

const HOME_LINK_PATHS = new Set(["/faq", "/privacy", "/terms"]);

export default function NavBar() {
  const pathname = usePathname();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const showHomeLink = HOME_LINK_PATHS.has(pathname);

  return (
    <>
      <div className="flex justify-between items-center my-[1.5rem] mx-[7%] max-w-[80vw]">
        {showHomeLink ? (
          <Link
            href="/"
            className="text-[1.8rem] font-bold text-foreground transition hover:text-health-bar-sage"
          >
            buds ✿
          </Link>
        ) : (
          <h1 className="text-[1.8rem] font-bold">buds ✿</h1>
        )}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            type="button"
            className="text-[1.2rem] md:text-[1.35rem] font-medium text-foreground hover:text-health-bar-sage hover:cursor-pointer"
            onClick={() => setAboutOpen(true)}
          >
            about
          </button>
          <button
            type="button"
            className="text-[1.1rem] md:text-[1.35rem] font-medium text-foreground hover:text-health-bar-sage hover:cursor-pointer"
            onClick={() => setJsonOpen(true)}
          >
            edit
          </button>
          <a
            href="https://buds-waitlist.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[1.2rem] md:text-[1.35rem] font-medium text-foreground hover:text-health-bar-sage"
          >
            (waitlist)
          </a>
        </div>
      </div>
      {aboutOpen ? <AboutPopup onClose={() => setAboutOpen(false)} /> : null}
      {jsonOpen ? <JsonEditorPopup onClose={() => setJsonOpen(false)} /> : null}
    </>
  );
}