/**
 * Dashboard Footer Component
 * 
 * Reusable footer for dashboard and other authenticated pages
 */

import React from 'react';
import { Logo } from '../Logo';

interface DashboardFooterProps {
  showLogo?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
}

export function DashboardFooter({ 
  showLogo = true,
  logoSize = 'medium'
}: DashboardFooterProps) {
  const logoSizes = {
    small: 'h-10',
    medium: 'h-14',
    large: 'h-16',
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          {showLogo && (
            <div className="space-y-4">
              <Logo className={logoSizes[logoSize]} />
              <p className="text-sm text-gray-300">
                AI-powered learning platform for IGCSE, A-Levels & IB students
              </p>
            </div>
          )}

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Settings</a></li>
            </ul>
          </div>

          {/* Learning Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Learning</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">AI Tutor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mock Exams</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Practice</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Flashcards</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="mailto:support@imtehaan.com" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} Imtehaan. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

