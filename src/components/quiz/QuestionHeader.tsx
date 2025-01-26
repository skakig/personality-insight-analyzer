interface QuestionHeaderProps {
  category?: string;
  subcategory?: string;
  question: string;
}

export const QuestionHeader = ({ category, subcategory, question }: QuestionHeaderProps) => {
  return (
    <>
      {(category || subcategory) && (
        <div className="mb-4 text-sm text-gray-500">
          <span className="font-medium text-primary">{category}</span>
          {subcategory && (
            <> • <span>{subcategory}</span></>
          )}
        </div>
      )}
      
      <h2 className="text-xl md:text-2xl font-medium mb-12 text-center">
        {question}
      </h2>
    </>
  );
};