import { FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "wouter";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WalkInServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function WalkInServiceDialog({
  open,
  onOpenChange,
}: WalkInServiceDialogProps) {
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t.services_walkin_dialog_close}
        className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-slate-200 p-6 sm:p-8"
      >
        <DialogHeader className="items-center gap-3 pt-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <FaMapMarkerAlt aria-hidden="true" className="text-xl" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-[#071B4A]">
            {t.services_walkin_dialog_title}
          </DialogTitle>
          <DialogDescription className="max-w-sm leading-relaxed text-slate-600">
            {t.services_walkin_dialog_description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row sm:justify-center sm:space-x-0">
          <Button asChild className="btn-gold h-11 w-full gap-2 rounded-xl font-bold sm:w-auto">
            <Link href="/contact">
              {t.services_walkin_dialog_contact}
              <FaArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            {t.services_walkin_dialog_close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}