'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAI } from '@/contexts/AIContext';
import { FiCode, FiSettings, FiCpu, FiGitBranch, FiZap, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { currentModel } = useAI();

  return (
    <motion.header
      className="bg-surface border-b border-border shadow-sm glass-effect"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FiCpu className="text-primary-500 text-2xl transition-transform" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  AI Code Editor
                </h1>
                <p className="text-xs text-text-muted">Powered by AI</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-1">
              <NavLink href="/" currentPath={pathname} icon={<FiCode />}>
                Editor
              </NavLink>
              <NavLink href="/models" currentPath={pathname} icon={<FiGitBranch />}>
                Models
              </NavLink>
              <NavLink href="/settings" currentPath={pathname} icon={<FiSettings />}>
                Settings
              </NavLink>
            </nav>
          </div>

          {/* Current Model Display */}
          <div className="flex items-center space-x-4">
            {currentModel ? (
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20 glass-effect"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <FiZap className="text-primary-400 text-sm" />
                </motion.div>
                <div className="text-sm">
                  <div className="text-primary-400 font-medium">{currentModel.name}</div>
                  <div className="text-text-muted text-xs">{currentModel.provider}</div>
                </div>
                <FiActivity className="text-secondary-400 text-xs animate-pulse" />
              </motion.div>
            ) : (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surface border border-border">
                <FiZap className="text-text-muted text-sm" />
                <div className="text-sm text-text-muted">No model selected</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

interface NavLinkProps {
  href: string;
  currentPath: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavLink({ href, currentPath, icon, children }: NavLinkProps) {
  const isActive = currentPath === href;
  
  return (
    <Link href={href}>
      <motion.div
        className={`nav-link ${isActive ? 'active' : ''}`}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon && <span className="mr-2 text-base">{icon}</span>}
        <span className="text-sm">{children}</span>
      </motion.div>
    </Link>
  );
}