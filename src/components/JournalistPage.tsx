import { analyzeJournalist, getJournalistArticles } from "@/api/api";
import {
  ArticleModel,
  JournalistBiasWithNameModel,
  PublicationModel,
} from "@/types";
import { formatDate } from "@/utils/date";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import { NumberLine } from "./NumberLine";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface JournalistPageProps {
  journalistId: string;
  publication: PublicationModel | null;
  //   journalist: {
  //     id: string;
  //     name: string;
  //     numArticlesAnalyzed: number;
  //     publication: string;
  //     biasScore: number;
  //     rhetoricScore: number;
  //     analysis: string;
  //     // articles: Array<{ title: string; url: string; date: string }>;
  //   };
  onBack: () => void;
}

export const JournalistPage: React.FC<JournalistPageProps> = ({
  journalistId,
  publication,
  onBack,
}) => {
  const [loadingJournalist, setLoadingJournalist] = useState(true);
  const [journalistBias, setJournalistBias] =
    useState<JournalistBiasWithNameModel | null>(null);
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  console.log("journalist", journalistBias);

  useEffect(() => {
    // Get journalist bias
    console.log("getting bias for", journalistId);
    analyzeJournalist({ journalistId }).then((j) => {
      console.log("resp", j);
      setJournalistBias(j);
      setLoadingJournalist(false);
    });

    // Fetch journalist's articles
    getJournalistArticles(journalistId).then((data) => {
      setArticles(data?.articles ?? []);
      setLoadingArticles(false);
    });
  }, [journalistId]);

  if (loadingJournalist) {
    return <Skeleton className="w-full h-24" />;
  }
  if (!journalistBias) {
    return <div>error getting journalist</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{journalistBias.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journalist Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Articles Analyzed: {journalistBias.num_articles_analyzed}</p>
          {publication && (
            <p>Publication: {publication.name ?? publication.hostname}</p>
          )}
        </CardContent>
      </Card>

      <CollapsibleCard
        title="Bias Analysis"
        tooltipText="Analysis based on the journalist's writing style and content"
        expandedContent={
          <p className="text-sm text-muted-foreground">
            {journalistBias.summary}
          </p>
        }
      >
        <div className="space-y-4">
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={journalistBias.bias_score}
          />
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={journalistBias.rhetoric_score}
          />
        </div>
      </CollapsibleCard>

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {loadingArticles ? (
              <Skeleton className="w-full h-24" />
            ) : (
              <>
                {articles.map((article, index) => (
                  <li key={index}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {article.title}
                    </a>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatDate(article.date_published)}
                    </span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
