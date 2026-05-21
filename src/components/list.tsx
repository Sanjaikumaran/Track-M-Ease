import Button from "./ui/button";

type ListActions = {
  label: string;
  onClick?: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

type ListProps<T extends object> = {
  header: string;
  items: T[];
  loading: boolean;
  children: React.ReactNode;
  actions?: ListActions[];
};

const List = <T extends object>({
  header,
  items,
  loading,
  children,
  actions,
}: ListProps<T>) => {
  return (
    <>
      <div className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-hidden rounded-lg bg-white shadow flex flex-col">
        <div className=" shadow-sm flex justify-between">
          <div className=" px-4 py-3">
            <h2 className="text-lg font-semibold">{header}</h2>

            <p className="text-sm text-gray-500">
              {items.length} entries found
            </p>
          </div>
          {actions && (
            <div className="flex items-center gap-2 p-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "primary"}
                  type={action.type || "button"}
                  className={action.className}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {loading && (
              <div className="rounded-lg border bg-gray-50 p-4">Loading...</div>
            )}

            {!loading && items.length === 0 && (
              <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
                No entries found
              </div>
            )}

            {!loading && children}
          </div>
        </div>
      </div>
    </>
  );
};

export default List;
