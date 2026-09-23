// frontend/src/components/footer/SiteFooter.tsx
import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Mail, ShieldCheck } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0b10] text-slate-400">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Description (2 cols on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
              <img
                src="/nav-logo.png"
                alt="IconBaba"
                className="h-10 w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(168,85,247,0.35)]"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Precision-crafted vector icon library for modern designers and developers. Explore 5,000+ customizable icons across 42 categories in Outlined and Filled styles.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
                aria-label="IconBaba on GitHub"
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
                aria-label="IconBaba on Twitter"
              >
                <Twitter className="size-4" />
              </a>
              <Link
                to="/contact"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
                aria-label="Contact IconBaba"
              >
                <Mail className="size-4" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Product
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/pricing" className="hover:text-purple-300 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-purple-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-purple-300 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Licenses Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Licenses
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/licenses" className="hover:text-purple-300 transition-colors">
                  Licenses
                </Link>
              </li>
              <li>
                <Link to="/licenses/free" className="hover:text-purple-300 transition-colors">
                  Free License
                </Link>
              </li>
              <li>
                <Link to="/licenses/pro" className="hover:text-purple-300 transition-colors">
                  Pro License
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/terms" className="hover:text-purple-300 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-purple-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-purple-300 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} IconBaba. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="size-3.5 text-purple-400" />
              Verified & Secure
            </span>
            <span>•</span>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="hover:text-purple-300 transition-colors">
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
