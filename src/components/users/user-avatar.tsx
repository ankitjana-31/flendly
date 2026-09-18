export function UserAvatar({
  name,
  username,
  src,
  size = "md",
}: {
  name?: string | null;
  username?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initials = (name ?? username ?? "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-sm";

  return src ? (
    <img src={src} alt={name ?? username ?? "User avatar"} className={`${sizeClass} shrink-0 border-2 border-black object-cover`} />
  ) : (
    <div aria-label={`${name ?? username ?? "User"} avatar`} className={`${sizeClass} shrink-0 border-2 border-black bg-[#2563EB] text-white shadow-[2px_2px_0_0_#000] flex items-center justify-center font-mono font-black`}>
      {initials || "U"}
    </div>
  );
}
