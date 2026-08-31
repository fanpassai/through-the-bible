import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Highlighter,
  Home,
  Languages,
  Library,
  Map,
  MessageCircleQuestion,
  MoreHorizontal,
  PenLine,
  Play,
  Search,
  Sparkles,
  Type,
  Underline,
  UserRound,
  Users,
} from "lucide-react";
import styles from "./design-lock.module.css";

type NavKey = "home" | "today" | "study" | "bible" | "profile";

const navItems = [
  { key: "home" as const, label: "Home", icon: Home },
  { key: "today" as const, label: "Today", icon: CalendarDays },
  { key: "study" as const, label: "Study", icon: BookOpen },
  { key: "bible" as const, label: "My Bible", icon: Library },
  { key: "profile" as const, label: "Profile", icon: UserRound },
];

function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className={styles.bottomNav} aria-label="Product navigation">
      {navItems.map(({ key, label, icon: Icon }) => (
        <div className={key === active ? styles.navActive : styles.navItem} key={key}>
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
}

function Phone({
  number,
  name,
  mode,
  children,
  dark = false,
}: {
  number: string;
  name: string;
  mode: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <article className={styles.screenCard}>
      <div className={styles.screenMeta}>
        <span>{number}</span>
        <div>
          <h2>{name}</h2>
          <p>{mode}</p>
        </div>
      </div>
      <div className={`${styles.phone} ${dark ? styles.phoneDark : ""}`}>
        <div className={styles.statusBar}><strong>9:41</strong><span>● ● ▰</span></div>
        {children}
      </div>
    </article>
  );
}

function AppHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className={styles.appHeader}>
      <ArrowLeft size={21} />
      <strong>{title}</strong>
      <span className={styles.headerAction}>{action ?? <span />}</span>
    </header>
  );
}

function Opening() {
  return (
    <Phone number="01" name="Opening" mode="Atmosphere · deliberate entry" dark>
      <div className={styles.opening}>
        <div className={styles.openingImage} />
        <div className={styles.openingWash} />
        <div className={styles.openingBrand}>
          <BookOpen size={38} strokeWidth={1.35} />
          <h3>Through the Bible</h3>
          <p>Your journey. His story.</p>
        </div>
        <div className={styles.openingAction}>
          <span>Understand · Connect · Live</span>
          <button>Enter <ArrowRight size={18} /></button>
        </div>
      </div>
    </Phone>
  );
}

function SignIn() {
  return (
    <Phone number="02" name="Sign in" mode="Trust · account-first">
      <div className={styles.signIn}>
        <div className={styles.smallBrand}><BookOpen size={22} /><span>Through the Bible</span></div>
        <div className={styles.signInLead}>
          <span className={styles.eyebrow}>YOUR STUDY · REMEMBERED</span>
          <h3>Welcome to a Bible you can return to.</h3>
          <p>Your highlights, questions, notes and progress stay with you across every device.</p>
        </div>
        <div className={styles.authStack}>
          <button className={styles.googleButton}><span className={styles.googleMark}>G</span>Continue with Google</button>
          <div className={styles.or}><span />or<span /></div>
          <label>Email address<input placeholder="you@example.com" /></label>
          <button className={styles.primaryButton}>Email me a secure link <ArrowRight size={18} /></button>
          <p className={styles.privacy}>Private by default. Nothing is shared with your instructor unless you choose.</p>
        </div>
      </div>
    </Phone>
  );
}

