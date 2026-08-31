import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  FileText,
  Highlighter,
  Home,
  Languages,
  Library,
  Map,
  Menu,
  MessageCircleQuestion,
  MoreHorizontal,
  PenLine,
  Search,
  Share2,
  Sparkles,
  Type,
  Underline,
  UserRound,
  Users,
} from "lucide-react";
import styles from "./design-lock.module.css";

type NavKey = "home" | "today" | "study" | "bible" | "profile";
type AppIcon = typeof Home;

const navItems: Array<{ key: NavKey; label: string; icon: AppIcon }> = [
  { key: "home", label: "Home", icon: Home },
  { key: "today", label: "Today", icon: CalendarDays },
  { key: "study", label: "Study", icon: BookOpen },
  { key: "bible", label: "My Bible", icon: Library },
  { key: "profile", label: "Profile", icon: UserRound },
];

function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className={styles.bottomNav} aria-label="Product navigation">
      {navItems.map(({ key, label, icon: Icon }) => (
        <span className={key === active ? styles.navActive : styles.navItem} key={key}>
          <Icon size={18} strokeWidth={1.65} />
          <small>{label}</small>
        </span>
      ))}
    </nav>
  );
}

function Phone({ number, name, children }: { number: string; name: string; children: React.ReactNode }) {
  return (
    <article className={styles.screenCard} data-screen={name}>
      <div className={styles.screenMeta}><span>{number}. {name}</span></div>
      <div className={styles.phone}>
        <div className={styles.statusBar}><strong>9:41</strong><span>● ● ▰</span></div>
        {children}
      </div>
    </article>
  );
}

function AppHeader({ title, back = false, menu = false, action }: { title: string; back?: boolean; menu?: boolean; action?: React.ReactNode }) {
  return (
    <header className={styles.appHeader}>
      <span>{back ? <ArrowLeft size={20} /> : menu ? <Menu size={19} /> : null}</span>
      <div><strong>{title}</strong></div>
      <span className={styles.headerActions}>{action ?? <MoreHorizontal size={19} />}</span>
    </header>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.brandCompact : styles.brandMark}>
      <BookOpen size={compact ? 22 : 37} strokeWidth={1.35} />
      <span>Through<br />the Bible</span>
    </div>
  );
}

function SplashScreen() {
  return (
    <Phone number="1" name="Splash screen">
      <div className={styles.splash}>
        <div className={styles.splashImage} /><div className={styles.splashWash} />
        <div className={styles.splashBrand}><BrandMark /><p>Your Journey · His Story.</p></div>
        <div className={styles.splashFooter}><span>Understand · Connect · Live.</span><button type="button">Enter <ArrowRight size={16} /></button></div>
      </div>
    </Phone>
  );
}

function SignInScreen() {
  return (
    <Phone number="2" name="Sign in">
      <div className={styles.signIn}>
        <BrandMark compact />
        <section className={styles.signInCopy}><span className={styles.eyebrow}>YOUR STUDY · REMEMBERED</span><h2>Welcome back to the story.</h2><p>Save highlights, notes, questions, devotionals and progress across every device.</p></section>
        <div className={styles.authStack}>
          <button className={styles.outlineButton} type="button"><b>G</b> Continue with Google</button>
          <div className={styles.dividerText}><span />or<span /></div>
          <label>Email address<input aria-label="Email address" placeholder="you@example.com" /></label>
          <button className={styles.blackButton} type="button">Email me a secure link <ArrowRight size={16} /></button>
          <small>Private by default. Your personal study stays yours.</small>
        </div>
      </div>
    </Phone>
  );
}

function ListRow({ icon: Icon, title, subtitle, state, done = false }: { icon: AppIcon; title: string; subtitle: string; state?: string; done?: boolean }) {
  return (
    <div className={`${styles.listRow} ${done ? styles.rowDone : ""}`}>
      <span className={styles.iconTile}>{done ? <Check size={16} /> : <Icon size={16} />}</span>
      <div><strong>{title}</strong><small>{subtitle}</small></div>
      {state ? <em>{state}</em> : <ChevronRight size={16} />}
    </div>
  );
}

