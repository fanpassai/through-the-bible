"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown, ArrowRight, BookOpen, CalendarDays, Check, ChevronRight,
  Link2, LockKeyhole, MapPin, Menu, Minus, Sparkles,
} from "lucide-react";
import WeekOne from "./week-one";

type CourseView = "intro" | "week1";

const MOVEMENTS = [
  {
    key: "creation",
    label: "Creation",
    title: "The story begins with what is good.",
    body: "God creates a world that is ordered, purposeful and alive with His presence. Before Scripture tells us what broke, it shows us what God intended.",
    why: "Creation gives the Bible its original pattern: God with His people, ruling a good world under His word.",
    art: "/images/course-intro-creation-v2.webp",
  },
  {
    key: "fall",
    label: "Fall",
    title: "Trust fractures. The world follows.",
    body: "Human rebellion breaks fellowship, introduces death and disorders life. Yet even inside judgment, God refuses to surrender His purpose.",
    why: "The rest of Scripture answers the crisis introduced here: what will God do about sin, death and exile?",
    art: "/images/course-intro-fall.png",
  },
  {
    key: "redemption",
    label: "Redemption",
    title: "A promise becomes a rescue.",
    body: "Promise, covenant, Israel, sacrifice and kingdom move the story forward until every thread converges in Jesus Christ.",
    why: "Christ does not appear in a vacuum. He fulfills a story God has been carrying from the beginning.",
    art: "/images/course-intro-redemption-v2.webp",
  },
  {
    key: "restoration",
    label: "Restoration",
    title: "The story ends with creation made new.",
    body: "Christ’s victory opens resurrection hope, the renewal of all things and God dwelling with His people in a restored creation.",
    why: "Restoration is not an appendix to the Bible. It is the destination toward which the whole story moves.",
    art: "/images/course-intro-restoration.png",
  },
] as const;

const WEEKS = [
  ["01", "Creation, Rupture & the First Promise", "Genesis 1–3", "OPEN"],
  ["02", "Noah, Babel & the Nations", "Genesis 4–11", "NEXT"],
  ["03", "Abraham & the Family of Promise", "Genesis 12–50", "LOCKED"],
  ["04", "Exodus, Passover & the Law", "Exodus–Deuteronomy", "LOCKED"],
  ["05", "Land, Kings & a Promised King", "Joshua–2 Samuel", "LOCKED"],
  ["06", "A Kingdom Divided", "Kings · Prophets · Exile", "LOCKED"],
  ["07", "Return, Waiting & Messiah", "Ezra–Malachi", "LOCKED"],
  ["08", "The Center of the Story", "Jesus · Cross · Resurrection", "LOCKED"],
  ["09", "From Jerusalem to the Nations", "Acts · Church · Grace", "LOCKED"],
  ["10", "How the Story Ends", "Return · Resurrection · New Creation", "LOCKED"],
] as const;

const RHYTHM: { label: string; description: string; icon: ReactNode }[] = [
  { label: "Story", description: "See what happened and why it matters.", icon: <BookOpen /> },
  { label: "Place", description: "Put people and events in their proper order.", icon: <MapPin /> },
  { label: "Fill", description: "Retrieve the truths worth carrying.", icon: <Minus /> },
  { label: "Connect", description: "Trace Scripture until the threads reveal Christ.", icon: <Link2 /> },
  { label: "Unlock", description: "Explain the story in your own words.", icon: <LockKeyhole /> },
  { label: "Devotion", description: "Carry the lesson into seven days of deeper study.", icon: <Sparkles /> },
];

export default function CourseExperience() {
  const [view, setView] = useState<CourseView>("intro");

  useEffect(() => {
    if (sessionStorage.getItem("ttb-course-active-view") === "week1") setView("week1");
  }, []);

  function enterWeekOne() {
    sessionStorage.setItem("ttb-course-active-view", "week1");
    setView("week1");
  }

  function returnToCourse() {
    sessionStorage.removeItem("ttb-course-active-view");
    setView("intro");
  }

  return view === "week1" ? <WeekOne onCourseHome={returnToCourse} /> : <CourseIntro enterWeekOne={enterWeekOne} />;
}

