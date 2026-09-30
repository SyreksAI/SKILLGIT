import { useMemo } from 'react';
import { highlightCode, getHighlightLanguage } from '../../utils/codeHighlight';

export function GhFileBlame({ filename, content, commit }) {
    const language = getHighlightLanguage(filename);
    const lines = useMemo(
        () => highlightCode(content, language),
        [content, language],
    );

    const author = commit?.author ?? 'Unknown';
    const sha = commit?.sha?.slice(0, 7) ?? '0000000';
    const date = commit?.date ?? 'recently';

    return (
        <div className="gh-file-blame">
            <table className="gh-file-blame-table" cellPadding="0" cellSpacing="0">
                <tbody>
                    {lines.map((line, index) => (
                        <tr key={index} className="gh-file-blame-row">
                            <td className="gh-file-blame-meta">
                                <span className="gh-file-blame-avatar">{author.charAt(0)}</span>
                                <span className="gh-file-blame-author">{author}</span>
                                <span className="gh-file-blame-date">{date}</span>
                                <code className="gh-file-blame-sha">{sha}</code>
                            </td>
                            <td className="gh-file-blame-ln">{index + 1}</td>
                            <td
                                className="gh-file-blame-code"
                                dangerouslySetInnerHTML={{ __html: line || '&#8203;' }}
                            />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
