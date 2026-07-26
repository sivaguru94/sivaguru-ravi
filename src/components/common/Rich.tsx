/* Renders content strings with **bold** spans (the only markup the content
 * layer supports — everything else is plain text). */
export function Rich({
  text,
  boldClassName,
}: {
  text: string;
  boldClassName?: string;
}) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} className={boldClassName}>
            {part}
          </b>
        ) : (
          part
        ),
      )}
    </>
  );
}
