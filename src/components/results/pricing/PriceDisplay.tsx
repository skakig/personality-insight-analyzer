
interface PriceDisplayProps {
  originalPrice: string;
  discountedPrice: string;
}

export const PriceDisplay = ({ originalPrice, discountedPrice }: PriceDisplayProps) => {
  return (
    <div className="mb-8">
      <p className="text-3xl font-bold mb-2">
        <span className="text-primary line-through opacity-75">{originalPrice}</span>
        <span className="ml-3">{discountedPrice}</span>
      </p>
      <p className="text-sm text-gray-500">Limited Time Offer</p>
    </div>
  );
};
