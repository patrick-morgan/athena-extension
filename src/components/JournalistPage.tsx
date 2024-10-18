import React, { useEffect, useState } from "react";
import { analyzeJournalist, getJournalistArticles } from "@/api/api";
import {
  ArticleModel,
  JournalistBiasWithNameModel,
  PublicationModel,
} from "@/types";
import { formatDate } from "@/utils/date";
import { motion } from "framer-motion";
import { ChevronLeft, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import ReactMarkdown from "react-markdown";

interface JournalistPageProps {
  journalistId: string;
  publication: PublicationModel | null;
  onBack: () => void;
}

export const JournalistPage: React.FC<JournalistPageProps> = ({
  journalistId,
  publication,
  onBack,
}) => {
  const [journalist, setJournalist] =
    useState<JournalistBiasWithNameModel | null>(null);
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [journalistData, articlesData] = await Promise.all([
          analyzeJournalist({ journalistId }),
          getJournalistArticles(journalistId),
        ]);
        setJournalist(journalistData);
        setArticles(articlesData?.articles ?? []);
      } catch (err) {
        setError("Failed to load journalist data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [journalistId]);

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading || !journalist) {
    return <JournalistSkeleton />;
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
        <h1 className="text-3xl font-bold text-primary">{journalist.name}</h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JournalistInfoCard journalist={journalist} publication={publication} />
        <BiasAnalysisCard journalist={journalist} />
      </section>

      <ArticlesList articles={articles} />
    </motion.div>
  );
};

const JournalistInfoCard: React.FC<{
  journalist: JournalistBiasWithNameModel;
  publication: PublicationModel | null;
}> = ({ journalist, publication }) => (
  <Card>
    <CardContent className="p-6">
      {/* <h2 className="text-2xl font-semibold mb-4">{journalist.name}</h2> */}
      <div className="space-y-2">
        <p>
          <span className="text-muted-foreground">Articles Analyzed:</span>{" "}
          <span className="font-semibold">
            {journalist.num_articles_analyzed}
          </span>
        </p>
        {publication && (
          <p>
            <span className="text-muted-foreground">Publication:</span>{" "}
            <span className="font-semibold">
              {publication.name ?? publication.hostname}
            </span>
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

const renderMarkdown = (content: string) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => (
          <p className="text-muted-foreground text-xs" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-muted-foreground text-xs" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 space-y-2" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const BiasAnalysisCard: React.FC<{
  journalist: JournalistBiasWithNameModel;
}> = ({ journalist }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="text-xl font-semibold mb-4">Bias Analysis</h2>
      <div className="space-y-4">
        <BiasBar
          label="Political Bias"
          value={journalist.bias_score}
          leftLabel="Left"
          rightLabel="Right"
        />
        <BiasBar
          label="Writing Style"
          value={journalist.rhetoric_score}
          leftLabel="Opinion"
          rightLabel="Factual"
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {renderMarkdown(journalist.summary)}
      </p>
    </CardContent>
  </Card>
);

const BiasBar: React.FC<{
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}> = ({ label, value, leftLabel, rightLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${value * 1}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{(value * 1).toFixed(1)}%</span>
    </div>
  </div>
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

const JournalistSkeleton: React.FC = () => (
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

export default JournalistPage;