function HomeScreen() {
  return (
    <Phone number="3" name="Home">
      <div className={styles.appBody}>
        <div className={styles.greeting}><div><span>Good Evening,</span><h2>Jasmine</h2></div><span className={styles.avatar}>J</span></div>
        <section className={styles.journeyCard}>
          <span className={styles.cardKicker}>CONTINUE YOUR JOURNEY</span><h3>Week 01: The Beginning</h3><p>Creation, rupture and the first promise.</p>
          <div className={styles.progressLine}><span style={{ width: "60%" }} /></div>
          <div className={styles.cardMeta}><span><Clock3 size={13} />12 min remaining today</span><b>60%</b></div>
          <button className={styles.blackButton} type="button">Continue Reading <ArrowRight size={16} /></button>
        </section>
        <div className={styles.sectionHeading}><h3>Today</h3><span>SUNDAY, AUG 31</span></div>
        <div className={styles.listCard}><ListRow icon={BookOpen} title="Daily Reading" subtitle="Genesis 2:15–17" /><ListRow icon={Sparkles} title="Devotional" subtitle="Intentional God" /><ListRow icon={Check} title="Review" subtitle="2 passages to review" /></div>
        <div className={styles.weekStrip}><span><b>4</b>passages</span><span><b>6</b>highlights</span><span><b>2</b>notes</span><span><b>3</b>days</span></div>
      </div><BottomNav active="home" />
    </Phone>
  );
}

function TodayScreen() {
  return (
    <Phone number="4" name="Today">
      <AppHeader title="Today" menu />
      <div className={styles.todayBody}>
        <div className={styles.dateLine}>SUNDAY, AUGUST 31</div>
        <section className={styles.todayHero}><div className={styles.todayImage} /><div className={styles.todayShade} /><div className={styles.todayCopy}><span>GENESIS 2:15–17</span><h2>Placed with purpose.</h2><p>Read the gift, the work and the boundary.</p><button type="button">Read Passage <ArrowRight size={15} /></button></div></section>
        <h3 className={styles.yourDay}>Your Day</h3>
        <div className={styles.listCard}><ListRow icon={BookOpen} title="Daily Reading" subtitle="Genesis 2:15–17" state="8 min" /><ListRow icon={Sparkles} title="Devotional" subtitle="Intentional God" state="6 min" /><ListRow icon={PenLine} title="Reflection & Prayer" subtitle="One guided response" state="5 min" /><ListRow icon={FileText} title="Your Notes" subtitle="Continue writing…" /></div>
      </div><BottomNav active="today" />
    </Phone>
  );
}

const scriptureParagraphs = [
  ["8", "So Abram moved his tents and went and lived near the oaks of Mamre at Hebron, and there he built an altar to the Lord."],
  ["9", "And the Lord God called unto Abram, and asked him to trust the promise before he could see it."],
  ["10", "The land could not support every certainty he wanted to carry, so he learned to walk by promise."],
] as const;

function ReaderDock() {
  const tools: Array<[AppIcon, string]> = [[Highlighter,"Highlight"],[PenLine,"Note"],[Underline,"Underline"],[Bookmark,"Bookmark"],[MoreHorizontal,"More"]];
  return <div className={styles.readerDock}>{tools.map(([Icon,label])=><span key={label}><Icon size={18} /><small>{label}</small></span>)}</div>;
}

function ScriptureReader({ actions = false }: { actions?: boolean }) {
  return (
    <Phone number={actions ? "6" : "5"} name={actions ? "Scripture actions" : "Scripture reader"}>
      <AppHeader title="Genesis 13" back action={<span className={styles.readerHeaderTools}>ESV <Search size={16} /><Type size={17} /></span>} />
      <div className={styles.readerPage}>
        <div className={styles.scriptureCopy}>{scriptureParagraphs.map(([verse,text],i)=><p className={i===0 ? styles.highlightedText : ""} key={verse}><sup>{verse}</sup>{text}</p>)}</div>
        {!actions && <ReaderDock />}
        {actions && <><div className={styles.readerDim} /><div className={styles.actionSheet}><span className={styles.sheetHandle} /><div className={styles.actionGrid}>{[[Highlighter,"Highlight"],[Underline,"Underline"],[PenLine,"Note"],[Bookmark,"Bookmark"],[CircleHelp,"Question"],[Languages,"Word Study"],[Share2,"Share"],[Copy,"Copy"],[MoreHorizontal,"More"]].map(([Icon,label])=>{const Tool=Icon as AppIcon;return <span key={label as string}><i><Tool size={18} /></i><small>{label as string}</small></span>;})}</div><button type="button">Cancel</button></div></>}
      </div>
    </Phone>
  );
}

