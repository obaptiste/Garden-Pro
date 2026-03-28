import React from "react";
import { Material } from "../types/schemas";
import { formatCurrency, parseCost } from "../lib/utils";
import { Copy, FileText, Table as TableIcon } from "lucide-react";

interface MaterialsTableProps {
  materials: Material[];
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({ materials }) => {
  const { categories, subtotals, grandTotal } = materials.reduce<{
    categories: string[];
    subtotals: Record<string, number>;
    grandTotal: number;
  }>(
    (acc, m) => {
      const cost = parseCost(m.estimatedTotalCost);
      if (!Object.hasOwn(acc.subtotals, m.category)) {
        acc.categories.push(m.category);
        acc.subtotals[m.category] = 0;
      }
      acc.subtotals[m.category] += cost;
      acc.grandTotal += cost;
      return acc;
    },
    { categories: [], subtotals: {}, grandTotal: 0 }
  );

  const copyAsCSV = () => {
    const headers = ["Category", "Item", "Quantity", "Unit Cost", "Total Cost", "Supplier", "Notes"];
    const rows = materials.map((m) => [
      m.category,
      m.item,
      m.quantity,
      m.estimatedUnitCost,
      m.estimatedTotalCost,
      m.supplier || "",
      m.notes || "",
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    navigator.clipboard.writeText(csvContent);
  };

  const copyAsText = () => {
    let text = "Materials & Equipment Breakdown\n\n";
    categories.forEach((cat) => {
      text += `--- ${cat.replaceAll("_", " ").toUpperCase()} ---\n`;
      materials
        .filter((m) => m.category === cat)
        .forEach((m) => {
          text += `${m.item}: ${m.quantity} @ ${m.estimatedUnitCost} = ${m.estimatedTotalCost}\n`;
        });
      text += `Subtotal: ${formatCurrency(subtotals[cat])}\n\n`;
    });
    text += `GRAND TOTAL: ${formatCurrency(grandTotal)}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-bottom border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <TableIcon size={18} />
          Materials & Equipment
        </h3>
        <div className="flex gap-2">
          <button
            onClick={copyAsCSV}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Copy size={14} /> CSV
          </button>
          <button
            onClick={copyAsText}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <FileText size={14} /> Text
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Unit Cost</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <tr className="bg-slate-100/50">
                  <td colSpan={5} className="px-4 py-1 font-bold text-slate-600 uppercase text-[10px]">
                    {cat.replaceAll("_", " ")}
                  </td>
                </tr>
                {materials
                  .filter((m) => m.category === cat)
                  .map((m, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">{m.item}</td>
                      <td className="px-4 py-2 text-slate-600">{m.quantity}</td>
                      <td className="px-4 py-2 text-slate-600">{m.estimatedUnitCost}</td>
                      <td className="px-4 py-2 font-semibold text-slate-800">{m.estimatedTotalCost}</td>
                      <td className="px-4 py-2 text-slate-500 italic">{m.supplier}</td>
                    </tr>
                  ))}
                <tr className="border-b border-slate-100">
                  <td colSpan={3} className="px-4 py-2 text-right text-slate-500 italic">
                    Subtotal
                  </td>
                  <td className="px-4 py-2 font-bold text-slate-800">{formatCurrency(subtotals[cat])}</td>
                  <td></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-800 text-white">
              <td colSpan={3} className="px-4 py-3 text-right font-bold uppercase tracking-wider">
                Grand Total
              </td>
              <td className="px-4 py-3 font-bold text-lg">{formatCurrency(grandTotal)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
