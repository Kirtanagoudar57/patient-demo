import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { MissingApiNotice } from "../components/ui/States";
import { Avatar } from "../components/layout/Avatar";
import { RegisterForm } from "../components/forms/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

// The backend exposes only POST /auth/register for users. There is no endpoint
// to list, read, update or delete users, so this page offers account creation
// and shows the signed-in account, and is explicit about what's missing.
export default function Users() {
  const { user } = useAuth();
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [createdThisSession, setCreatedThisSession] = useState<string[]>([]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Accounts that can sign in to the dashboard."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" aria-hidden /> Create user
          </Button>
        }
      />

      <div className="space-y-6">
        <MissingApiNotice title="User listing isn't available yet">
          The backend can create users (<code className="rounded bg-amber-100 px-1">POST /auth/register</code>) but has no
          endpoints to list, view, edit or delete them. Search, sorting, pagination, editing and deletion will be added
          here once these exist: <code className="rounded bg-amber-100 px-1">GET /users</code>,{" "}
          <code className="rounded bg-amber-100 px-1">GET /users/{"{id}"}</code>,{" "}
          <code className="rounded bg-amber-100 px-1">PUT /users/{"{id}"}</code> and{" "}
          <code className="rounded bg-amber-100 px-1">DELETE /users/{"{id}"}</code>, ideally restricted to admins.
        </MissingApiNotice>

        <Card>
          <CardHeader title="Known accounts" description="Only accounts this browser knows about are shown." />
          <ul className="divide-y divide-slate-100">
            {user && (
              <li className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={user.username} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{user.username}</p>
                  <p className="text-xs text-slate-500">Signed in now</p>
                </div>
                <Badge tone="brand">You</Badge>
              </li>
            )}
            {createdThisSession.map((username) => (
              <li key={username} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={username} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{username}</p>
                  <p className="text-xs text-slate-500">Created during this session</p>
                </div>
                <Badge>New</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create user"
        description="The new user can sign in with these credentials."
      >
        <RegisterForm
          submitLabel="Create user"
          onSuccess={(username) => {
            toast.success("User created", `${username} can now sign in.`);
            setCreatedThisSession((list) => (list.includes(username) ? list : [...list, username]));
            setCreateOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
