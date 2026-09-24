import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PlaneMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 15.3v1.6a.4.4 0 0 1-.55.37L14 14.6v4.13l2.2 1.5a.4.4 0 0 1 .17.33v1.05a.4.4 0 0 1-.5.39L12 21l-3.87.99a.4.4 0 0 1-.5-.39v-1.05a.4.4 0 0 1 .18-.33l2.19-1.5V14.6l-7.05 2.67a.4.4 0 0 1-.55-.37V15.3c0-.14.07-.27.19-.34l7.41-4.63V4.1a1.9 1.9 0 1 1 3.8 0v6.23l7.41 4.63c.12.07.19.2.19.34Z" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  );
}

export function Globe(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </Base>
  );
}

export function Menu(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Base>
  );
}

export function Heart({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "rgba(0,0,0,0.32)"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 20.5s-7.5-4.6-7.5-9.6a4.4 4.4 0 0 1 7.5-3.1 4.4 4.4 0 0 1 7.5 3.1c0 5-7.5 9.6-7.5 9.6Z" />
    </svg>
  );
}

export function ChevronLeft(props: IconProps) {
  return (
    <Base strokeWidth={2.2} {...props}>
      <path d="m14 6-6 6 6 6" />
    </Base>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <Base strokeWidth={2.2} {...props}>
      <path d="m10 6 6 6-6 6" />
    </Base>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M5 12h13" />
      <path d="m12 5 7 7-7 7" />
    </Base>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M19 12H6" />
      <path d="m12 5-7 7 7 7" />
    </Base>
  );
}

export function Star(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="m12 3.5 2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77 6.8 19.5l1-5.78-4.22-4.1 5.82-.85L12 3.5Z" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <Base strokeWidth={2.4} {...props}>
      <path d="m20 6.5-10.5 11L4 12" />
    </Base>
  );
}

export function Bed(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
      <path d="M3 14h18" />
      <path d="M7 11h3" />
    </Base>
  );
}

export function Balloon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3a6 6 0 0 1 6 6c0 3.6-3.5 6.5-6 6.5S6 12.6 6 9a6 6 0 0 1 6-6Z" />
      <path d="M10.5 15.5 10 21h4l-.5-5.5" />
    </Base>
  );
}

export function Bell(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 15Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Base>
  );
}

export function Calendar(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
    </Base>
  );
}

export function Users(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </Base>
  );
}

export function Minus(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M6 12h12" />
    </Base>
  );
}

export function Plus(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M12 6v12M6 12h12" />
    </Base>
  );
}

export function Phone(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
    </Base>
  );
}

export function Mail(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </Base>
  );
}

export function Warning(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 9.5v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.4 2.1 18.3A2 2 0 0 0 3.8 21.3h16.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
    </Base>
  );
}

export function Leaf(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 4c0 9-5.5 13-10.5 13A4.5 4.5 0 0 1 5 12.5C5 7 11 4 20 4Z" />
      <path d="M4 20c2-5 5-8 10-10" />
    </Base>
  );
}

export function Instagram(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M17 7h.01" />
    </Base>
  );
}

export function XSocial(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4.5 4.5 15 15M19.5 4.5l-15 15" />
    </Base>
  );
}

export function Facebook(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14.5 8.5h2.2M14.5 8.5V6.8c0-1 .8-1.8 1.8-1.8h1.4" />
      <path d="M14.5 8.5V20" />
      <path d="M10.5 11.5h6" />
    </Base>
  );
}
