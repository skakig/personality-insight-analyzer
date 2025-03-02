
import { useState, useEffect } from "react";

export const NewsletterOptIn = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    const savedPreference = localStorage.getItem('newsletterOptIn') === 'true';
    setIsSubscribed(savedPreference);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    localStorage.setItem('newsletterOptIn', checked.toString());
    setIsSubscribed(checked);
  };
  
  return (
    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <input 
        type="checkbox" 
        className="rounded border-gray-300 text-primary focus:ring-primary"
        onChange={handleChange}
        checked={isSubscribed}
      />
      <span>Subscribe to our newsletter</span>
    </label>
  );
};
