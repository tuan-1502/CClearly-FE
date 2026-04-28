const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

const TableBody = ({ children }) => {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
};

const TableRow = ({ children, className = '' }) => {
  return <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>;
};

const TableHead = ({ children, className = '' }) => {
  return (
    <th
      className={`px-4 py-3 text-left text-sm font-medium text-gray-500 ${className}`}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '' }) => {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;

