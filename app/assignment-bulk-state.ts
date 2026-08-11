export type BulkActionState = {
  status: "idle" | "success" | "error";
  message: string;
  submissionId: number;
};

export const initialBulkActionState: BulkActionState = {
  status: "idle",
  message: "",
  submissionId: 0,
};
