import React, { useEffect, useState } from "react";
import {
  analyzeJournalist,
  getJournalistArticles,
  UserUsageResponse,
} from "@/api/api";
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
import { BiasAnalysisCard } from "./BiasAnalysisCard";
import { useAuth } from "@/AuthContext";
import { initiateSubscription } from "../api/stripe";
import { logger } from "@/logger";

interface JournalistPageProps {
  journalistId: string;
  publication: PublicationModel | null;
  onPublicationClick: () => void;
  onBack: () => void;
  usage: UserUsageResponse | null;
}

export const JournalistPage: React.FC<JournalistPageProps> = ({
  journalistId,
  publication,
  onPublicationClick,
  onBack,
  usage,
}) => {
  const [journalist, setJournalist] =
    useState<JournalistBiasWithNameModel | null>(null);
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSubscribed, user } = useAuth();
  const isPremium = isSubscribed;
  logger.log("Analyzing journalist", journalistId);

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

  const handleSubscribe = async () => {
    if (user) {
      try {
        const checkoutUrl = await initiateSubscription();
        window.open(checkoutUrl, "_blank");
        // logEvent("subscription_initiated", { userId: user.uid });
      } catch (error) {
        console.error("Error initiating subscription:", error);
        // logEvent("subscription_error", {
        //   error: (error as Error).message,
        // });
      }
    }
  };

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
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JournalistInfoCard
          journalist={journalist}
          publication={publication}
          onPublicationClick={onPublicationClick}
        />

        {isPremium || (usage?.articlesRemaining ?? -1) >= 0 ? (
          <BiasAnalysisCard
            biasScore={journalist.bias_score * 1}
            rhetoricScore={journalist.rhetoric_score * 1}
            summary={journalist.summary}
          />
        ) : (
          <Card>
            <CardContent>
              <motion.div
                className="filter blur-sm select-none"
                whileHover={{ scale: 1.05 }}
              >
                <BiasAnalysisCard
                  biasScore={-500}
                  rhetoricScore={-500}
                  summary={"You're not getting the biases that easy, buddy!"}
                />
              </motion.div>
            </CardContent>
          </Card>
        )}

        {!isPremium && (
          <div className="mt-6 mb-2 text-center">
            <h3 className="text-xl font-semibold mb-4">
              Unlock Premium Features
            </h3>
            <p className="mb-4">
              Get access to unlimited in-depth journalist analyses and bias
              scores.
            </p>
            <Button onClick={handleSubscribe}>
              Upgrade to Premium for $5/month
            </Button>
          </div>
        )}
      </section>

      <ArticlesList articles={articles} />
    </motion.div>
  );
};

const JournalistInfoCard: React.FC<{
  journalist: JournalistBiasWithNameModel;
  publication: PublicationModel | null;
  onPublicationClick: () => void;
}> = ({ journalist, publication, onPublicationClick }) => (
  <Card>
    <CardContent className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{journalist.name}</h2>
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
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={onPublicationClick}
            >
              {publication.name ?? publication.hostname}
            </Button>
          </p>
        )}
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
