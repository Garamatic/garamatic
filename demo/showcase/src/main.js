/**
 * Shared bootstrap for all tenant demo pages.
 * Injects Tailwind CSS CDN + theme-specific CSS variables + shared utility classes.
 */

(function () {
    const THEME_VARS = {
        desgoffe: {
            '--color-canvas': '#F8FAFC',
            '--color-surface': '#FFFFFF',
            '--color-surface-elevated': '#F1F5F9',
            '--color-structural': '#E2E8F0',
            '--color-primary': '#6366F1',
            '--color-primary-hover': '#4F46E5',
            '--color-secondary': '#64748B',
            '--color-accent': '#F97316',
            '--color-muted': '#94A3B8',
            '--color-error': '#EF4444',
            '--color-warning': '#F59E0B',
            '--color-text-primary': '#0F172A',
            '--color-text-secondary': '#475569',
            '--font-body': "'Inter', system-ui, sans-serif",
            '--font-heading': "'Rajdhani', system-ui, sans-serif",
            '--font-serif': "Georgia, 'Times New Roman', serif",
            '--radius-component': '8px',
        },
        whitman: {
            '--color-canvas': '#DDE4E8',
            '--color-surface': '#FFFFFF',
            '--color-surface-elevated': '#F5F7F9',
            '--color-structural': '#C8D2D8',
            '--color-primary': '#004B87',
            '--color-primary-hover': '#003a6a',
            '--color-secondary': '#FF9933',
            '--color-accent': '#FFD700',
            '--color-muted': '#6c7a85',
            '--color-error': '#DC3545',
            '--color-warning': '#F59E0B',
            '--color-text-primary': '#1a1a1a',
            '--color-text-secondary': '#475569',
            '--font-body': "'Roboto Condensed', 'Arial Narrow', sans-serif",
            '--font-heading': "'Oswald', 'Impact', sans-serif",
            '--font-serif': "Georgia, 'Times New Roman', serif",
            '--radius-component': '0px',
        },
        liberty: {
            '--color-canvas': '#1a1a1a',
            '--color-surface': '#2F3131',
            '--color-surface-elevated': '#3a3c3c',
            '--color-structural': '#4a4a4a',
            '--color-primary': '#E1AD01',
            '--color-primary-hover': '#c99a01',
            '--color-secondary': '#98FF98',
            '--color-accent': '#61dafb',
            '--color-muted': '#888',
            '--color-error': '#ff6b6b',
            '--color-warning': '#F59E0B',
            '--color-text-primary': '#e0e0e0',
            '--color-text-secondary': '#a0a0a0',
            '--font-body': "'Inter', -apple-system, sans-serif",
            '--font-heading': "'Inter', -apple-system, sans-serif",
            '--font-serif': "Georgia, 'Times New Roman', serif",
            '--radius-component': '6px',
        },
        hennessey: {
            '--color-canvas': '#F5F9FA',
            '--color-surface': '#FFFFFF',
            '--color-surface-elevated': '#F8FBFC',
            '--color-structural': '#e0e8ed',
            '--color-primary': '#75AADB',
            '--color-primary-hover': '#5d94c7',
            '--color-secondary': '#FF4500',
            '--color-accent': '#2E8B57',
            '--color-muted': '#7a8b9a',
            '--color-error': '#EF4444',
            '--color-warning': '#F59E0B',
            '--color-text-primary': '#333',
            '--color-text-secondary': '#555',
            '--font-body': "'Helvetica Neue', 'Helvetica', sans-serif",
            '--font-heading': "'EB Garamond', 'Georgia', serif",
            '--font-serif': "'EB Garamond', 'Georgia', serif",
            '--radius-component': '4px',
        }
    };

    const theme = document.documentElement.dataset.theme || 'desgoffe';
    const vars = THEME_VARS[theme] || THEME_VARS.desgoffe;

    const head = document.head;

    // 1. Inject theme CSS variables + shared utilities
    if (!document.querySelector('style[data-garamatic-theme]')) {
        const style = document.createElement('style');
        style.setAttribute('data-garamatic-theme', 'true');

        const varBlock = Object.entries(vars)
            .map(([k, v]) => `${k}: ${v};`)
            .join('\n  ');

        style.textContent = `
            :root {
              ${varBlock}
            }

            .glass-panel {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(226, 232, 240, 0.6);
                border-radius: var(--radius-component);
                padding: 1rem;
            }

            .glass-premium {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(226, 232, 240, 0.8);
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            }

            .animate-float {
                animation: float 3s ease-in-out infinite;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }

            .skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--color-primary);
                color: white;
                padding: 8px 16px;
                z-index: 100;
                transition: top 0.3s;
            }
            .skip-link:focus {
                top: 0;
            }

            /* Button utilities */
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                border: 1px solid transparent;
                border-radius: var(--radius-component);
                font-family: var(--font-heading);
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                text-decoration: none;
            }

            .btn-primary {
                background-color: var(--color-primary);
                color: #fff;
                border-color: var(--color-primary);
            }
            .btn-primary:hover {
                background-color: var(--color-primary-hover);
                border-color: var(--color-primary-hover);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }

            .btn-outline {
                background-color: transparent;
                color: var(--color-primary);
                border-color: var(--color-primary);
            }
            .btn-outline:hover {
                background-color: var(--color-primary);
                color: #fff;
            }

            .btn-secondary {
                background-color: var(--color-surface-elevated);
                color: var(--color-text-primary);
                border-color: var(--color-structural);
            }
            .btn-secondary:hover {
                background-color: var(--color-structural);
            }

            .btn-tiny {
                padding: 0.375rem 0.75rem;
                font-size: 0.75rem;
            }

            /* ── Whitman custom classes ── */
            .option-btn {
                padding: 0.75rem 1rem;
                border: 2px solid var(--color-structural);
                border-radius: var(--radius-component);
                background: var(--color-surface);
                color: var(--color-text-primary);
                cursor: pointer;
                transition: all 0.15s;
                font-weight: 500;
            }
            .option-btn.active {
                border-color: var(--color-primary);
                background: var(--color-primary);
                color: #fff;
            }
            .priority-btn {
                padding: 0.5rem 1rem;
                border: 2px solid var(--color-structural);
                border-radius: var(--radius-component);
                background: var(--color-surface);
                color: var(--color-text-primary);
                cursor: pointer;
                transition: all 0.15s;
            }
            .priority-btn.active {
                border-color: var(--color-error);
                background: var(--color-error);
                color: #fff;
            }
            .submit-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem 2rem;
                background: var(--color-primary);
                color: #fff;
                font-weight: 700;
                text-transform: uppercase;
                text-decoration: none;
                border: none;
                cursor: pointer;
                transition: all 0.15s;
            }
            .submit-btn:hover {
                background: var(--color-primary-hover);
            }
            .loading-overlay {
                position: fixed;
                inset: 0;
                background: var(--color-canvas);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .photo-preview {
                max-width: 200px;
                border-radius: var(--radius-component);
                margin-top: 1rem;
            }
            .photo-preview.active {
                display: block;
            }
            .location-status {
                padding: 0.75rem;
                border-radius: var(--radius-component);
                border: 1px solid var(--color-structural);
                margin-top: 0.5rem;
            }
            .location-status.active {
                display: block;
            }

            /* ── Liberty custom classes ── */
            .tab-btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--color-structural);
                border-radius: var(--radius-component);
                background: var(--color-surface);
                color: var(--color-text-primary);
                cursor: pointer;
                transition: all 0.15s;
            }
            .tab-btn.active {
                background: var(--color-primary);
                color: var(--color-canvas);
                border-color: var(--color-primary);
            }
            .active-tab {
                background: var(--color-primary);
                color: var(--color-canvas);
            }

            /* ── Hennessey custom classes ── */
            .form-step {
                display: none;
            }
            .form-step.active {
                display: block;
            }
            .step-bar {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            .step-circle {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: grid;
                place-items: center;
                background: var(--color-structural);
                color: var(--color-muted);
                font-weight: 600;
                font-size: 0.875rem;
            }
            .step-circle.active {
                background: var(--color-primary);
                color: #fff;
            }
            .step-circle.completed {
                background: var(--color-accent);
                color: #fff;
            }
            .step-connector {
                flex: 1;
                height: 2px;
                background: var(--color-structural);
                align-self: center;
            }
            .step-connector.completed {
                background: var(--color-accent);
            }
            .step-label {
                font-size: 0.75rem;
                color: var(--color-muted);
                margin-top: 0.25rem;
            }
            .step-label.active {
                color: var(--color-primary);
                font-weight: 600;
            }
            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 1.5rem;
            }
            .progress-bar {
                width: 100%;
                height: 6px;
                background: var(--color-structural);
                border-radius: 3px;
                overflow: hidden;
            }
            .progress-bar > div {
                height: 100%;
                background: var(--color-primary);
                transition: width 0.3s;
            }
            .review-content {
                background: var(--color-surface-elevated);
                border-radius: var(--radius-component);
                padding: 1.5rem;
            }
            .review-item {
                padding: 0.75rem 0;
                border-bottom: 1px solid var(--color-structural);
            }
            .review-item:last-child {
                border-bottom: none;
            }

            .progress-fill {
                height: 100%;
                background: var(--color-primary);
                border-radius: 3px;
                transition: width 0.5s ease;
            }

            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }

            /* Basic prose-like styles for liberty */
            .prose {
                line-height: 1.75;
            }
            .prose h1, .prose h2, .prose h3, .prose h4 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                font-weight: 600;
            }
            .prose p {
                margin-bottom: 1em;
            }
            .prose ul, .prose ol {
                margin-left: 1.5em;
                margin-bottom: 1em;
            }
            .prose code {
                background: var(--color-surface-elevated);
                padding: 0.2em 0.4em;
                border-radius: 4px;
                font-family: var(--font-mono, 'JetBrains Mono', monospace);
            }
            .prose pre {
                background: var(--color-surface-elevated);
                padding: 1em;
                border-radius: var(--radius-component);
                overflow-x: auto;
                margin-bottom: 1em;
            }
            .prose-invert {
                color: var(--color-text-primary);
            }
            .prose-invert pre, .prose-invert code {
                background: rgba(0,0,0,0.3);
            }
            .prose-sm {
                font-size: 0.875rem;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            /* Dark theme overrides */
            [data-theme="liberty"] .glass-panel,
            [data-theme="liberty"] .glass-premium {
                background: rgba(47, 49, 49, 0.7);
                border-color: rgba(255, 255, 255, 0.1);
            }
            [data-theme="liberty"] .btn-primary {
                color: #1a1a1a;
            }
        `;
        head.appendChild(style);
    }

    // 2. Tailwind CSS CDN
    if (!document.querySelector('script[src*="cdn.tailwindcss.com"]')) {
        const tailwindScript = document.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        tailwindScript.onload = function () {
            if (window.tailwind) {
                window.tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                canvas: 'var(--color-canvas)',
                                surface: 'var(--color-surface)',
                                'surface-elevated': 'var(--color-surface-elevated)',
                                structural: 'var(--color-structural)',
                                primary: 'var(--color-primary)',
                                secondary: 'var(--color-secondary)',
                                accent: 'var(--color-accent)',
                                muted: 'var(--color-muted)',
                                error: 'var(--color-error)',
                                warning: 'var(--color-warning)',
                                'text-primary': 'var(--color-text-primary)',
                                'text-secondary': 'var(--color-text-secondary)',
                            },
                            fontFamily: {
                                body: 'var(--font-body)',
                                heading: 'var(--font-heading)',
                                serif: 'var(--font-serif)',
                                mono: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            },
                            borderRadius: {
                                component: 'var(--radius-component)',
                            },
                            animation: {
                                float: 'float 3s ease-in-out infinite',
                            },
                            keyframes: {
                                float: {
                                    '0%, 100%': { transform: 'translateY(0)' },
                                    '50%': { transform: 'translateY(-6px)' },
                                },
                            },
                        },
                    },
                };
            }
        };
        head.appendChild(tailwindScript);
    }
})();
