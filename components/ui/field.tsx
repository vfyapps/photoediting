import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint/error, wired together correctly:
 * - label is clickable (htmlFor -> id, generated if not passed)
 * - hint becomes the error message when `error` is set, and gets aria-describedby
 * - on submit, focus the first invalid field yourself (form-level concern, not this component's)
 */
export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactElement;
}

function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  const generatedId = React.useId();
  const id = htmlFor ?? generatedId;
  const describedById = error || hint ? `${id}-hint` : undefined;

  const control = React.cloneElement(children, {
    id,
    invalid: Boolean(error),
    "aria-describedby": describedById,
  } as Record<string, unknown>);

  return (
    <div className={cn("flex max-w-72 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-foreground">
        {label}
      </label>
      {control}
      {(error || hint) && (
        <span
          id={describedById}
          className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
}

export { Field };
