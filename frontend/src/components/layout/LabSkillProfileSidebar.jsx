import { Link } from 'react-router-dom';
import { CURRENT_USER } from '../../data/mockData';
import { formatWebsiteUrl } from '../../utils/labskillUtils';

export function LabSkillProfileSidebar() {
    const user = CURRENT_USER;

    return (
        <aside className="gh-sidebar">
            <div className="gh-avatar">{user.name.charAt(0)}</div>
            <h1 className="gh-name">{user.name}</h1>
            <span className="gh-username">{user.username}</span>

            {user.bio && <p className="gh-bio">{user.bio}</p>}

            <Link to="/settings" className="gh-btn-outline">Edit profile</Link>

            <div className="gh-follow-row">
                <span><strong>{user.followers}</strong> followers</span>
                <span> · </span>
                <span><strong>{user.following}</strong> following</span>
            </div>

            <ul className="gh-meta-list">
                {user.company && <li>{user.company}</li>}
                {user.location && <li>{user.location}</li>}
                {user.website && (
                    <li>
                        <a href={formatWebsiteUrl(user.website)} target="_blank" rel="noopener noreferrer">
                            {user.website.replace(/^https?:\/\//i, '')}
                        </a>
                    </li>
                )}
                <li>Joined {user.joined}</li>
            </ul>
        </aside>
    );
}
