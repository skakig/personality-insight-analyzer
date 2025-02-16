
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">About The Moral Hierarchy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          The Moral Hierarchy is dedicated to helping individuals and organizations understand
          and elevate their moral development through scientific assessment, AI-powered
          analysis, and actionable insights.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="mb-6">
          We believe that moral growth is a journey that requires understanding,
          commitment, and continuous reflection. Through our platform, we provide the
          tools and insights needed to navigate this journey effectively.
        </p>
        <div className="mt-12">
          <Button onClick={() => navigate("/")} className="mr-4">
            Take the Assessment
          </Button>
          <Button variant="outline" onClick={() => navigate("/contact")}>
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
