
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Sparkles,
  History as HistoryIcon,
  Bookmark,
  User,
  SlidersHorizontal,
  Palette,
  Settings,
  CreditCard,
  Receipt,
  BarChart3,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  Crown,
} from 'lucide-react';

import { useSession } from '../session.jsx';

const NAV = [
  ['/home', 'Home', Home],
  ['/chat', 'Chat', MessageCircle],
  ['/personality', 'Modes', Sparkles],
  ['/history', 'History', HistoryIcon],
  ['/saved', 'Saved', Bookmark],
  ['/usage', 'Usage', BarChart3],
  ['/profile', 'My Spider', User],
  ['/spider-customize', 'Customize Spider', SlidersHorizontal],
  ['/themes', 'Themes', Palette],
  ['/settings', 'Settings', Settings],
  ['/pricing', 'Plans', CreditCard],
  ['/billing', 'Billing', Receipt],
];

export default function Sidebar({ open, onClose }) {
  const { me } = useSession();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sg_side') === '1'
  );

  useEffect(() => {
    localStorage.setItem('sg_side', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  function collapseSidebar(event) {
    event.preventDefault();
    event.stopPropagation();
    setCollapsed(true);
  }

  function expandSidebar(event) {
    event.preventDefault();
    event.stopPropagation();
    setCollapsed(false);
  }

  const plan = me?.plan || 'free';
  const spiderName = me?.spider?.name || 'Your Spider';
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <>
      <div
        className={`scrim ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}
        aria-label="Primary navigation"
        data-collapsed={collapsed}
      >
        <div className="side-head">
          <NavLink
            to="/home"
            className="side-brand"
            aria-label="SpiderGPT home"
            onClick={onClose}
          >
            {collapsed ? (
              <img
                src="/brand/icon-app.png"
                className="side-icon"
                alt="SpiderGPT"
              />
            ) : (
              <img
                src="/brand/wordmark.png"
                className="wordmark"
                alt="SpiderGPT"
              />
            )}
          </NavLink>

          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>

          {!collapsed ? (
            <button
              type="button"
              className="icon-btn desktop-only"
              onClick={collapseSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={19} />
            </button>
          ) : (
            <button
              type="button"
              className="sidebar-expand-btn desktop-only"
              onClick={expandSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        <div className="sidebar-nav-wrap">
          <div className="sidebar-section-label">
            {collapsed ? '' : 'Workspace'}
          </div>

          <nav className="nav">
            {NAV.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">
                  <Icon size={19} strokeWidth={1.9} />
                </span>

                <span className="nav-label">{label}</span>

                {collapsed && (
                  <span className="tooltip" aria-hidden="true">
                    {label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="side-bottom">
          <div
            className={`sidebar-spider-card ${collapsed ? 'collapsed-card' : ''}`}
          >
            <div className="sidebar-spider-avatar">
              <img
                src="/brand/icon-app.png"
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className="sidebar-spider-info">
              <strong>{spiderName}</strong>
              <span>{planLabel} plan</span>
            </div>

            {collapsed && (
              <span className="tooltip" aria-hidden="true">
                {spiderName} · {planLabel} plan
              </span>
            )}
          </div>

          {plan !== 'plus' && (
            <NavLink
              to="/pricing"
              className={`sidebar-upgrade ${collapsed ? 'collapsed-upgrade' : ''}`}
              onClick={onClose}
              title={collapsed ? 'Upgrade your plan' : undefined}
            >
              <span className="sidebar-upgrade-icon">
                <Crown size={15} fill="currentColor" />
              </span>

              <span className="nav-label">
                <strong>Upgrade your plan</strong>
                <small>Unlock more from your Spider</small>
              </span>

              <ArrowUpRight
                className="sidebar-upgrade-arrow"
                size={16}
              />

              {collapsed && (
                <span className="tooltip" aria-hidden="true">
                  Upgrade your plan
                </span>
              )}
            </NavLink>
          )}

          <div
            className={`sidebar-version ${collapsed ? 'collapsed-version' : ''}`}
          >
            {collapsed ? (
              <span>SG</span>
            ) : (
              <>
                <span>SpiderGPT</span>
                <span>·</span>
                <span>Your AI Sidekick</span>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
