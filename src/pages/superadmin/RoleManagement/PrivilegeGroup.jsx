import { useState } from "react";
import { ChevronRight } from "lucide-react";

function PrivilegeGroup({ module, selectedPrivileges, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedCount = module.privileges.filter(p => 
    selectedPrivileges.includes(p.id)
  ).length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={`text-lg transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <span className="font-semibold text-slate-900">{module.name}</span>
          <span className="text-sm text-amber-600">
            ({module.privileges.length} privileges)
          </span>
        </div>
        {selectedCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {selectedCount} selected
          </span>
        )}
      </button>

      {/* Privileges List */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          {module.privileges.map((privilege) => (
            <label
              key={privilege.id}
              className="flex items-start gap-3 p-4 hover:bg-white cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedPrivileges.includes(privilege.id)}
                onChange={() => onToggle(privilege.id)}
                className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="font-medium text-slate-900">{privilege.name}</p>
                <p className="text-sm text-green-600">{privilege.description}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrivilegeGroup;