function NoteScreen() {
  return (
    <Phone number="7" name="Note view">
      <AppHeader title="My Notes" back />
      <div className={styles.noteBody}><section className={styles.notePaper}><h2>Trusting God&apos;s Plan</h2><span>Genesis 13</span><small>August 31, 2026</small><p>God&apos;s plan is always better than mine. Abram trusted God even when he didn&apos;t see the full picture.</p><p>I need to keep my heart surrendered daily.</p><div><em>#Trust</em><em>#Faith</em><em>#Genesis13</em></div></section><div className={styles.noteActions}><PenLine size={18} /><Share2 size={18} /><Bookmark size={18} /><MoreHorizontal size={18} /></div></div>
    </Phone>
  );
}

function StudyScreen() {
  const rows: Array<[AppIcon,string,string]> = [[BookOpen,"Bible Study","Courses & Lessons"],[Clock3,"Timeline","See God's Story"],[Map,"Maps","Explore Locations"],[Languages,"Word Studies","Original Language"],[Users,"People & Places","Profiles & Background"],[FileText,"Resources","Articles, Videos, Charts"]];
  return <Phone number="8" name="Study center"><div className={styles.appBody}><h2 className={styles.screenTitle}>Study</h2><p className={styles.screenSub}>Your Study Center</p><div className={styles.tallList}>{rows.map(([Icon,title,subtitle])=><ListRow icon={Icon} title={title} subtitle={subtitle} key={title} />)}</div></div><BottomNav active="study" /></Phone>;
}

function MyBibleScreen() {
  const rows: Array<[AppIcon,string,string]> = [[Highlighter,"Highlights","28 Highlights"],[Underline,"Underlined","13 Underlined"],[PenLine,"My Notes","18 Notes"],[MessageCircleQuestion,"Questions I Asked","7 Questions"],[Bookmark,"Saved Scriptures","22 Passages"],[Languages,"Word Studies","9 Studies"],[Clock3,"Recently Studied","Genesis 12–15"]];
  return <Phone number="9" name="My Bible"><div className={styles.appBody}><h2 className={styles.screenTitle}>My Bible</h2><div className={styles.tallList}>{rows.map(([Icon,title,subtitle])=><ListRow icon={Icon} title={title} subtitle={subtitle} key={title} />)}</div><section className={styles.memoryStrip}><span>FROM YOUR STUDY</span><p>“God&apos;s promise does not need visible proof to remain true.”</p><small>Genesis 13 · 4 weeks ago</small></section></div><BottomNav active="bible" /></Phone>;
}

function DevotionalScreen() {
  return <Phone number="10" name="Devotional"><div className={styles.devotional}><div className={styles.devImage} /><div className={styles.devShade} /><div className={styles.devTools}><ArrowLeft size={19} /><span><Bookmark size={18} /><Share2 size={18} /></span></div><div className={styles.devTitle}><span>DAY 01 · WEEK 01</span><h2>Intentional God</h2><p>Genesis 1:1–31</p></div><article className={styles.devArticle}><p>Before humanity was asked to cultivate the earth, God had already shaped a world capable of receiving life.</p><p>Formation came before filling. Preparation came before placement. God&apos;s order was never accidental.</p><button className={styles.goldButton} type="button">Reflection & Prayer <ArrowRight size={16} /></button></article></div></Phone>;
}

function ReflectionScreen() {
  return <Phone number="11" name="Reflection & prayer"><AppHeader title="" back action={<span className={styles.readerHeaderTools}><Share2 size={17} /><Bookmark size={17} /></span>} /><div className={styles.reflectionBody}><span className={styles.eyebrow}>REFLECTION</span><h2>Trust the One who calls.</h2><small>Genesis 12:1–3</small><section><h3>Reflection</h3><p>What is God asking you to leave behind so He can lead you forward?</p><textarea aria-label="Your reflection" placeholder="Write your reflection…" /></section><section><h3>Prayer</h3><p>Lord, help me trust You completely and walk in obedience to Your call. Amen.</p></section><button className={styles.blackButton} type="button">Save & Close</button></div></Phone>;
}

