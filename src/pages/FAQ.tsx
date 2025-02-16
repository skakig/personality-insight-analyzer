
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="max-w-3xl">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>What is The Moral Hierarchy?</AccordionTrigger>
            <AccordionContent>
              The Moral Hierarchy is a framework for understanding and measuring moral development,
              helping individuals and organizations grow through scientific assessment and
              AI-powered analysis.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does the assessment work?</AccordionTrigger>
            <AccordionContent>
              Our assessment uses a combination of carefully crafted questions and
              scenarios to evaluate your moral reasoning and decision-making patterns.
              The results are analyzed using advanced AI to provide personalized insights.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is my data private?</AccordionTrigger>
            <AccordionContent>
              Yes, we take privacy very seriously. All assessment data is encrypted
              and stored securely. We never share individual results without explicit
              permission.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-12">
          <Button className="w-full sm:w-auto">
            Take the Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
