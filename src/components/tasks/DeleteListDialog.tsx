import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useListStore, type List } from "@/stores/listStore";

type Props = {
  open: boolean;
  onClose: () => void;
  list: List | null;
};

export default function DeleteListDialog({ open, onClose, list }: Props) {
  const { deleteList } = useListStore();

  async function handleDelete() {
    if (!list) return;
    await deleteList(list.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-sm">Delete "{list?.name}"?</DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            This will permanently delete the list and all tasks inside it. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
