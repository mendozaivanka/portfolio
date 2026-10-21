import { copyText } from "../lib/toast";
import { CopyIcon } from "./icons";

export default function CopyEmailButton({ email }: { email: string }) {
  return (
    <button className="btn btn-outline" type="button" onClick={() => copyText(email)}>
      <CopyIcon size={15} />
      Copy address
    </button>
  );
}