function HomeScreen() {
  return (
    <Phone number="03" name="Home" mode="Orientation · one next step">
      <div className={styles.appBody}>
        <div className={styles.homeTop}>
          <div><span className={styles.kicker}>GOOD EVENING</span><h3>Jasmine</h3></div>
          <div className={styles.avatar}>J</div>
        </div>
        <section className={styles.journeyCard}>
          <div className={styles.cardLabel}>CONTINUE YOUR JOURNEY <span>60%</span></div>
          <h4>Week 01 · The Beginning</h4>
          <p>Creation, rupture and the first promise.</p>
          <div className={styles.progressTrack}><span style={{ width: "60%" }} /></div>
          <div className={styles.timeLine}><Clock3 size={14} /> 12 minutes remaining today</div>
          <button className={styles.inkButton}>Continue study <ArrowRight size={17} /></button>
        </section>
        <div className={styles.sectionTitle}><h4>Today</h4><span>SUNDAY · AUG 31</span></div>
        <div className={styles.dailyList}>
          <Daily icon={BookOpen} title="Daily reading" subtitle="Genesis 2:15–17" state="8 min" />
          <Daily icon={Sparkles} title="Devotional" subtitle="Intentional God" state="6 min" />
          <Daily icon={Check} title="Review" subtitle="2 passages ready" state="3 min" />
        </div>
        <div className={styles.snapshot}>
          <strong>Your week</strong>
          <div><span><b>4</b> passages</span><span><b>6</b> highlights</span><span><b>2</b> notes</span></div>
        </div>
      </div>
      <BottomNav active="home" />
    </Phone>
  );
}

function Daily({ icon: Icon, title, subtitle, state, done }: { icon: typeof BookOpen; title: string; subtitle: string; state: string; done?: boolean }) {
  return (
    <div className={`${styles.dailyRow} ${done ? styles.done : ""}`}>
      <span className={styles.iconTile}>{done ? <Check size={18} /> : <Icon size={18} />}</span>
      <div><strong>{title}</strong><small>{subtitle}</small></div>
      <span className={styles.rowState}>{state}</span>
    </div>
  );
}

function TodayScreen() {
  return (
    <Phone number="04" name="Today" mode="Rhythm · no choice paralysis">
      <div className={styles.appBody}>
        <div className={styles.simpleTop}><div><span className={styles.kicker}>SUNDAY · AUGUST 31</span><h3>Today</h3><p>Three quiet steps. Begin where you are.</p></div></div>
        <section className={styles.nextAction}>
          <div className={styles.stepCount}>1 of 3</div>
          <span className={styles.bigIcon}><BookOpen size={23} /></span>
          <div><span className={styles.eyebrow}>NEXT</span><h4>Read Genesis 2:15–17</h4><p>Notice the gift, the work and the boundary.</p></div>
          <button className={styles.primaryButton}>Begin reading <Play size={16} fill="currentColor" /></button>
        </section>
        <div className={styles.rhythmList}>
          <Daily icon={Check} title="Orientation" subtitle="Week 01 overview" state="Done" done />
          <Daily icon={Sparkles} title="Reflect" subtitle="Intentional God" state="6 min" />
          <Daily icon={Check} title="Review" subtitle="Two passages" state="3 min" />
        </div>
        <div className={styles.quoteNote}>“The next unfinished action should be the strongest thing on the screen.”</div>
      </div>
      <BottomNav active="today" />
    </Phone>
  );
}

function StudyScreen() {
  const items = [
    [BookOpen, "Bible Study", "Courses and lessons"],
    [Clock3, "Timeline", "See God’s story"],
    [Map, "Maps", "Explore locations"],
    [Languages, "Word Studies", "Language and context"],
    [Users, "People & Places", "Profiles and background"],
    [FileText, "Resources", "Articles, charts and video"],
  ] as const;
  return (
    <Phone number="05" name="Study" mode="Tools · structured exploration">
      <div className={styles.appBody}>
        <div className={styles.simpleTop}><div><span className={styles.kicker}>YOUR STUDY CENTER</span><h3>Study</h3><p>Go deeper without losing your place.</p></div><Search size={21} /></div>
        <section className={styles.studyResume}>
          <div><span className={styles.eyebrow}>IN PROGRESS</span><h4>Week 01 · The Beginning</h4><p>Place · Fill · Connect · Unlock</p></div>
          <button><ChevronRight size={20} /></button>
        </section>
        <div className={styles.studyMenu}>
          {items.map(([Icon, title, sub]) => <div className={styles.menuRow} key={title}><span className={styles.iconTile}><Icon size={18} /></span><div><strong>{title}</strong><small>{sub}</small></div><ChevronRight size={17} /></div>)}
        </div>
      </div>
      <BottomNav active="study" />
    </Phone>
  );
}

