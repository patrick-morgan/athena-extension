import React, { useEffect, useState } from "react";
import {
  analyzePublication,
  getPublicationArticles,
  PublicationAnalysisResponse,
} from "@/api/api";
import { ArticleModel } from "@/types";
import { formatDate } from "@/utils/date";
import { motion } from "framer-motion";
import { ChevronLeft, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { BiasAnalysisCard } from "./BiasAnalysisCard";

interface PublicationPageProps {
  publicationId: string;
  onBack: () => void;
}

export const PublicationPage: React.FC<PublicationPageProps> = ({
  publicationId,
  onBack,
}) => {
  const [publication, setPublication] =
    useState<PublicationAnalysisResponse | null>(null);
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publicationData, articlesData] = await Promise.all([
          analyzePublication({ publicationId }),
          getPublicationArticles(publicationId),
        ]);
        setPublication(publicationData);
        setArticles(articlesData?.articles ?? []);
      } catch (err) {
        setError("Failed to load publication data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicationId]);

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading || !publication) {
    return <PublicationSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-6"
    >
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {/* <h1 className="text-3xl font-bold text-primary">
          {publication.publication.name}
        </h1> */}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PublicationInfoCard publicationResponse={publication} />
        <BiasAnalysisCard
          biasScore={publication.analysis.bias_score * 1}
          rhetoricScore={publication.analysis.rhetoric_score * 1}
          summary={publication.analysis.summary}
        />
      </section>

      <ArticlesList articles={articles} />
    </motion.div>
  );
};

const PublicationInfoCard: React.FC<{
  publicationResponse: PublicationAnalysisResponse;
}> = ({ publicationResponse }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {publicationResponse.publication.name}
      </h2>
      <div className="space-y-2">
        <p>
          <span className="text-muted-foreground">Website:</span>{" "}
          <a
            href={publicationResponse.publication.hostname}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            {publicationResponse.publication.hostname}
          </a>
        </p>
        <p>
          <span className="text-muted-foreground">Articles Analyzed:</span>{" "}
          <span className="font-semibold">
            {publicationResponse.analysis.num_articles_analyzed}
          </span>
        </p>
      </div>
    </CardContent>
  </Card>
);

const ArticlesList: React.FC<{ articles: ArticleModel[] }> = ({ articles }) => (
  <section>
    <h2 className="text-2xl font-semibold mb-4">Recent Articles</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.slice(0, 9).map((article, index) => (
        <motion.a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-card rounded-lg hover:bg-accent transition-colors duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {formatDate(article.date_published)}
          </p>
          <ExternalLink className="h-4 w-4 text-primary" />
        </motion.a>
      ))}
    </div>
  </section>
);

const PublicationSkeleton: React.FC = () => (
  <div className="space-y-8 p-6">
    <Skeleton className="h-10 w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);

export default PublicationPage;
