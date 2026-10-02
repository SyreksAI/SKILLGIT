const base = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export const GridIcon = () => (
    <svg {...base}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
);

export const CompassIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" />
    </svg>
);

export const CheckCircleIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="8 12 11 15 16 9" />
    </svg>
);

export const FlameIcon = () => (
    <svg {...base}>
        <path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-1.5.7-3 1.5-4" />
        <path d="M12 21a5 5 0 0 0 5-5c0-2-1-3.5-2-5" />
    </svg>
);

export const ClockIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
    </svg>
);

export const CalendarIcon = () => (
    <svg {...base}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export const CoinIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9h5a2 2 0 1 1 0 4H9m1-6v10m0-4h6" />
    </svg>
);

export const ArrowRightIcon = () => (
    <svg {...base}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="13 6 19 12 13 18" />
    </svg>
);

export const ArrowUpRightIcon = () => (
    <svg {...base}>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </svg>
);


export const ChevronRightIcon = () => (
    <svg {...base}>
        <polyline points="9 6 15 12 9 18" />
    </svg>
);

export const ChevronDownIcon = () => (
    <svg {...base}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const ChevronUpIcon = () => (
    <svg {...base}>
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

export const CheckIcon = () => (
    <svg {...base}>
        <polyline points="5 12 10 17 19 7" />
    </svg>
);

export const CircleIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
    </svg>
);

export const TrophyIcon = () => (
    <svg {...base}>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </svg>
);

export const StarIcon = () => (
    <svg {...base}>
        <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
    </svg>
);

export const SparkleIcon = () => (
    <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
    >
        <path d="M12 1.5l1.35 4.15h4.4l-3.55 2.58 1.35 4.15L12 9.8 8.45 12.4l1.35-4.15L6.25 5.65h4.4L12 1.5z" />
    </svg>
);

export const CrownIcon = () => (
    <svg {...base}>
        <path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8z" />
    </svg>
);

export const SendIcon = () => (
    <svg {...base}>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

export const UsersIcon = () => (
    <svg {...base}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export const RepoIcon = () => (
    <svg {...base}>
        <path d="M4 4h16v16H4z" />
        <path d="M9 4v4h6V4" />
    </svg>
);

export const GitBranchIcon = () => (
    <svg {...base}>
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
);

export const GitForkIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M12 8v8M6 16v-2a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2" />
    </svg>
);

export const BookIcon = () => (
    <svg {...base}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

export const ListIcon = () => (
    <svg {...base}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

export const EditSquareIcon = () => (
    <svg {...base}>
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.375 2.625a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414L11.5 15.5 8 16l.5-3.5 9.375-9.375z" />
    </svg>
);

export const PlugIcon = () => (
    <svg {...base}>
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8v4a6 6 0 0 1-12 0V8z" />
    </svg>
);

/** Sidebar toggle — panel + chevron (collapse/expand chat list) */
export const PanelLeftToggleIcon = ({ open = false }) => (
    <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        <line x1="9.5" y1="3.5" x2="9.5" y2="20.5" />
        {open ? (
            <polyline points="17.5 9 14.5 12 17.5 15" />
        ) : (
            <polyline points="14.5 9 17.5 12 14.5 15" />
        )}
    </svg>
);

export const SearchIcon = () => (
    <svg {...base}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export const BellIcon = () => (
    <svg {...base}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

export const MailIcon = () => (
    <svg {...base}>
        <path d="M4 4h16v16H4z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

export const MoonIcon = () => (
    <svg {...base}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export const SettingsIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

export const PortfolioIcon = () => (
    <svg {...base}>
        <path d="M2 7h20v14H2z" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
);

export const RocketIcon = () => (
    <svg {...base}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

export const PlusIcon = () => (
    <svg {...base}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export const PhoneIcon = () => (
    <svg {...base}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

export const MicIcon = () => (
    <svg {...base}>
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
);

export const WaveformIcon = () => (
    <svg {...base} strokeWidth="2.5">
        <line x1="8" y1="15" x2="8" y2="9" />
        <line x1="12" y1="17" x2="12" y2="7" />
        <line x1="16" y1="14" x2="16" y2="10" />
    </svg>
);

export const MoreIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const PaperclipIcon = () => (
    <svg {...base}>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
);

export const ImageIcon = () => (
    <svg {...base}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

export const CodeIcon = () => (
    <svg {...base}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

export const SmileIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);

export const LightbulbIcon = () => (
    <svg {...base}>
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="5.2" y1="3.2" x2="6.6" y2="4.6" />
        <line x1="18.8" y1="3.2" x2="17.4" y2="4.6" />
        <line x1="2.5" y1="8.5" x2="4.3" y2="9.2" />
        <line x1="21.5" y1="8.5" x2="19.7" y2="9.2" />
        <line x1="4" y1="13.5" x2="5.6" y2="13" />
        <line x1="20" y1="13.5" x2="18.4" y2="13" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 5a6.5 6.5 0 0 0-4 11.1V17h8v-0.9A6.5 6.5 0 0 0 12 5z" />
    </svg>
);

export const DownloadIcon = () => (
    <svg {...base}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export const FileIcon = () => (
    <svg {...base}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

export const FolderIcon = () => (
    <svg {...base}>
        <path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
);

export const UploadIcon = () => (
    <svg {...base}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const XIcon = () => (
    <svg {...base}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const IssueIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
);

export const PullRequestIcon = () => (
    <svg {...base}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M6 9v6a3 3 0 0 0 3 3h6" />
        <line x1="18" y1="9" x2="18" y2="15" />
    </svg>
);

export const GitMergeIcon = () => (
    <svg {...base}>
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M6 21V9a3 3 0 0 1 3-3h9" />
    </svg>
);

export const DiscussIcon = () => (
    <svg {...base}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

export const CubeIcon = () => (
    <svg {...base}>
        <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" />
        <path d="M12 22V12" />
        <path d="M20 6.5L12 12 4 6.5" />
    </svg>
);

export const FilterIcon = () => (
    <svg {...base}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export const SlidersHorizontalIcon = () => (
    <svg {...base}>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="7" y1="12" x2="17" y2="12" />
        <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
);

export const NewspaperIcon = () => (
    <svg {...base}>
        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        <path d="M7 9h10M7 13h10M7 17h6" />
    </svg>
);

export const ShoppingBagIcon = () => (
    <svg {...base}>
        <path d="M6 8h12l-1.2 11H7.2L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
);

export const MusicIcon = () => (
    <svg {...base}>
        <path d="M9 18V5l10-2v13" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="16" r="2" />
    </svg>
);

export const MapPinIcon = () => (
    <svg {...base}>
        <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
        <circle cx="12" cy="11" r="2" />
    </svg>
);

export const WorkflowIcon = () => (
    <svg {...base}>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="6" cy="18" r="2" />
        <path d="M8 6h8M8 18h8M18 14V8" />
    </svg>
);

export const ServerIcon = () => (
    <svg {...base}>
        <rect x="2" y="3" width="20" height="8" rx="2" />
        <rect x="2" y="13" width="20" height="8" rx="2" />
        <line x1="6" y1="7" x2="6.01" y2="7" />
        <line x1="6" y1="17" x2="6.01" y2="17" />
    </svg>
);

export const PlayIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
    </svg>
);

export const ProjectIcon = () => (
    <svg {...base}>
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="10" rx="1" />
        <rect x="14" y="17" width="7" height="4" rx="1" />
    </svg>
);

export const ShieldIcon = () => (
    <svg {...base}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export const PulseIcon = () => (
    <svg {...base}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export const AgentsIcon = () => (
    <svg {...base}>
        <path d="M18 10a4 4 0 0 0-7.9-1H9a5 5 0 1 0 0 10h9a4 4 0 0 0 .9-7.8" />
        <rect x="9" y="11" width="6" height="5" rx="1" />
        <line x1="10" y1="10" x2="10" y2="11" />
        <line x1="14" y1="10" x2="14" y2="11" />
        <circle cx="10.5" cy="13" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="13.5" cy="13" r="0.5" fill="currentColor" stroke="none" />
    </svg>
);

export const TerminalIcon = () => (
    <svg {...base}>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
);

export const CopyIcon = () => (
    <svg {...base}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

export const HelpCircleIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export const PinIcon = () => (
    <svg {...base}>
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
    </svg>
);

export const EyeIcon = () => (
    <svg {...base}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const TagIcon = () => (
    <svg {...base}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

export const HistoryIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
    </svg>
);

export const CheckReadIcon = () => (
    <svg {...base} width={14} height={14}>
        <polyline points="1 12 5 16 11 8" />
        <polyline points="7 12 11 16 17 8" />
    </svg>
);

export const ModerationIcon = () => (
    <svg {...base}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M8 11h8M8 14h5" />
    </svg>
);

export const RulesetIcon = () => (
    <svg {...base}>
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="6" r="3" />
        <path d="M6 15V9a3 3 0 0 1 3-3h6" />
        <polyline points="18 9 18 3 12 3" />
    </svg>
);

export const WebhookIcon = () => (
    <svg {...base}>
        <path d="M5 12a7 7 0 0 1 14 0" />
        <path d="M8.5 12a3.5 3.5 0 0 1 7 0" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <line x1="12" y1="13" x2="12" y2="21" />
    </svg>
);

export const KeyIcon = () => (
    <svg {...base}>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

export const LockIcon = () => (
    <svg {...base}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);

export const LaptopIcon = () => (
    <svg {...base}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M2 19h20" />
    </svg>
);

export const PagesIcon = () => (
    <svg {...base}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="8" y1="4" x2="8" y2="9" />
    </svg>
);

export const ShieldSearchIcon = () => (
    <svg {...base}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="11" cy="11" r="3" />
        <line x1="16" y1="16" x2="19" y2="19" />
    </svg>
);

export const PythonIcon = () => (
    <svg {...base}>
        <path d="M12 3c-3.5 0-3.5 2-3.5 2v1.5H12c1.8 0 3.2 1.2 3.2 2.8S13.8 13 12 13H9.5v1.5s0 2 3.5 2 3.5-2 3.5-2V14h-2.2c-1.8 0-3.2-1.2-3.2-2.8S10.2 8.5 12 8.5h2.5V5s0-2-2.5-2z" />
        <circle cx="10" cy="5.5" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="14" cy="18.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
);

export const ReactIcon = () => (
    <svg {...base}>
        <circle cx="12" cy="12" r="2" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
    </svg>
);

export const PaletteIcon = () => (
    <svg {...base}>
        <path d="M12 3c-4.5 0-8 3-8 7.5a6.5 6.5 0 0 0 6.5 6.5c.8 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.5-1 .3-.2.5-.6.5-1 0-.8.7-1.5 1.5-1.5H16a4 4 0 0 0 4-4C20 6 16.5 3 12 3z" />
        <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
        <circle cx="11" cy="7" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const QaIcon = () => (
    <svg {...base}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
    </svg>
);

export const AiIcon = () => (
    <svg {...base}>
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="M5.6 5.6l2.1 2.1" />
        <path d="M16.3 16.3l2.1 2.1" />
        <path d="M5.6 18.4l2.1-2.1" />
        <path d="M16.3 7.7l2.1-2.1" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);