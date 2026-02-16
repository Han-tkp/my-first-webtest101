export function SprayLogo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Main spray particles - varying sizes for depth */}

            {/* Large particles */}
            <circle cx="25" cy="30" r="3.5" fill="currentColor" opacity="0.9" />
            <circle cx="75" cy="40" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="50" cy="25" r="3.5" fill="currentColor" opacity="0.9" />
            <circle cx="60" cy="55" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="35" cy="50" r="2.8" fill="currentColor" opacity="0.8" />

            {/* Medium particles */}
            <circle cx="45" cy="35" r="2.2" fill="currentColor" opacity="0.75" />
            <circle cx="70" cy="28" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="30" cy="42" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="55" cy="45" r="2.3" fill="currentColor" opacity="0.75" />
            <circle cx="40" cy="60" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="65" cy="50" r="2.2" fill="currentColor" opacity="0.75" />
            <circle cx="80" cy="35" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="20" cy="38" r="2.1" fill="currentColor" opacity="0.7" />

            {/* Small particles */}
            <circle cx="38" cy="32" r="1.5" fill="currentColor" opacity="0.65" />
            <circle cx="62" cy="33" r="1.3" fill="currentColor" opacity="0.6" />
            <circle cx="48" cy="48" r="1.4" fill="currentColor" opacity="0.65" />
            <circle cx="72" cy="45" r="1.2" fill="currentColor" opacity="0.6" />
            <circle cx="33" cy="55" r="1.5" fill="currentColor" opacity="0.65" />
            <circle cx="85" cy="42" r="1.3" fill="currentColor" opacity="0.6" />
            <circle cx="28" cy="48" r="1.4" fill="currentColor" opacity="0.65" />
            <circle cx="58" cy="38" r="1.2" fill="currentColor" opacity="0.6" />
            <circle cx="42" cy="52" r="1.3" fill="currentColor" opacity="0.6" />
            <circle cx="68" cy="52" r="1.4" fill="currentColor" opacity="0.65" />

            {/* Tiny particles for detail */}
            <circle cx="52" cy="42" r="0.8" fill="currentColor" opacity="0.5" />
            <circle cx="77" cy="38" r="0.9" fill="currentColor" opacity="0.55" />
            <circle cx="32" cy="35" r="0.7" fill="currentColor" opacity="0.5" />
            <circle cx="46" cy="58" r="0.8" fill="currentColor" opacity="0.5" />
            <circle cx="63" cy="48" r="0.9" fill="currentColor" opacity="0.55" />
            <circle cx="37" cy="45" r="0.7" fill="currentColor" opacity="0.5" />
            <circle cx="55" cy="30" r="0.8" fill="currentColor" opacity="0.5" />
            <circle cx="82" cy="48" r="0.7" fill="currentColor" opacity="0.5" />
            <circle cx="24" cy="45" r="0.8" fill="currentColor" opacity="0.5" />
            <circle cx="50" cy="52" r="0.7" fill="currentColor" opacity="0.5" />
            <circle cx="65" cy="42" r="0.8" fill="currentColor" opacity="0.55" />
            <circle cx="35" cy="62" r="0.7" fill="currentColor" opacity="0.5" />

            {/* Additional scatter particles for more density */}
            <circle cx="88" cy="45" r="1" fill="currentColor" opacity="0.45" />
            <circle cx="18" cy="42" r="0.9" fill="currentColor" opacity="0.45" />
            <circle cx="44" cy="28" r="0.8" fill="currentColor" opacity="0.4" />
            <circle cx="70" cy="58" r="0.9" fill="currentColor" opacity="0.45" />
            <circle cx="26" cy="52" r="0.8" fill="currentColor" opacity="0.4" />
            <circle cx="78" cy="32" r="0.7" fill="currentColor" opacity="0.4" />
            <circle cx="41" cy="38" r="0.8" fill="currentColor" opacity="0.45" />
            <circle cx="59" cy="62" r="0.7" fill="currentColor" opacity="0.4" />
        </svg>
    );
}