function LessonScreen() {
  const steps = ["Place", "Fill", "Connect", "Unlock", "Devotion"];
  return (
    <Phone number="06" name="Lesson workspace" mode="Learning · contextual steps">
      <AppHeader title="Week 01" action={<MoreHorizontal size={21} />} />
      <div className={styles.lessonBody}>
        <span className={styles.kicker}>THE BEGINNING · GENESIS 1–3</span>
        <h3>See the story before studying the pieces.</h3>
        <p>Creation, rupture and promise form the first movement of the biblical story.</p>
        <div className={styles.lessonProgress}><span style={{ width: "42%" }} /></div>
        <div className={styles.lessonSteps}>
          {steps.map((step, i) => <div className={i === 1 ? styles.stepActive : i < 1 ? styles.stepDone : styles.step} key={step}><span>{i < 1 ? <Check size={13} /> : i + 1}</span><small>{step}</small></div>)}
        </div>
        <section className={styles.activityCard}>
          <div className={styles.activityTop}><span className={styles.eyebrow}>FILL · GUIDED NOTES</span><span>1 / 10</span></div>
          <h4>The Bible begins with <u>________</u>, not with humanity.</h4>
          <label>Your answer<input value="God" readOnly /></label>
          <div className={styles.correctBox}><span><Check size={17} /></span><div><strong>Correct</strong><p>Scripture begins with God as Creator. Everything else enters a story He initiates.</p></div></div>
          <button className={styles.primaryButton}>Next question <ArrowRight size={17} /></button>
        </section>
      </div>
      <BottomNav active="study" />
    </Phone>
  );
}

function ScriptureScreen() {
  return (
    <Phone number="07" name="Scripture Reader" mode="Reading · selection-driven tools">
      <AppHeader title="Genesis 2:15–17" action={<Type size={21} />} />
      <div className={styles.readerBody}>
        <div className={styles.readerMeta}><span>KING JAMES VERSION</span><span><Search size={16} /> <Bookmark size={16} /></span></div>
        <div className={styles.scriptureText}>
          <p><sup>15</sup> And the Lord God took the man, and put him into the garden of Eden to dress it and to keep it.</p>
          <p className={styles.selectedVerse}><sup>16</sup> And the Lord God commanded the man, saying, Of every tree of the garden thou mayest freely eat:</p>
          <p><sup>17</sup> But of the tree of the knowledge of good and evil, thou shalt not eat of it.</p>
        </div>
        <div className={styles.selectionSheet}>
          <div className={styles.sheetHandle} />
          <div className={styles.selectedQuote}>“And the Lord God commanded the man…”</div>
          <div className={styles.toolGrid}>
            {[[Highlighter,"Highlight"],[Underline,"Underline"],[PenLine,"Note"],[Bookmark,"Save"],[MessageCircleQuestion,"Ask"],[Languages,"Study"]].map(([Icon,label]) => {
              const ToolIcon = Icon as typeof Highlighter;
              return <div key={label as string}><span><ToolIcon size={19} /></span><small>{label as string}</small></div>;
            })}
          </div>
        </div>
      </div>
    </Phone>
  );
}

function MyBibleScreen() {
  const items = [
    [Highlighter,"Highlights","26 passages"], [Underline,"Underlined","13 passages"], [PenLine,"My Notes","18 notes"],
    [MessageCircleQuestion,"Questions I Asked","7 questions"], [Bookmark,"Saved Scriptures","22 passages"], [Languages,"Word Studies","9 studies"]
  ] as const;
  return (
    <Phone number="08" name="My Bible" mode="Memory · personal knowledge vault">
      <div className={styles.appBody}>
        <div className={styles.simpleTop}><div><span className={styles.kicker}>YOUR STUDY · REMEMBERED</span><h3>My Bible</h3><p>Everything you marked, asked and kept.</p></div><Search size={21} /></div>
        <div className={styles.libraryGrid}>
          {items.map(([Icon,title,count]) => <div className={styles.libraryTile} key={title}><span><Icon size={19} /></span><strong>{title}</strong><small>{count}</small><ChevronRight size={15} /></div>)}
        </div>
        <section className={styles.memoryCard}>
          <span className={styles.eyebrow}>FROM YOUR STUDY</span>
          <p>“Everything else enters a story that God initiates.”</p>
          <small>Your note on Genesis 1:1 · 4 weeks ago</small>
        </section>
        <div className={styles.recentRow}><div><span className={styles.eyebrow}>RECENTLY STUDIED</span><strong>Genesis 2:15–17</strong></div><ChevronRight size={18} /></div>
      </div>
      <BottomNav active="bible" />
    </Phone>
  );
}

