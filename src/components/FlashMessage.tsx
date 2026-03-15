type FlashMessageProps = {
  kind: "success" | "error";
  message: string;
};

export function FlashMessage({ kind, message }: FlashMessageProps) {
  if (!message) return null;

  return (
    <section
      className={`notice ${kind === "success" ? "notice-success" : "notice-error"}`}
      style={{ marginBottom: "18px" }}
    >
      <p>{message}</p>
    </section>
  );
}

