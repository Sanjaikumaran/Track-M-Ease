const List = <T extends object>({
  header,
  items,
  loading,
  children,
}: {
  header: string;
  items: T[];
  loading: boolean;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className="sticky top-[88px] h-[calc(100vh-120px)] overflow-hidden rounded-lg bg-white shadow">
        <div className="shadow-sm  px-4 py-3">
          <h2 className="text-lg font-semibold">{header}</h2>

          <p className="text-sm text-gray-500">{items.length} entries found</p>
        </div>

        <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
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
