
interface PriceDisplayProps {
  originalPrice: string | null;
  discountedPrice: string;
}

export const PriceDisplay = ({
  originalPrice,
  discountedPrice
}: PriceDisplayProps) => {
  return (
    <div className="mb-4 space-y-1">
      <h3 className="text-xl font-semibold">Unlock Your Full Report</h3>
      
      <div className="flex items-center justify-center space-x-2">
        {originalPrice && (
          <span className="text-lg text-gray-500 line-through">{originalPrice}</span>
        )}
        <span className="text-3xl font-bold text-primary">{discountedPrice}</span>
      </div>
      
      {originalPrice && (
        <p className="text-sm text-green-600 font-medium">Discount Applied!</p>
      )}
    </div>
  );
};
