import Button from "../components/ui/button";
import { sendNotificationWorker } from "../lib/helpers";
import { useAttendanceStore } from "../store/useAttendanceStore";

export function AttendanceDebugPanel() {
  const store = useAttendanceStore();

  return (
    <div className="">
      <h2 className="mb-2 font-bold">Attendance Debug</h2>
      <div className="space-y-1">
        <div>
          <strong>State:</strong> {store.state}
        </div>
        <div>
          <strong>Modal Open:</strong> {store.modalOpen ? "Yes" : "No"}
        </div>
        <div>
          <strong>Modal Mode:</strong> {store.modalMode}
        </div>
        <div>
          <strong>Present Marked:</strong> {store.presentMarked ? "Yes" : "No"}
        </div>
        <div>
          <strong>Present Time:</strong>{" "}
          {store.presentTime
            ? new Date(store.presentTime).toLocaleString()
            : "-"}
        </div>
        <div>
          <strong>Snoozed Until:</strong>{" "}
          {store.snoozedUntil
            ? new Date(store.snoozedUntil).toLocaleTimeString()
            : "-"}
        </div>
        <div>
          <strong>Last Sign Out:</strong> {store.lastSignOutDate ?? "-"}
        </div>
      </div>
      <hr className="my-2" />
      <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-2 text-[10px]">
        {JSON.stringify(store, null, 2)}
      </pre>
      <Button
        variant="primary"
        onClick={async () => {
          sendNotificationWorker(
            "Test Notification",
            "This is a test notification from the worker",
          );
        }}
      >
        Test Notification
      </Button>
      <div>Permission: {Notification.permission}</div>
      <Button
        onClick={async () => {
          const result = await Notification.requestPermission();
          alert(result);
        }}
      >
        Request Permission
      </Button>
      <button
        onClick={() => {
          store.resetDay();
          localStorage.clear();
        }}
        className="mt-2 w-full rounded bg-blue-500 px-2 py-1 text-white"
      >
        Reset Day
      </button>
    </div>
  );
}
