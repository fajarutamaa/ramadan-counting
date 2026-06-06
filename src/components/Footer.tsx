import { Github, Linkedin, Facebook, Mail, ExternalLink } from "lucide-react";

const social = [
  { href: "https://github.com/fajarutamaa", icon: Github, label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/fajardwiutomo",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "https://www.facebook.com/fajarcungkring.tjahgerih",
    icon: Facebook,
    label: "Facebook",
  },
  {
    href: "https://medium.com/@fajardwiutomo",
    icon: ExternalLink,
    label: "Medium",
  },
  { href: "mailto:fajardwiutomo75@gmail.com", icon: Mail, label: "Email" },
];

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Why Choose", href: "#why-choose" },
      { label: "About", href: "#about" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Prayer Times", href: "#prayer-times" },
      { label: "Mosques", href: "#mosques" },
      { label: "Qibla", href: "#qibla" },
      { label: "Calendar", href: "#calendar" },
      { label: "More Tools", href: "#tools" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com/fajarutamaa" },
      { label: "Tasbih", href: "#tasbih" },
      { label: "Daily Verse", href: "#verse" },
    ],
  },
  {
    title: "Connect",
    links: social.map((s) => ({ label: s.label, href: s.href })),
  },
];

export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-border mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("home");
              }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                Nur
              </span>
            </a>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Your daily Muslim companion — prayer times, mosques, Qibla,
              Islamic calendar, and more.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => {
                  const isExternal =
                    link.href.startsWith("http") ||
                    link.href.startsWith("mailto");
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        onClick={(e) => {
                          if (!isExternal && link.href.startsWith("#")) {
                            e.preventDefault();
                            scrollTo(link.href.slice(1));
                          }
                        }}
                        className="text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Social bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {social.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Nur. Built with sincerity for the
            Muslim community.
          </p>
        </div>
      </div>
    </footer>
  );
}
