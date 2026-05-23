interface ProfileAvatarProps {
  src?: string | null;
  alt: string;
  name: string;
  size?: number;
  borderSize?: number;
}

export function ProfileAvatar({
  src,
  alt,
  name,
  size = 96,
  borderSize = 4,
}: ProfileAvatarProps) {
  const style = { width: size, height: size, borderWidth: borderSize };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className="rounded-full object-cover border-4 border-white shadow"
      />
    );
  }

  return (
    <div
      style={{ ...style, fontSize: Math.floor(size * 0.33) }}
      className="rounded-full bg-blue-400 border-4 border-white shadow flex items-center justify-center"
    >
      <span className="text-white font-bold leading-none">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
