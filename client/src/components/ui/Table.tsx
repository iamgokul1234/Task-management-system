import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<TableProps> = ({ children }) => {
  return <thead className="bg-slate-50">{children}</thead>;
};

export const TableBody: React.FC<TableProps> = ({ children }) => {
  return <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>;
};

export const TableRow: React.FC<TableProps> = ({ children, className = '' }) => {
  return <tr className={`hover:bg-slate-50/50 transition-colors ${className}`}>{children}</tr>;
};

export const TableHeader: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:px-6 ${className}`}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableProps & { colSpan?: number }> = ({ children, className = '', colSpan }) => {
  return (
    <td className={`px-3 py-4 text-sm text-slate-900 sm:px-6 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
};
