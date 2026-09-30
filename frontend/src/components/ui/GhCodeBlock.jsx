import { useMemo } from 'react';
import {
    getHighlightLanguage,
    getLanguageLabel,
    highlightCode,
} from '../../utils/codeHighlight';

export function GhCodeBlock({ filename, content, showHeader = true }) {
    const language = useMemo(() => getHighlightLanguage(filename), [filename]);
    const label = useMemo(() => getLanguageLabel(language), [language]);

    const lines = useMemo(
        () => highlightCode(content, language),
        [content, language],
    );

    return (
        <div className="gh-code-block">
            {showHeader && (
                <div className="gh-code-header">
                    <span className="gh-code-lang">{label}</span>
                    <span className="gh-code-lines">{lines.length} lines</span>
                </div>
            )}
            <div className="gh-code-scroll">
                <table className="gh-code-table" cellPadding="0" cellSpacing="0">
                    <tbody>
                        {lines.map((line, index) => (
                            <tr key={index} className="gh-code-row">
                                <td className="gh-code-ln" aria-hidden="true">{index + 1}</td>
                                <td
                                    className="gh-code-line"
                                    dangerouslySetInnerHTML={{ __html: line || '&#8203;' }}
                                />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