function StatsScreen() {
  return <Phone number="12" name="Weekly stats"><div className={styles.statsBody}><div className={styles.statsTop}><div><h2>Your Week</h2><p>AUG 25–31</p></div><Clock3 size={18} /></div><section className={styles.encouragement}><span><Sparkles size={18} /></span><div><strong>Great job, Jasmine!</strong><p>You stayed consistent in your study.</p></div></section><div className={styles.statList}><span><b>24</b><small>Passages Read</small></span><span><b>68</b><small>Verses Read</small></span><span><b>7</b><small>Highlights</small></span><span><b>3</b><small>Notes Written</small></span><span><b>2</b><small>Questions Asked</small></span><span><b>4</b><small>Study Days</small></span></div><section className={styles.revisit}><span>MOST REVISITED</span><h3>Genesis 2:15–17</h3><p>You returned to gift, responsibility and boundary three times.</p></section></div><BottomNav active="profile" /></Phone>;
}

function ProfileScreen() {
  return <Phone number="13" name="Profile"><div className={styles.profileBody}><span className={styles.profileAvatar}>J</span><h2>Jasmine</h2><p>Joined April 2026</p><h3>Your Journey</h3><div className={styles.profileStats}><span><b>10</b>Weeks</span><span><b>68</b>Days</span><span><b>3</b>Courses</span></div><h3>Achievements</h3><div className={styles.achievementRow}>{[BookOpen,Highlighter,PenLine,Bookmark].map((Icon,i)=><span key={i}><Icon size={21} /></span>)}</div><div className={styles.profileLinks}><span>Account settings <ChevronRight size={16} /></span><span>Privacy & sharing <ChevronRight size={16} /></span><span>Reading preferences <ChevronRight size={16} /></span></div></div><BottomNav active="profile" /></Phone>;
}

function TimelineScreen() {
  const eras: Array<[AppIcon,string,string]> = [[Sparkles,"Creation","Beginnings"],[Users,"Patriarchs","Promises Made"],[Map,"Exodus","Deliverance"],[BookOpen,"Kings & Kingdom","The Nation Grows"],[MessageCircleQuestion,"Prophets","Call to Return"],[Sparkles,"Jesus","The Promise Fulfilled"],[Users,"Church","The Mission Continues"]];
  return <Phone number="14" name="Timeline"><div className={styles.appBody}><h2 className={styles.screenTitle}>Timeline</h2><p className={styles.screenSub}>God&apos;s Story</p><div className={styles.timelineList}>{eras.map(([Icon,title,subtitle])=><div key={title}><span><Icon size={16} /></span><p><strong>{title}</strong><small>{subtitle}</small></p></div>)}</div></div><BottomNav active="study" /></Phone>;
}

export default function DesignLockPage() {
  return (
    <main className={styles.lockPage}>
      <header className={styles.boardHeader}><BrandMark compact /><div><h1>Through the Bible</h1><p>Your Journey. His Story.</p></div><span>APPROVED PRODUCT SYSTEM · TYPE + COLOR CORRECTED</span></header>
      <section className={styles.systemRules}><div><b>TYPE</b><span>SF Pro system stack · Inter equivalent</span></div><div><b>PALETTE</b><span>Warm white · Ink · Gold only</span></div><div><b>NAVIGATION</b><span>Home · Today · Study · My Bible · Profile</span></div><div><b>LESSON RHYTHM</b><span>Place · Fill · Connect · Unlock · Devotion</span></div></section>
      <section className={styles.screenGrid}><SplashScreen /><SignInScreen /><HomeScreen /><TodayScreen /><ScriptureReader /><ScriptureReader actions /><NoteScreen /><StudyScreen /><MyBibleScreen /><DevotionalScreen /><ReflectionScreen /><StatsScreen /><ProfileScreen /><TimelineScreen /></section>
      <footer className={styles.boardFooter}><span><Highlighter size={19} /> Read, highlight and underline Scripture</span><span><PenLine size={19} /> Take notes and ask questions</span><span><Library size={19} /> A real Study Center for everything</span><span><CalendarDays size={19} /> Track weekly progress</span></footer>
    </main>
  );
}
