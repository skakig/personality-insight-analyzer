import { CheckCircle2 } from "lucide-react";

interface CharacteristicsListProps {
  title: string;
  items: string[];
  icon: "primary" | "secondary";
}

export const CharacteristicsList = ({ title, items, icon }: CharacteristicsListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <CheckCircle2 className={`h-5 w-5 text-${icon}`} />
        {title}
      </h3>
      <ul className="space-y-2 text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className={`w-2 h-2 bg-${icon} rounded-full`}></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};