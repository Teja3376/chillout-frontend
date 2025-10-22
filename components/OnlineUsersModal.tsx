
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
  const onlineUsers = useOnlineUsers();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 border border-neon-green/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neon-green">Online Users</h2>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-transparent hover:bg-gray-800 rounded-full p-2"
          >
            ✕
          </Button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-neon-purple rounded-full flex items-center justify-center text-white font-bold">
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium">{user}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No users online</p>
          )}
        </div>
      </div>
    </div>
  );
}