function DevotionalScreen() {
  return (
    <Phone number="09" name="Devotional" mode="Reflection · immersive reading">
      <div className={styles.devotional}>
        <div className={styles.devImage} />
        <div className={styles.devTop}><ArrowLeft size={21} /><span>DAY 01 · WEEK 01</span><Bookmark size={20} /></div>
        <div className={styles.devTitle}><span>INTENTIONAL GOD</span><h3>Nothing here is accidental.</h3><p>Creation reveals a God who forms before He fills—and prepares before He places.</p></div>
        <div className={styles.devArticle}>
          <div className={styles.readTime}>8 MIN READ <span>Genesis 1:1–31</span></div>
          <p>Before humanity was asked to cultivate the earth, God had already shaped a world capable of receiving life.</p>
          <blockquote>What if the order you cannot yet understand is preparation, not delay?</blockquote>
          <button className={styles.primaryButton}>Continue reading <ArrowRight size={17} /></button>
        </div>
      </div>
    </Phone>
  );
}

function RecapScreen() {
  return (
    <Phone number="10" name="Your Week" mode="Progress · personal storytelling">
      <AppHeader title="Your Week" action={<UserRound size={20} />} />
      <div className={styles.recapBody}>
        <span className={styles.kicker}>WEEK 01 · AUG 25–31</span>
        <h3>You returned to the beginning—and stayed with the story.</h3>
        <div className={styles.weekRing}><div><strong>4</strong><span>study days</span></div></div>
        <div className={styles.statGrid}>
          <div><strong>7</strong><span>passages read</span></div><div><strong>24</strong><span>verses read</span></div>
          <div><strong>6</strong><span>highlights</span></div><div><strong>2</strong><span>notes written</span></div>
        </div>
        <section className={styles.insightCard}>
          <span className={styles.eyebrow}>YOUR MOST REVISITED PASSAGE</span>
          <h4>Genesis 2:15–17</h4>
          <p>You returned to the relationship between gift, responsibility and boundary three times.</p>
        </section>
        <div className={styles.weekMessage}><Sparkles size={20} /><p>Next week, watch how God’s promise begins moving through one family.</p></div>
      </div>
      <BottomNav active="profile" />
    </Phone>
  );
}

export default function DesignLockPage() {
  return (
    <main className={styles.lockPage}>
      <header className={styles.boardHeader}>
        <div>
          <span className={styles.boardEyebrow}>THROUGH THE BIBLE · PRODUCT DESIGN CONTRACT</span>
          <h1>Ten screens.<br />One coherent system.</h1>
        </div>
        <div className={styles.boardSummary}>
          <p>A personal Bible-learning environment—not a magazine, course website or repeated article template.</p>
          <div className={styles.tokenRow}>
            <span><i className={styles.tokenPaper} />Paper</span><span><i className={styles.tokenInk} />Ink</span><span><i className={styles.tokenBlue} />Action</span><span><i className={styles.tokenGold} />Sacred accent only</span>
          </div>
        </div>
      </header>
      <section className={styles.systemRules}>
        <div><b>GLOBAL NAVIGATION</b><span>Home · Today · Study · My Bible · Profile</span></div>
        <div><b>LESSON RHYTHM</b><span>Place · Fill · Connect · Unlock · Devotion</span></div>
        <div><b>DAILY LOOP</b><span>Read · Reflect · Review</span></div>
        <div><b>VISUAL RULE</b><span>One token system; different composition for every task</span></div>
      </section>
      <section className={styles.screenGrid}>
        <Opening />
        <SignIn />
        <HomeScreen />
        <TodayScreen />
        <StudyScreen />
        <LessonScreen />
        <ScriptureScreen />
        <MyBibleScreen />
        <DevotionalScreen />
        <RecapScreen />
      </section>
      <footer className={styles.boardFooter}>
        <BookOpen size={24} />
        <div><strong>Locked system principle</strong><p>Consistency comes from shared type, spacing, color, navigation and behavior—not from repeating the same page layout.</p></div>
      </footer>
    </main>
  );
}
