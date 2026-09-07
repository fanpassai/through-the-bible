"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import "./creation-experience.css";

type Phase = "void" | "light" | "waters" | "land" | "fill" | "reveal";
type PairKey = "light" | "sky" | "land";

type FillItem = {
  id: string;
  title: string;
  subtitle: string;
  pair: PairKey;
};

const fillItems: FillItem[] = [
  { id: "stars", title: "Sun · Moon · Stars", subtitle: "Day 4", pair: "light" },
  { id: "birds", title: "Birds · Sea Creatures", subtitle: "Day 5", pair: "sky" },
  { id: "life", title: "Animals · Humanity", subtitle: "Day 6", pair: "land" },
];

const realms: { key: PairKey; eyebrow: string; title: string; day: string }[] = [
  { key: "light", eyebrow: "DAY 1", title: "Light & Darkness", day: "FORM" },
  { key: "sky", eyebrow: "DAY 2", title: "Sky & Waters", day: "FORM" },
  { key: "land", eyebrow: "DAY 3", title: "Land & Seas", day: "FORM" },
];

export default function CreationExperiencePage() {
  const [phase, setPhase] = useState<Phase>("void");
  const [touch, setTouch] = useState({ x: 50, y: 55 });
  const [waterSplit, setWaterSplit] = useState(0);
  const [landReveal, setLandReveal] = useState(0);
  const [selected, setSelected] = useState<FillItem | null>(null);
  const [matches, setMatches] = useState<Record<PairKey, string | null>>({ light: null, sky: null, land: null });
  const [feedback, setFeedback] = useState("Choose what fills each realm.");
  const sceneRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartX = useRef<number | null>(null);

  const completedMatches = useMemo(() => Object.values(matches).filter(Boolean).length, [matches]);

  function resetExperience() {
    setPhase("void");
    setTouch({ x: 50, y: 55 });
    setWaterSplit(0);
    setLandReveal(0);
    setSelected(null);
    setMatches({ light: null, sky: null, land: null });
    setFeedback("Choose what fills each realm.");
  }

  function handleVoidTouch(event: React.PointerEvent<HTMLButtonElement>) {
    if (phase !== "void") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTouch({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
    setPhase("light");
    window.setTimeout(() => setPhase("waters"), 2100);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "waters" && phase !== "land") return;
    dragStartY.current = event.clientY;
    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current == null) return;
    if (phase === "waters") {
      const delta = Math.max(0, dragStartY.current - event.clientY);
      setWaterSplit(Math.min(100, delta / 1.2));
    }
    if (phase === "land") {
      const horizontal = Math.abs(event.clientX - (dragStartX.current ?? event.clientX));
      const vertical = Math.abs(event.clientY - dragStartY.current);
      setLandReveal(Math.min(100, Math.max(horizontal, vertical) / 1.4));
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartY.current == null) return;
    if (phase === "waters") {
      if (waterSplit >= 55) {
        setWaterSplit(100);
        window.setTimeout(() => {
          setPhase("land");
          setLandReveal(0);
        }, 850);
      } else {
        setWaterSplit(0);
      }
    } else if (phase === "land") {
      if (landReveal >= 55) {
        setLandReveal(100);
        window.setTimeout(() => setPhase("fill"), 1050);
      } else {
        setLandReveal(0);
      }
    }
    dragStartY.current = null;
    dragStartX.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
  }

  function assignToRealm(key: PairKey) {
    if (!selected) {
      setFeedback("Choose one of the filling elements first.");
      return;
    }
    if (selected.pair !== key) {
      setFeedback("Not quite. Ask: what belongs in this realm?");
      return;
    }
    setMatches((current) => ({ ...current, [key]: selected.id }));
    setFeedback("That fits. Keep building the pattern.");
    setSelected(null);
  }

  function getMatchedItem(key: PairKey) {
    const id = matches[key];
    return fillItems.find((item) => item.id === id) ?? null;
  }

  const sceneClass = ["creationScene", `phase-${phase}`, waterSplit > 0 ? "isSplitting" : "", landReveal > 0 ? "isRevealingLand" : ""].filter(Boolean).join(" ");

  return (
    <main className="creationExperience">
      <section className="experienceShell" aria-label="Creation interactive experience">
        <header className="experienceTopbar">
          <a href="/" className="iconButton" aria-label="Back to Through the Bible"><ArrowLeft size={19} /></a>
          <div className="topbarCopy">
            <span>WEEK 1 · THE BEGINNING</span>
            <strong>1.1 Creation</strong>
          </div>
          <button className="iconButton" type="button" aria-label="Sound design preview"><Volume2 size={18} /></button>
        </header>

        {phase !== "fill" && phase !== "reveal" && (
          <div
            ref={sceneRef}
            className={sceneClass}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              "--touch-x": `${touch.x}%`,
              "--touch-y": `${touch.y}%`,
              "--split": `${waterSplit}%`,
              "--land": `${landReveal}%`,
            } as React.CSSProperties}
          >
            <div className="sceneLayer sceneNight" />
            <div className="sceneLayer sceneCreation" />
            <div className="sceneLayer sceneLand" />
            <div className="sceneVignette" />
            <div className="movingMist mistOne" />
            <div className="movingMist mistTwo" />
            <div className="lightBloom" />
            <div className="waterCurtain waterTop" />
            <div className="waterCurtain waterBottom" />
            <div className="landCurtain" />
            <div className="grain" />

            <div className="sceneCopy">
              {phase === "void" && (
                <>
                  <span className="sceneEyebrow">GENESIS 1:2</span>
                  <h1>“The earth was without form, and void…”</h1>
                  <p>Darkness covered the deep.</p>
                </>
              )}
              {phase === "light" && (
                <>
                  <span className="sceneEyebrow">GENESIS 1:3</span>
                  <h1>“Let there be light.”</h1>
                  <p>And there was light.</p>
                </>
              )}
              {phase === "waters" && (
                <>
                  <span className="sceneEyebrow">DAY 2 · SEPARATION</span>
                  <h1>Separate the waters.</h1>
                  <p>Swipe upward and hold the gesture until the realm opens.</p>
                </>
              )}
              {phase === "land" && (
                <>
                  <span className="sceneEyebrow">DAY 3 · DRY LAND</span>
                  <h1>Draw the waters back.</h1>
                  <p>Drag across the scene until land emerges.</p>
                </>
              )}
            </div>

            {phase === "void" && (
              <button type="button" className="touchTarget" onPointerDown={handleVoidTouch} aria-label="Touch the darkness to bring light">
                <span className="touchPulse"><Sparkles size={20} /></span>
                <span>TOUCH THE DARKNESS</span>
              </button>
            )}

            {phase === "waters" && (
              <div className="gesturePrompt" aria-hidden="true">
                <span className="gestureArrow">↑</span>
                <span>{waterSplit >= 55 ? "KEEP GOING" : "SWIPE UP"}</span>
              </div>
            )}

            {phase === "land" && (
              <div className="gesturePrompt horizontal" aria-hidden="true">
                <span className="gestureArrow">↔</span>
                <span>{landReveal >= 55 ? "LAND IS EMERGING" : "DRAG THE WATER BACK"}</span>
              </div>
            )}

            <div className="sceneProgress" aria-label="Experience progress">
              {["void", "light", "waters", "land", "fill", "reveal"].map((item, index) => {
                const currentIndex = ["void", "light", "waters", "land", "fill", "reveal"].indexOf(phase);
                return <span key={item} className={index <= currentIndex ? "active" : ""} />;
              })}
            </div>
          </div>
        )}

        {phase === "fill" && (
          <section className="fillStage">
            <div className="fillBackdrop" />
            <div className="fillOverlay" />
            <div className="fillHeader">
              <span>NOW NOTICE THE PATTERN</span>
              <h1>God formed the realms.<br />What fills them?</h1>
              <p>Choose an element, then place it into the realm where it belongs.</p>
            </div>

            <div className="fillTray" aria-label="Filling elements">
              {fillItems.map((item) => {
                const alreadyUsed = Object.values(matches).includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`fillToken ${selected?.id === item.id ? "selected" : ""} ${alreadyUsed ? "used" : ""}`}
                    onClick={() => !alreadyUsed && setSelected(item)}
                    disabled={alreadyUsed}
                  >
                    <span>{item.subtitle}</span>
                    <strong>{item.title}</strong>
                  </button>
                );
              })}
            </div>

            <div className="realmGrid">
              {realms.map((realm) => {
                const item = getMatchedItem(realm.key);
                return (
                  <button
                    type="button"
                    key={realm.key}
                    className={`realmCard realm-${realm.key} ${item ? "matched" : ""}`}
                    onClick={() => assignToRealm(realm.key)}
                  >
                    <div className="realmImage" />
                    <div className="realmCopy">
                      <span>{realm.eyebrow} · {realm.day}</span>
                      <strong>{realm.title}</strong>
                      {item ? (
                        <div className="matchedResult"><Check size={15} /> {item.subtitle} · {item.title}</div>
                      ) : (
                        <div className="dropInstruction">Tap to place selected element</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="fillFeedback" aria-live="polite">
              <span>{feedback}</span>
              <strong>{completedMatches} / 3 connections</strong>
            </div>

            <button
              type="button"
              className="primaryAction"
              disabled={completedMatches < 3}
              onClick={() => setPhase("reveal")}
            >
              Reveal the pattern <ChevronRight size={18} />
            </button>
          </section>
        )}

        {phase === "reveal" && (
          <section className="revealStage">
            <div className="revealBackdrop" />
            <div className="revealVeil" />
            <div className="revealContent">
              <span className="revealEyebrow">PATTERN DISCOVERED</span>
              <h1>You didn’t read it.<br />You built it.</h1>
              <p className="revealLead">Days 1–3 form the realms. Days 4–6 fill what God formed.</p>

              <div className="patternGrid">
                <div className="patternRow"><span>DAY 1</span><strong>Light & Darkness</strong><i>→</i><span>DAY 4</span><strong>Sun · Moon · Stars</strong></div>
                <div className="patternRow"><span>DAY 2</span><strong>Sky & Waters</strong><i>→</i><span>DAY 5</span><strong>Birds · Sea Creatures</strong></div>
                <div className="patternRow"><span>DAY 3</span><strong>Land & Seas</strong><i>→</i><span>DAY 6</span><strong>Animals · Humanity</strong></div>
              </div>

              <blockquote>“And God saw every thing that he had made, and, behold, it was very good.”<cite>Genesis 1:31</cite></blockquote>

              <div className="revealInsight">
                <Sparkles size={20} />
                <div><span>UNLOCKED</span><strong>Creation moves from unformed to ordered, inhabited, and good.</strong></div>
              </div>

              <div className="revealActions">
                <button type="button" className="secondaryAction" onClick={resetExperience}><RotateCcw size={17} /> Replay</button>
                <a className="primaryAction" href="/"><span>Return to course</span><ChevronRight size={18} /></a>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
