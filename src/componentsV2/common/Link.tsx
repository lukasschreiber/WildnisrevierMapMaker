interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    target?: "_blank" | "_self";
}

export function Link({ href, children, className, target = "_self" }: LinkProps) {
    return (
        <a
            href={href}
            className={`text-blue-500 cursor-pointer underline hover:text-blue-700 ${className || ""}`}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
        >
            {children}
        </a>
    );
}
