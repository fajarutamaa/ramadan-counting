import {
  Github,
  Linkedin,
  Facebook,
  Mail,
  ExternalLink,
  MoonStar,
} from "lucide-react";

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
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="page-shell py-8 sm:py-12">
        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <a
              href="#home"
              className="mb-3 inline-flex items-center gap-2 rounded-lg"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <MoonStar aria-hidden="true" className="size-4" />
              </span>
              <span className="font-display text-xl tracking-tight">Nur</span>
            </a>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Your daily Muslim companion — prayer times, mosques, Qibla,
              Islamic calendar, and more.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="section-label mb-3">{section.title}</h2>
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
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
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
