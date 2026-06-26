import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Calendar({ className, selected, onSelect, mode = "single", ...props }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(selected || today);
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  
  const isSelected = (d) => selected && selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year;
  const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 hover:bg-accent rounded-md"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm font-medium">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-accent rounded-md"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {DAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div key={i} className="text-center">
            {d ? (
              <button
                onClick={() => onSelect?.(new Date(year, month, d))}
                className={cn("w-8 h-8 rounded-md text-sm hover:bg-accent",
                  isSelected(d) && "bg-primary text-primary-foreground hover:bg-primary",
                  isToday(d) && !isSelected(d) && "border border-primary"
                )}
              >{d}</button>
            ) : <div />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Calendar };
