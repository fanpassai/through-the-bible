"use client";

import { useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import "./creation-experience.css";

type Stage = "intro" | "darkness" | "day1" | "day2" | "day3" | "learn";

export default function CreationExperiencePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [lightMade, setLightMade] = useState(false);
  const [watersSeparated, setWatersSeparated] = useState(false);
  const [landRevealed, setLandRevealed] = useState(false);
  const dragStart = useRef<number | null>(null);

  function reset() {
    setStage("intro");
    setLightMade(false);
    setWatersSeparated(false);
    setLandRevealed(false);
  }

  function beginLight() {
    if (lightMade) return;
    setLightMade(true);
  }

  function beginWaters() {
    if (watersSeparated) return;
    setWatersSeparated(true);
  }

  function beginLand() {
    if (landRevealed) return;
    setLandRevealed(true);
  }

  function handleDay2PointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (watersSeparated) return;
    dragStart.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDay2PointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current == null || watersSeparated) return;
    const distance = dragStart.current - event.clientY;
    dragStart.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
    if (distance > 36) beginWaters();
  }

  function handleDay3PointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (landRevealed) return;
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDay3PointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current == null || landRevealed) return;
    const distance = Math.abs(event.clientX - dragStart.current);
    dragStart.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
    if (distance > 36) beginLand();
  }

  return (
    <main className="creationExperience">
      <section className="experienceFrame" aria-label="Genesis creation interactive experience">
        {stage === "intro" && (
          <section className="creationScreen introScreen">
            <div className="cinematicLayer introArt" />
            <div className="ambientMist mistA" />
            <div className="ambientMist mistB" />
            <div className="screenShade" />
            <Header />
            <div className="screenContent introContent">
              <h1>In the<br />beginning, God.</h1>
              <div className="scriptureRef">Genesis 1:1</div>
              <span className="tinyRule" />
              <p>Before the heavens and the earth,<br />before time itself,<br />God existed.</p>
              <button className="storyBegin" type="button" onClick={() => setStage("darkness")}>THE STORY BEGINS <span>⌄</span></button>
            </div>
          </section>
        )}

        {stage === "darkness" && (
          <section className="creationScreen darknessScreen">
            <div className="cinematicLayer darknessArt" />
            <div className="oceanMotion" />
            <div className="ambientMist mistA" />
            <div className="screenShade heavy" />
            <Header />
            <div className="screenContent scriptureContent">
              <div className="scriptureRef">Genesis 1:2</div>
              <h2>The earth was<br />without form and void.</h2>
              <p>Darkness was over the face<br />of the deep, and the Spirit of God<br />was hovering over the waters.</p>
              <button className="touchDarkness" type="button" onClick={() => setStage("day1")}>
                <span className="touchRing" />
                <span>TOUCH THE DARKNESS</span>
              </button>
            </div>
          </section>
        )}

        {stage === "day1" && (
          <section className={`creationScreen day1Screen ${lightMade ? "lightMade" : ""}`}>
            <div className="cinematicLayer day1DarkArt" />
            <div className="cinematicLayer day1LightArt" />
            <div className="lightWave" />
            <div className="oceanMotion" />
            <div className="ambientMist mistA" />
            <div className="screenShade" />
            <Header />
            <div className="screenContent dayContent">
              <div className="dayLabel">Day 1</div>
              <div className="scriptureRef">Genesis 1:3–5</div>
              <h2>{lightMade ? "And there was light." : "Let there be light."}</h2>
              <p>God separated the light from the darkness,<br />and He called the light Day,<br />and the darkness He called Night.</p>
              {!lightMade ? (
                <button className="motionTrigger" type="button" onClick={beginLight}>
                  <span className="touchRing small" />
                  <span>TOUCH TO BRING THE LIGHT</span>
                </button>
              ) : (
                <button className="glassContinue" type="button" onClick={() => setStage("day2")}>
                  <span className="arrowDisc"><ArrowRight size={18} /></span>
                  Continue to Day 2
                </button>
              )}
            </div>
          </section>
        )}

        {stage === "day2" && (
          <section
            className={`creationScreen day2Screen ${watersSeparated ? "watersSeparated" : ""}`}
            onPointerDown={handleDay2PointerDown}
            onPointerUp={handleDay2PointerUp}
          >
            <div className="cinematicLayer day2Art" />
            <div className="upperWaters" />
            <div className="lowerWaters" />
            <div className="firmamentLight" />
            <div className="ambientMist mistA" />
            <div className="screenShade soft" />
            <Header />
            <div className="screenContent dayContent">
              <div className="dayLabel">Day 2</div>
              <div className="scriptureRef">Genesis 1:6–8</div>
              <h2>Open the firmament.</h2>
              <p>God separated the waters<br />which were below the expanse<br />from the waters which were above.</p>
              {!watersSeparated ? (
                <div className="gestureArea">
                  <button className="gestureFallback" type="button" onClick={beginWaters} aria-label="Separate the waters">
                    <span className="gestureArrow">↑</span>
                    <span className="gestureRing" />
                    <span>DRAG UP<br />SEPARATE THE WATERS</span>
                  </button>
                </div>
              ) : (
                <button className="glassContinue" type="button" onClick={() => setStage("day3")}>
                  <span className="arrowDisc"><ArrowRight size={18} /></span>
                  Continue to Day 3
                </button>
              )}
            </div>
          </section>
        )}

        {stage === "day3" && (
          <section
            className={`creationScreen day3Screen ${landRevealed ? "landRevealed" : ""}`}
            onPointerDown={handleDay3PointerDown}
            onPointerUp={handleDay3PointerUp}
          >
            <div className="cinematicLayer day3LandArt" />
            <div className="day3WaterCover" />
            <div className="shoreGlow" />
            <div className="vegetationBloom" />
            <div className="screenShade soft" />
            <Header />
            <div className="screenContent dayContent">
              <div className="dayLabel">Day 3</div>
              <div className="scriptureRef">Genesis 1:9–13</div>
              <h2>The dry land appeared.</h2>
              <p>God called the dry land Earth,<br />and the gathering together of the waters<br />He called Seas. And the earth brought forth vegetation.</p>
              {!landRevealed ? (
                <div className="day3Steps" aria-label="Day 3 sequence">
                  <button type="button" className="day3Step active" onClick={beginLand}>
                    <span className="stepIcon waterIcon" />
                    <strong>1</strong><small>Waters<br />Gather</small>
                  </button>
                  <span>›</span>
                  <button type="button" className="day3Step" onClick={beginLand}>
                    <span className="stepIcon landIcon" />
                    <strong>2</strong><small>Land<br />Appears</small>
                  </button>
                  <span>›</span>
                  <button type="button" className="day3Step" onClick={beginLand}>
                    <span className="stepIcon leafIcon" />
                    <strong>3</strong><small>Vegetation<br />Follows</small>
                  </button>
                </div>
              ) : (
                <button className="glassContinue" type="button" onClick={() => setStage("learn")}>
                  <span className="arrowDisc"><ArrowRight size={18} /></span>
                  Continue to Learn
                </button>
              )}
            </div>
          </section>
        )}

        {stage === "learn" && (
          <section className="learnScreen">
            <Header dark />
            <div className="learnBody">
              <h2>The order of<br />creation.</h2>
              <span className="learnRule" />
              <p>In Genesis 1, we see a beautiful order. First, God forms the realms — light and darkness (Day 1), the heavens (Day 2), and the land and seas (Day 3).</p>
              <p>Then, in Days 4–6, He fills those realms — with the sun, moon and stars, living creatures in the seas and skies, and animals and people on the land.</p>
              <p>Creation reveals a God of purpose, wisdom and extraordinary care.</p>

              <div className="learnCards">
                <article><div className="learnThumb day1Thumb" /><strong>Day 1</strong><span>Light &<br />Darkness</span></article>
                <article><div className="learnThumb day2Thumb" /><strong>Day 2</strong><span>Heavens &<br />Waters</span></article>
                <article><div className="learnThumb day3Thumb" /><strong>Day 3</strong><span>Land, Seas &<br />Vegetation</span></article>
              </div>

              <button className="replayButton" type="button" onClick={reset}><RotateCcw size={17} /> Replay Creation</button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Header({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`creationHeader ${dark ? "dark" : ""}`}>
      <span>THROUGH THE BIBLE</span>
      <span className="menuGlyph">☰</span>
    </header>
  );
}
