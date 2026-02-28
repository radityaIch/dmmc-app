export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative z-10 mx-auto w-full max-w-5xl px-4 py-8 flex flex-col gap-8${className ? " " + className : ""}`}
    >
      {children}
    </div>
  );
}
