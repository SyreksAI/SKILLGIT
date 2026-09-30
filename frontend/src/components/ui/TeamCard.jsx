import { UsersIcon, ArrowRightIcon } from '../pages/icons';

const MEMBER_COLORS = ['#0066e0', '#9333ea', '#0891b2', '#16a34a', '#ea580c'];

export function TeamCard({ team, joined, directionLabel, onToggle }) {
    const isFull = team.members >= team.maxMembers;
    const pct = Math.round((team.members / team.maxMembers) * 100);

    return (
        <article className="team-card">
            <div className="team-card-top">
                <div className="team-card-avatar" style={{ background: team.color }}>
                    {team.avatar}
                </div>
                <div className="team-card-head">
                    <div className="team-card-title-row">
                        <h4>{team.name}</h4>
                        {joined && <span className="team-card-badge">Моя</span>}
                        {!team.open && <span className="team-card-badge team-card-badge--closed">Закрыта</span>}
                    </div>
                    <span className="team-card-dir">{directionLabel}</span>
                </div>
            </div>

            <p className="team-card-desc">{team.description}</p>

            <div className="team-card-tags">
                {team.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            <div className="team-card-members">
                <div className="team-card-avatars">
                    {Array.from({ length: Math.min(team.members, 5) }).map((_, i) => (
                        <span key={i} style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                            {String.fromCharCode(65 + i)}
                        </span>
                    ))}
                </div>
                <span className="team-card-count">
                    <UsersIcon /> {team.members}/{team.maxMembers}
                </span>
            </div>

            <div className="team-card-capacity">
                <div className="team-card-capacity-fill" style={{ width: `${pct}%` }} />
            </div>

            <footer className="team-card-foot">
                <span className="team-card-activity">{team.activity}</span>
                {joined ? (
                    <button type="button" className="team-card-btn team-card-btn--ghost" onClick={onToggle}>
                        Покинуть
                    </button>
                ) : team.open && !isFull ? (
                    <button type="button" className="team-card-btn" onClick={onToggle}>
                        Вступить <ArrowRightIcon />
                    </button>
                ) : (
                    <span className="team-card-full">Мест нет</span>
                )}
            </footer>
        </article>
    );
}
