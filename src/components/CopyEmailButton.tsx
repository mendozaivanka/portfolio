import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/toast";

export default function CopyEmailButton({ email }: { email: string }) {
  return (
    <Button variant="outline" size="lg" onClick={() => copyText(email)} className="no-js:hidden">
      <CopyIcon />
      Copy address
    </Button>
  );
}
