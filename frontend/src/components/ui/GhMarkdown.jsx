import React from 'react';

function renderInline(text) {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

export function GhMarkdown({ content }) {
    if (!content) return null;

    const lines = content.split('\n');
    const blocks = [];
    let listItems = [];
    let codeLines = [];
    let inCode = false;

    function flushList() {
        if (listItems.length) {
            blocks.push(
                <ul key={`list-${blocks.length}`}>
                    {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
                </ul>
            );
            listItems = [];
        }
    }

    function flushCode() {
        if (codeLines.length) {
            blocks.push(
                <pre key={`code-${blocks.length}`}><code>{codeLines.join('\n')}</code></pre>
            );
            codeLines = [];
        }
    }

    for (const line of lines) {
        if (line.startsWith('```')) {
            if (inCode) {
                flushCode();
                inCode = false;
            } else {
                flushList();
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            codeLines.push(line);
            continue;
        }

        if (line.startsWith('# ')) {
            flushList();
            blocks.push(<h1 key={blocks.length}>{line.slice(2)}</h1>);
            continue;
        }
        if (line.startsWith('## ')) {
            flushList();
            blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>);
            continue;
        }
        if (line.startsWith('### ')) {
            flushList();
            blocks.push(<h3 key={blocks.length}>{line.slice(4)}</h3>);
            continue;
        }
        if (line.startsWith('- ')) {
            listItems.push(line.slice(2));
            continue;
        }
        if (!line.trim()) {
            flushList();
            blocks.push(<br key={blocks.length} />);
            continue;
        }

        flushList();
        blocks.push(<p key={blocks.length}>{renderInline(line)}</p>);
    }

    flushList();
    flushCode();

    return <div className="gh-markdown">{blocks}</div>;
}
