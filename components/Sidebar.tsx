
import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { HomeIcon, ReportsIcon, ChatLogsIcon, SettingsIcon, ChevronDownIcon, ChevronsLeftIcon } from './icons';
import type { ActiveView } from '../types';
import { mockRoles, mockUsers } from '../data/mockData';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isDropdown?: boolean;
  onClick: () => void;
  isOpen?: boolean;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isDropdown, onClick, isOpen, isCollapsed }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center text-left py-2 rounded-lg transition-all duration-200 ${ isCollapsed ? 'justify-center' : 'justify-between px-4' } ${ active ? 'bg-white text-brand-purple shadow-md' : 'text-white/80 hover:bg-white/10' }`}
        aria-label={isCollapsed ? label : undefined}
        title={isCollapsed ? label : undefined}
    >
        <div className="flex items-center">
            <span className="w-6 h-6 flex-shrink-0">{icon}</span>
            {!isCollapsed && <span className="ml-4 font-semibold">{label}</span>}
        </div>
        {isDropdown && !isCollapsed && <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
    </button>
);

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: User;
}

const allReportLinks: { label: string; view: ActiveView }[] = [
    { label: 'Paid Media', view: 'report-paid-media' },
    { label: 'Organic Search', view: 'report-organic-search' },
    { label: 'Social Media', view: 'report-social-media' },
    { label: 'E-commerce', view: 'report-ecommerce' },
    { label: 'KOL', view: 'report-kol' },
    { label: 'Publishers', view: 'report-publishers' },
    { label: 'Offline Media', view: 'report-offline-media' },
    { label: 'Competitor Benchmarking', view: 'report-competitor-benchmarking' },
    { label: 'Social Listening', view: 'report-social-listening' }
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, onToggleCollapse, user }) => {
    const [reportsOpen, setReportsOpen] = useState(activeView.startsWith('report-'));

    const currentUser = mockUsers.find(u => u.email === user.email);
    const userRole = mockRoles.find(r => r.id === currentUser?.roleId);
    const allowedReports = userRole?.permissions.allowedReports || [];

    const reportLinks = allReportLinks.filter(link => allowedReports.includes(link.view));

    useEffect(() => {
        if (isCollapsed) {
            setReportsOpen(false);
        }
    }, [isCollapsed]);
    
    useEffect(() => {
        // Keep reports open if one of the report pages is active
        if (activeView.startsWith('report-') && !isCollapsed) {
            setReportsOpen(true);
        }
    }, [activeView, isCollapsed]);

    return (
        <aside className={`bg-brand-purple text-white flex-shrink-0 flex flex-col hidden lg:flex transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 p-2' : 'w-64 p-4'}`}>
            <div className={`flex items-center mb-10 transition-all duration-200 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
                <img src="/assets/img/CMK-logo-header.webp" alt="CMK Logo" width={isCollapsed ? 32 : 48} height={isCollapsed ? 32 : 48} />
                {!isCollapsed && <h1 className="text-sm font-bold ml-3 whitespace-nowrap">CMK Smart Dashboard</h1>}
            </div>
            <nav className="flex-1 flex flex-col gap-2">
                <NavItem 
                    icon={<HomeIcon />} 
                    label="Home" 
                    active={activeView === 'dashboard'} 
                    onClick={() => setActiveView('dashboard')} 
                    isCollapsed={isCollapsed}
                />
                <NavItem 
                    icon={<ReportsIcon />} 
                    label="Reports" 
                    active={activeView.startsWith('report-')}
                    isDropdown 
                    onClick={() => !isCollapsed && setReportsOpen(!reportsOpen)}
                    isOpen={reportsOpen}
                    isCollapsed={isCollapsed}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${reportsOpen && !isCollapsed ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="flex flex-col gap-1 pl-12 text-white/70 pt-2">
                        {reportLinks.map(link => (
                             <button 
                                key={link.view} 
                                onClick={() => setActiveView(link.view)}
                                className={`py-1.5 text-left transition-colors ${activeView === link.view ? 'text-white font-semibold' : 'hover:text-white'}`}
                             >
                                {link.label}
                             </button>
                        ))}
                    </div>
                </div>
                <NavItem 
                    icon={<ChatLogsIcon />} 
                    label="Chat Logs" 
                    active={activeView === 'chatLogs'}
                    onClick={() => setActiveView('chatLogs')} 
                    isCollapsed={isCollapsed}
                />
                <NavItem 
                    icon={<SettingsIcon />} 
                    label="Settings" 
                    active={activeView === 'settings'}
                    onClick={() => setActiveView('settings')} 
                    isCollapsed={isCollapsed}
                />
            </nav>
            <div className={`mt-auto border-t pt-4 ${isCollapsed ? 'border-transparent' : 'border-white/20'}`}>
                 <button
                    onClick={onToggleCollapse}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronsLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;