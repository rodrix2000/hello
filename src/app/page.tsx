import Link from 'next/link';
import { auth } from '@/lib/auth';
import styles from './page.module.css';

const problemItems = [
  'a name you half remember',
  'a LinkedIn profile you may or may not find',
  'a paper card in your pocket',
  'a follow-up you meant to send'
];

const steps = [
  {
    title: 'Share your QR',
    body: 'Open your SparkMeet card and let someone scan it. No app required.'
  },
  {
    title: 'Collect their info',
    body: 'They can save your details, open your social links, or send their info back to you.'
  },
  {
    title: 'Add context',
    body: 'Write a quick note: where you met, what you talked about, and when to follow up.'
  },
  {
    title: 'Follow up',
    body: 'See who needs a reply, send the message yourself, and mark it done.'
  }
];

const features = [
  {
    title: 'Your profile, without the noise',
    body: 'Add your name, headline, company, links, and the best way to reach you. No feed. No posting. No humblebrags.'
  },
  {
    title: 'QR sharing that just works',
    body: 'Show your card on your phone, copy the link, or add it to printed materials.'
  },
  {
    title: 'A private list of people you meet',
    body: 'Every submitted contact goes into your dashboard with notes, tags, source, and follow-up status.'
  },
  {
    title: 'Built for real networking',
    body: 'Use it at chamber events, meetups, conferences, coffee meetings, and anywhere a useful conversation can start.'
  }
];

const audiences = [
  'local business owners',
  'consultants and coaches',
  'founders',
  'realtors and service pros',
  'chamber and meetup regulars',
  'anyone who leaves events thinking, "I should follow up with them"'
];

function HeroPreview({ className = '' }: { className?: string }) {
  return (
    <div className={`${styles.heroPreview} ${className}`} aria-hidden="true">
      <div className={styles.previewProfileCard}>
        <div className={styles.previewIdentity}>
          <span>JR</span>
          <div>
            <strong>Jamie Rivera</strong>
            <p>Founder at Northline Studio</p>
          </div>
        </div>
        <div className={styles.previewQrRow}>
          <div className={styles.previewQrLabel}>Show QR</div>
          <div className={styles.qrMark}>
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className={styles.previewLinks}>
          <span>LinkedIn</span>
          <span>Website</span>
          <span>Calendly</span>
        </div>
      </div>
      <div className={styles.previewMemoryCard}>
        <div>
          <span className={styles.previewEyebrow}>People met this week</span>
          <strong>5 new contacts</strong>
        </div>
        <div className={styles.previewContact}>
          <span />
          <div>
            <strong>Alex Morgan</strong>
            <p>Chamber breakfast - needs follow-up</p>
          </div>
        </div>
        <div className={styles.previewNote}>Ask about the retail launch and send the vendor intro.</div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  const primaryHref = session ? '/dashboard' : '/signup';

  return (
    <main className="shell">
      <div className={styles.page}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>SparkMeet</Link>
          <div className={styles.navActions}>
            <Link className="button buttonSecondary" href="#how-it-works">See how it works</Link>
            <Link className="button buttonPrimary" href={primaryHref}>
              {session ? 'Open dashboard' : 'Create your SparkMeet card'}
            </Link>
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.valueLine}>A simple networking card with a private follow-up list built in.</p>
            <h1>Remember who you met. Know what to do next.</h1>
            <p className={styles.heroText}>
              SparkMeet helps you turn quick introductions into real follow-ups. Share your profile with a QR code,
              collect their info, add a note, and keep the conversation from going cold.
            </p>
            <div className={styles.ctaRow}>
              <Link className="button buttonPrimary" href={primaryHref}>Create your SparkMeet card</Link>
              <Link className="button buttonSecondary" href="#how-it-works">See how it works</Link>
            </div>
            <HeroPreview className={styles.mobileHeroPreview} />
          </div>
          <div className={styles.heroGraphicWrap}>
            <HeroPreview />
          </div>
        </section>

        <section className={styles.problem}>
          <div>
            <h2>You meet good people all the time.</h2>
            <p>Then the details scatter:</p>
          </div>
          <div className={styles.scatterGrid}>
            {problemItems.map((item, index) => (
              <div className={styles.scatterCard} key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item}
              </div>
            ))}
          </div>
          <p className={styles.problemClose}>
            SparkMeet keeps the useful part: who they are, where you met, and why you wanted to remember them.
          </p>
        </section>

        <section className={styles.howItWorks} id="how-it-works">
          <div className={styles.sectionHeader}>
            <h2>How it works</h2>
          </div>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <article className={styles.step} key={step.title}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.featureBlock}>
          <div className={styles.sectionHeader}>
            <h2>Built for real follow-through</h2>
          </div>
          <div className={styles.features}>
            {features.map((feature) => (
              <article className="card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.positioning}>
          <p>LinkedIn is where contacts go to get lost.</p>
          <h2>SparkMeet is where new connections become follow-ups.</h2>
        </section>

        <section className={styles.whoFor}>
          <div>
            <h2>Who it is for</h2>
            <p className="muted">
              Built for people who leave events with real conversations they want to keep alive.
            </p>
          </div>
          <div className={styles.audienceList}>
            {audiences.map((audience) => (
              <span key={audience}>{audience}</span>
            ))}
          </div>
        </section>

        <section className={styles.noNetwork}>
          <div>
            <h2>Not another social network</h2>
            <p>No feed.</p>
            <p>No follower games.</p>
            <p>No AI-written business theater.</p>
            <strong>Just a clean way to remember people and follow up.</strong>
          </div>
          <div className={styles.noteGraphic} aria-hidden="true">
            <div className={styles.noteTop}>Private follow-up</div>
            <div className={styles.noteLine} />
            <div className={styles.noteLineShort} />
            <div className={styles.noteStatus}>Needs follow-up</div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>Turn your next hello into a follow-up.</h2>
          <p>Create your SparkMeet card and start remembering the people you meet.</p>
          <Link className="button buttonPrimary" href={primaryHref}>Get started</Link>
        </section>

        <footer className={styles.footer}>
          SparkMeet: a better way to keep track of the people worth remembering.
        </footer>
      </div>
    </main>
  );
}
