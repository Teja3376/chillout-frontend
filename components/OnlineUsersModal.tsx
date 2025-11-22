
import { Button } from "@/components/ui/button";
import { useOnlineUsers } from "@/components/SocketProvider";

interface OnlineUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnlineUsersModal({
  isOpen,
  onClose,
}: OnlineUsersModalProps) {
  const onlineUsers = useOnlineUsers({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card/90 border border-border/50 rounded-2xl p-6 max-w-md w-full shadow-2xl ring-1 ring-white/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Online Users</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground rounded-full p-2 h-8 w-8"
          >
            ✕
          </Button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-accent/30 rounded-xl border border-border/30 transition-colors hover:bg-accent/50"
              >
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm ring-1 ring-primary/30">
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground font-medium text-sm">{user}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8 text-sm">No users online</p>
          )}
        </div>
      </div>
    </div>
  );
}