function CourseIntro({ enterWeekOne }: { enterWeekOne: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [activeMovement, setActiveMovement] = useState("creation");

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-course-movement]"));
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) setActiveMovement((entry.target as HTMLElement).dataset.courseMovement || "creation");
      }),
      { root, threshold: 0.56 },
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  function goTo(id: string) {
    scroller.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="product-shell course-shell">
      <aside className="course-desktop-rail">
        <div className="course-wordmark"><BookOpen /><span><b>THROUGH THE BIBLE</b><small>THE BIG STORY · COURSE INTRODUCTION</small></span></div>
        <div className="course-rail-copy"><span>ONE BIBLE · ONE UNFOLDING STORY</span><h1>See the whole story before you enter the first week.</h1><p>Creation. Fall. Redemption. Restoration. This is the map we will return to for ten weeks.</p></div>
        <nav aria-label="Course introduction sections">
          <button onClick={() => goTo("course-shape")}><small>01</small><b>The four movements</b><ChevronRight /></button>
          <button onClick={() => goTo("course-rhythm")}><small>02</small><b>How you will study</b><ChevronRight /></button>
          <button onClick={() => goTo("course-weeks")}><small>03</small><b>The ten-week map</b><ChevronRight /></button>
        </nav>
        <button className="course-rail-cta" onClick={enterWeekOne}>Enter Week 01 <ArrowRight /></button>
      </aside>

      <section className="phone-canvas course-canvas" aria-label="Through the Bible course introduction">
        <div className="course-intro-scroll" ref={scroller}>
          <section className="course-hero" id="course-top">
            <img src="/images/course-intro-hero-v2.webp" alt="An ancient traveler overlooking a vast landscape that moves from garden to radiant city" />
            <span className="course-hero-shade" />
            <header className="course-mobile-header"><BookOpen /><span><b>THROUGH THE BIBLE</b><small>COURSE INTRODUCTION</small></span><button aria-label="Open course map" onClick={() => goTo("course-weeks")}><Menu /></button></header>
            <div className="course-hero-copy">
              <p>ONE BIBLE · ONE UNFOLDING STORY</p>
              <h1>See the story whole.</h1>
              <span>Trace the one story Scripture has been telling—from a garden, through a cross, toward a city filled with God&apos;s presence.</span>
            </div>
            <div className="course-story-compass" aria-label="Creation, Fall, Redemption, Restoration"><span>Creation</span><i /><span>Fall</span><i /><span>Redemption</span><i /><span>Restoration</span></div>
            <button className="course-hero-cta" onClick={() => goTo("course-shape")}><span><small>ENTER THE STORY</small><strong>Discover the four movements</strong></span><ArrowDown /></button>
          </section>

          <section className="course-shape" id="course-shape">
            <header className="course-section-intro"><p>THE STORY COMPASS</p><h2>Four movements.<br />One divine purpose.</h2><span>Use this living map to locate every person, promise and passage you encounter.</span></header>
            <nav className="course-movement-nav" aria-label="The four movements">
              {MOVEMENTS.map(movement => <button key={movement.key} className={activeMovement === movement.key ? "active" : ""} onClick={() => goTo(`movement-${movement.key}`)}><span />{movement.label}</button>)}
            </nav>
            <div className="course-movement-list">
              {MOVEMENTS.map((movement, index) => (
                <article id={`movement-${movement.key}`} data-course-movement={movement.key} className={`course-movement course-movement-${movement.key}`} key={movement.key}>
                  {typeof movement.art === "string" && movement.art.startsWith("/") ? <img src={movement.art} alt="" aria-hidden="true" /> : null}
                  <span className="course-movement-shade" />
                  <div className="course-movement-copy"><small>{movement.label.toUpperCase()}</small><h3>{movement.title}</h3><p>{movement.body}</p><blockquote><b>WHY IT MATTERS</b>{movement.why}</blockquote>{index < MOVEMENTS.length - 1 ? <button onClick={() => goTo(`movement-${MOVEMENTS[index + 1].key}`)}>Continue to {MOVEMENTS[index + 1].label}<ArrowDown /></button> : null}</div>
                </article>
              ))}
            </div>
            <button className="course-section-next" onClick={() => goTo("course-rhythm")}><span><small>YOU KNOW THE SHAPE</small><strong>Now learn how the course works</strong></span><ArrowRight /></button>
          </section>

          <section className="course-rhythm" id="course-rhythm">
            <header className="course-section-intro"><p>EVERY WEEK</p><h2>You’ll do more than listen.</h2><span>The content changes. The learning rhythm stays familiar, so your energy goes into seeing the story.</span></header>
            <div className="course-rhythm-list">{RHYTHM.map((step, index) => <article key={step.label}><span>{step.icon}</span><div><small>0{index + 1}</small><h3>{step.label}</h3><p>{step.description}</p></div></article>)}</div>
            <aside className="course-friday"><CalendarDays /><div><small>BETWEEN SUNDAYS</small><h3>The next lesson opens Friday.</h3><p>Preview it before class or come in fresh. Either way, the course remains available for review, reflection and practice.</p></div></aside>
            <button className="course-section-next dark" onClick={() => goTo("course-weeks")}><span><small>THE RHYTHM IS YOURS</small><strong>See the ten-week journey</strong></span><ArrowRight /></button>
          </section>

          <section className="course-weeks" id="course-weeks">
            <header className="course-section-intro"><p>THE COURSE MAP</p><h2>Ten weeks.<br />One unfolding story.</h2><span>You do not have to memorize the Bible in ten weeks. The goal is to give you a map—and teach you how to keep using it.</span></header>
            <div className="course-week-list">{WEEKS.map(([number, title, reference, status], index) => (
              <button key={number} className={index === 0 ? "available" : ""} onClick={index === 0 ? enterWeekOne : undefined} disabled={index !== 0}>
                <span className="course-week-number">{number}</span><span className="course-week-copy"><small>{status === "OPEN" ? "AVAILABLE NOW" : status === "NEXT" ? "COMING NEXT" : "COURSE JOURNEY"}</small><strong>{title}</strong><em>{reference}</em></span>
                <span className="course-week-state">{index === 0 ? <ArrowRight /> : <LockKeyhole />}</span>
              </button>
            ))}</div>
            <footer className="course-final-entry"><span><Check /></span><small>YOUR MAP IS READY</small><h2>Begin where every human story begins.</h2><p>Enter Week 01 and follow creation, rupture and the first promise through Genesis 1–3.</p><button onClick={enterWeekOne}>Begin Week 01 <ArrowRight /></button></footer>
          </section>
        </div>
      </section>
    </main>
  );
}
