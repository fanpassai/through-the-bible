"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import ProductExperience from "./product-experience";

export default function OpeningGate() {
  const [entered, setEntered] = useState(false);

  if (entered) return <ProductExperience />;

  return (
    <main className="ttb-opening-gate" aria-label="Through the Bible opening screen">
      <div className="ttb-opening-art" aria-hidden="true" />
      <button
        className="ttb-opening-enter-hit"
        type="button"
        onClick={() => setEntered(true)}
        aria-label="Enter Through the Bible"
      >
        <span>Enter</span><ArrowRight />
      </button>
    </main>
  );
}
