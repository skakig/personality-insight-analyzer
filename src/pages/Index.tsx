import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 gradient-bg text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Moral Level
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Understand where you stand in the moral hierarchy and learn how to advance to higher levels of ethical development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/test")}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Take the Test
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/book")}
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Take the Moral Level Test?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Self-Understanding</h3>
              <p className="text-gray-600">
                Gain deep insights into your moral reasoning and ethical decision-making process.
              </p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Growth Path</h3>
              <p className="text-gray-600">
                Discover concrete steps to advance to higher levels of moral development.
              </p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-gray-600">
                Connect with others on similar moral development journeys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Take the first step towards understanding and improving your moral reasoning.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/test")}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Start Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
