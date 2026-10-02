export function MateAILogo({ variant = 'full', className = '' }) {
    const src = variant === 'icon' ? '/mateai-icon.png' : '/mateai-logo.png';

    return (
        <img
            src={src}
            alt="MateAI"
            className={className}
            decoding="async"
        />
    );
}
