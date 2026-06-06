import { Github, Linkedin, Facebook, Mail, ExternalLink } from "lucide-react";

const links = [
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

export function Footer() {
  return (
    <footer className="border-t border-border mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">
              Ramadan Counting
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Open source Ramadan companion
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {links.map(({ href, icon: Icon, label }) => (
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
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ramadan Counting. Built with
            sincerity for the Muslim community.
          </p>
        </div>
      </div>
    </footer>
  );
}
