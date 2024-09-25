import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">About Athena</h1>
      <Card>
        <CardHeader>
          <CardTitle>People's Press</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We are a company called People's Press that is working on building a
            community of people passionate about the future of the media. Athena
            is one of our early projects aimed at providing users with deeper
            insights into news articles and media bias. If you are interested in
            joining the community, need support, or want to chat, reach out.
          </p>
          <Button
            variant="outline"
            onClick={() => window.open("https://peoplespress.news", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit our website
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
