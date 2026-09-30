export function WeeklyBarChart({ data, yLabel = 'Contributions', maxTicks = 4 }) {
    const max = Math.max(...data.map(item => item.count), 1);
    const ticks = Array.from({ length: maxTicks + 1 }, (_, i) => {
        const val = max - (max / maxTicks) * i;
        return Number.isInteger(val) ? val : val.toFixed(2).replace(/\.?0+$/, '');
    });

    return (
        <div className="gh-insights-weekly-chart">
            <div className="gh-insights-weekly-y">
                <span>{yLabel}</span>
                <div className="gh-insights-weekly-ticks">
                    {ticks.map(tick => (
                        <span key={tick}>{tick}</span>
                    ))}
                </div>
            </div>
            <div className="gh-insights-weekly-area">
                {ticks.map(tick => (
                    <div
                        key={tick}
                        className="gh-insights-weekly-grid"
                        style={{ bottom: `${(Number(tick) / max) * 100}%` }}
                    />
                ))}
                <div className="gh-insights-weekly-bars">
                    {data.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="gh-insights-weekly-col">
                            <div
                                className="gh-insights-weekly-bar"
                                style={{ height: `${(item.count / max) * 100}%` }}
                            />
                            {item.label && <span>{item.label}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function MiniWeeklyBarChart({ data }) {
    const max = Math.max(...data.map(item => item.count), 1);

    return (
        <div className="gh-insights-mini-chart">
            {data.map((item, index) => (
                <div
                    key={`${item.label}-${index}`}
                    className="gh-insights-mini-bar"
                    style={{ height: `${(item.count / max) * 100}%` }}
                />
            ))}
        </div>
    );
}

export function LineChart({ data, yMax, yTicks = [0, 0.25, 0.5, 0.75, 1] }) {
    const max = yMax ?? Math.max(...data.map(item => item.value), 1);
    const points = data.map((item, index) => {
        const x = data.length <= 1 ? 100 : (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="gh-insights-line-chart">
            <div className="gh-insights-line-y">
                {yTicks.map(tick => (
                    <span key={tick}>{tick}</span>
                ))}
            </div>
            <div className="gh-insights-line-area">
                {yTicks.map(tick => (
                    <div
                        key={tick}
                        className="gh-insights-line-grid"
                        style={{ bottom: `${(tick / max) * 100}%` }}
                    />
                ))}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="gh-insights-line-svg">
                    <polyline points={points} />
                </svg>
                <div className="gh-insights-line-labels">
                    {data.filter((_, i) => i === 0 || i === data.length - 1 || i % 4 === 0).map(item => (
                        <span key={item.label}>{item.label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function YearlyCommitsChart({ data }) {
    const max = Math.max(...data.map(item => item.count), 1.2);

    return (
        <div className="gh-insights-year-chart">
            <div className="gh-insights-year-y">
                <span>Commits</span>
                <div>
                    {[max, max * 0.75, max * 0.5, max * 0.25, 0].map(tick => (
                        <span key={tick}>{Number(tick.toFixed(1))}</span>
                    ))}
                </div>
            </div>
            <div className="gh-insights-year-area">
                <div className="gh-insights-year-bars">
                    {data.map(item => (
                        <div key={item.label} className="gh-insights-year-col">
                            <div
                                className="gh-insights-year-bar"
                                style={{ height: `${(item.count / max) * 100}%` }}
                            />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function CodeFrequencyAreaChart({ additions, deletions, maxValue }) {
    const max = maxValue ?? Math.max(additions, deletions, 1);
    const addHeight = (additions / max) * 100;
    const delHeight = (deletions / max) * 100;
    const ticks = [0, max * 0.2, max * 0.4, max * 0.6, max * 0.8, max].map(v => Math.round(v));

    return (
        <div className="gh-insights-freq-area-chart">
            <div className="gh-insights-freq-y">
                <span>Frequency</span>
                <div>
                    {ticks.reverse().map(tick => (
                        <span key={tick}>{tick}</span>
                    ))}
                </div>
            </div>
            <div className="gh-insights-freq-area">
                {ticks.map(tick => (
                    <div
                        key={tick}
                        className="gh-insights-freq-grid"
                        style={{ bottom: `${(tick / max) * 100}%` }}
                    />
                ))}
                <div className="gh-insights-freq-stack">
                    <div className="gh-insights-freq-add-block" style={{ height: `${addHeight}%` }} />
                    {deletions > 0 && (
                        <div className="gh-insights-freq-del-block" style={{ height: `${delHeight}%` }} />
                    )}
                </div>
                <div className="gh-insights-freq-legend-inline">
                    <span><i className="add" /> Additions</span>
                    <span><i className="del" /> Deletions</span>
                </div>
            </div>
        </div>
    );
}

export function TimelineSlider({ months }) {
    return (
        <div className="gh-insights-timeline">
            <div className="gh-insights-timeline-track">
                <div className="gh-insights-timeline-selection" />
            </div>
            <div className="gh-insights-timeline-labels">
                {months.map(month => (
                    <span key={month}>{month}</span>
                ))}
            </div>
        </div>
    );
}
