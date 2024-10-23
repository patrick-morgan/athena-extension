import {
  analyzePublication,
  getPublicationArticles,
  PublicationAnalysisResponse,
} from "@/api/api";
import { ArticleModel } from "@/types";
import { formatDate, formatDateFounded } from "@/utils/date";
import { motion } from "framer-motion";
import { AlertCircle, ChevronLeft, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";
import { logEvent } from "../../analytics";
import { initiateSubscription } from "../api/stripe";
import { useAuth } from "../AuthContext";
import { BiasAnalysisCard } from "./BiasAnalysisCard";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

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
  const { isSubscribed, user } = useAuth();
  const isPremium = isSubscribed;
  console.log("Publication Page publicationId:", publicationId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publicationData, articlesData] = await Promise.all([
          analyzePublication({ publicationId }),
          getPublicationArticles(publicationId),
        ]);
        console.log("pub data", publicationData);
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

  const handleSubscribe = async () => {
    if (user) {
      try {
        const checkoutUrl = await initiateSubscription();
        window.open(checkoutUrl, "_blank");
        logEvent("subscription_initiated", { userId: user.uid });
      } catch (error) {
        console.error("Error initiating subscription:", error);
        logEvent("subscription_error", {
          error: (error as Error).message,
        });
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
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PublicationInfoCard publicationResponse={publication} />

        {isPremium ? (
          <BiasAnalysisCard
            biasScore={publication.analysis.bias_score * 1}
            rhetoricScore={publication.analysis.rhetoric_score * 1}
            summary={publication.analysis.summary}
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
              Get access to in-depth publication analysis and bias scores.
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
            href={`https://${publicationResponse.publication.hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            {publicationResponse.publication.hostname}
          </a>
        </p>
        {publicationResponse.publication.date_founded && (
          <p>
            <span className="text-muted-foreground">Date Founded:</span>{" "}
            <span className="font-semibold">
              {formatDateFounded(publicationResponse.publication.date_founded)}
            </span>
          </p>
        )}
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
